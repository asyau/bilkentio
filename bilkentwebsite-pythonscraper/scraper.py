import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import chromadb
from chromadb.utils import embedding_functions
import json
import time
import torch
import os
from collections import deque
import logging
from requests.exceptions import RequestException, HTTPError, Timeout

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BilkentScraper:
    def __init__(self):
        self.start_url = "https://w3.bilkent.edu.tr/"
        self.visited_urls = set()
        self.failed_urls = set()
        self.data = []
        self.url_stack = deque([self.start_url])
        
        # Create data directory if it doesn't exist
        os.makedirs('data', exist_ok=True)
        
        # Try to load previous progress
        self.load_previous_progress()
        
        # Initialize ChromaDB with the same embedding function as verify_data.py
        self.chroma_client = chromadb.PersistentClient(path="./data/chroma")
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
            device="cuda" if torch.cuda.is_available() else "cpu"
        )
        
        try:
            self.collection = self.chroma_client.get_collection(
                name="bilkent_knowledge",
                embedding_function=self.embedding_function
            )
            logger.info("Found existing collection")
        except:
            logger.info("Creating new collection")
            self.collection = self.chroma_client.create_collection(
                name="bilkent_knowledge",
                embedding_function=self.embedding_function
            )
    
    def load_previous_progress(self):
        """Load previously scraped URLs and data"""
        try:
            if os.path.exists('data/visited_urls.json'):
                with open('data/visited_urls.json', 'r') as f:
                    self.visited_urls = set(json.load(f))
                logger.info(f"Loaded {len(self.visited_urls)} previously visited URLs")
            
            if os.path.exists('data/failed_urls.json'):
                with open('data/failed_urls.json', 'r') as f:
                    self.failed_urls = set(json.load(f))
                logger.info(f"Loaded {len(self.failed_urls)} previously failed URLs")
            
            if os.path.exists('data/bilkent_data.json'):
                with open('data/bilkent_data.json', 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
                logger.info(f"Loaded {len(self.data)} previously scraped pages")
        except Exception as e:
            logger.error(f"Error loading previous progress: {str(e)}")
        
    def is_valid_url(self, url):
        """Check if URL is from w3.bilkent.edu.tr and is either .html or a directory"""
        parsed = urlparse(url)
        
        # Skip URLs containing specific patterns
        if any(pattern in url for pattern in ["ayin-sorusu-", "toplanti-kararlari"]):
            return False
        
        # Skip specific paths and file types
        invalid_paths = [
            '/web/emblem',
            '/images',
            '/img',
            '/css',
            '/js',
            '/assets',
            '/static',
            '/icons',
            '/fonts',
            '/downloads',
            '/media',
            '/videos',
            '/audio',
            '/documents',
            '/attachments'
        ]
        
        # List of invalid extensions to skip
        invalid_extensions = [
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp',
            '.zip', '.rar', '.7z', '.tar', '.gz',
            '.css', '.js', '.json', '.xml', '.rss',
            '.ico', '.woff', '.woff2', '.ttf', '.eot', '.svg',
            '.mp3', '.mp4', '.wav', '.avi', '.mov', '.wmv',
            '.php', '.asp', '.aspx', '.jsp', '.cgi',
            '.txt', '.csv', '.rtf'
        ]
        
        # Check for invalid extensions
        if any(url.lower().endswith(ext) for ext in invalid_extensions):
            return False
        
        # Allow both .html files and URLs without file extensions (directories)
        path = parsed.path.lower()
        if not (path.endswith('.html') or path.endswith('/') or '.' not in path.split('/')[-1]):
            return False
        
        # Check if URL path starts with any invalid paths
        if any(parsed.path.startswith(path) for path in invalid_paths):
            return False
        
        return (
            parsed.netloc == "w3.bilkent.edu.tr" and
            '#' not in url and
            'mailto:' not in url and
            url not in self.failed_urls and
            url not in self.visited_urls
        )
    
    def clean_text(self, text):
        """Clean and normalize text content more aggressively"""
        if not text:
            return ""
        
        # Remove extra whitespace and normalize
        text = ' '.join(text.split())
        
        # Keep only meaningful characters
        text = ''.join(c for c in text if c.isalnum() or c.isspace())
        
        # Limit text length to avoid huge chunks
        return text
    
    def extract_content(self, soup):
        """Extract and process meaningful content from the page"""
        # First check if page has enough text content
        text_content = soup.get_text(strip=True)
        if len(text_content) < 100:  # Skip pages with very little text
            return []
        
        # Priority elements that usually contain main content
        main_content = soup.find(['main', 'article', 'div.content', 'div.main-content'])
        
        if main_content:
            content_elements = main_content.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        else:
            content_elements = soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        
        text_chunks = []
        seen_content = set()  # Use set for O(1) lookup to avoid duplicates
        
        for element in content_elements:
            text = element.get_text(strip=True)
            # Only keep meaningful content with reasonable length
            if text and 20 < len(text) < 500:
                cleaned_text = self.clean_text(text)
                # Use hash of text to check for duplicates
                text_hash = hash(cleaned_text)
                if cleaned_text and text_hash not in seen_content:
                    text_chunks.append(cleaned_text)
                    seen_content.add(text_hash)
        
        # Limit total content size
        return text_chunks[:5]  # Keep only top 5 most relevant text chunks
    
    def scrape_with_dfs(self):
        """Scrape website using DFS approach"""
        visited_hashes = set()  # Track content hashes to avoid duplicate content
        
        while self.url_stack:
            current_url = self.url_stack.pop()  # DFS uses pop() to get the most recently added URL
            
            if current_url in self.visited_urls or current_url in self.failed_urls:
                continue
            
            try:
                logger.info(f"Scraping: {current_url}")
                response = requests.get(current_url, timeout=10, allow_redirects=True)
                response.raise_for_status()
                response.encoding = 'utf-8'
                
                # Add URL to visited set immediately to prevent duplicates
                self.visited_urls.add(current_url)
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract content using the method
                text_content = self.extract_content(soup)
                
                if text_content:
                    # Generate content hash
                    content_hash = hash(''.join(text_content))
                    
                    # Only save if content is unique
                    if content_hash not in visited_hashes:
                        visited_hashes.add(content_hash)
                        self.data.append({
                            'url': current_url,
                            'content': text_content,
                            'title': self.clean_text(soup.title.string) if soup.title else '',
                            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                        })
                        
                        if len(self.data) % 10 == 0:
                            self.save_progress()
                
                # Find and add new URLs to stack
                links = soup.find_all('a', href=True)
                new_urls = []
                for link in links:
                    next_url = urljoin(current_url, link['href'])
                    if self.is_valid_url(next_url):
                        new_urls.append(next_url)
                
                # Add new URLs to stack in reverse order for DFS
                # This ensures we explore depth-first by adding child URLs in reverse order
                for url in reversed(new_urls):
                    if url not in self.url_stack:  # Avoid duplicate URLs in stack
                        self.url_stack.append(url)
                
                time.sleep(1)  # Be nice to the server
                
            except Exception as e:
                logger.error(f"Error scraping {current_url}: {str(e)}")
                self.failed_urls.add(current_url)
    
    def scrape_with_bfs(self):
        """Scrape website using BFS approach"""
        visited_hashes = set()  # Track content hashes to avoid duplicate content
        url_queue = deque([self.start_url])  # Use queue for BFS
        
        while url_queue:
            current_url = url_queue.popleft()  # BFS uses popleft() to get the earliest added URL
            
            if current_url in self.visited_urls or current_url in self.failed_urls:
                continue
            
            try:
                logger.info(f"Scraping: {current_url}")
                response = requests.get(current_url, timeout=10, allow_redirects=True)
                response.raise_for_status()
                response.encoding = 'utf-8'
                
                # Add URL to visited set immediately to prevent duplicates
                self.visited_urls.add(current_url)
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract content using the method
                text_content = self.extract_content(soup)
                
                if text_content:
                    # Generate content hash
                    content_hash = hash(''.join(text_content))
                    
                    # Only save if content is unique
                    if content_hash not in visited_hashes:
                        visited_hashes.add(content_hash)
                        self.data.append({
                            'url': current_url,
                            'content': text_content,
                            'title': self.clean_text(soup.title.string) if soup.title else '',
                            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                        })
                        
                        if len(self.data) % 10 == 0:
                            self.save_progress()
                
                # Find and add new URLs to queue
                links = soup.find_all('a', href=True)
                for link in links:
                    next_url = urljoin(current_url, link['href'])
                    if self.is_valid_url(next_url) and next_url not in url_queue:
                        url_queue.append(next_url)  # Add to end of queue for BFS
                
                time.sleep(1)  # Be nice to the server
                
            except Exception as e:
                logger.error(f"Error scraping {current_url}: {str(e)}")
                self.failed_urls.add(current_url)
    
    def save_progress(self):
        """Save current progress to files"""
        try:
            with open('data/bilkent_data.json', 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
            
            with open('data/visited_urls.json', 'w') as f:
                json.dump(list(self.visited_urls), f)
            
            with open('data/failed_urls.json', 'w') as f:
                json.dump(list(self.failed_urls), f)
                
            logger.info(f"Progress saved: {len(self.data)} pages scraped, "
                       f"{len(self.visited_urls)} URLs visited, "
                       f"{len(self.failed_urls)} URLs failed")
        except Exception as e:
            logger.error(f"Error saving progress: {str(e)}")
    
    def start_scraping(self, method='bfs'):
        """Start the scraping process with specified method"""
        logger.info(f"Starting scraping using {method.upper()}...")
        
        try:
            if method.lower() == 'bfs':
                self.scrape_with_bfs()
            else:
                self.scrape_with_dfs()
            
            logger.info(f"Scraping completed: {len(self.data)} pages scraped")
            self.save_progress()
            
            # Add to ChromaDB
            logger.info("Adding to ChromaDB...")
            batch_size = 50
            for i in range(0, len(self.data), batch_size):
                batch = self.data[i:i + batch_size]
                try:
                    self.collection.add(
                        documents=[item['content'] for item in batch],
                        metadatas=[{
                            "source": item['url'],
                            "title": item['title'],
                            "timestamp": item['timestamp']
                        } for item in batch],
                        ids=[f"doc_{i + j}" for j in range(len(batch))]
                    )
                    logger.info(f"Added batch {i//batch_size + 1}/{(len(self.data) + batch_size - 1)//batch_size}")
                except Exception as e:
                    logger.error(f"Error adding batch to ChromaDB: {str(e)}")
            
            logger.info("Scraping completed successfully")
            
        except KeyboardInterrupt:
            logger.info("Scraping interrupted by user")
            self.save_progress()
        except Exception as e:
            logger.error(f"Error during scraping: {str(e)}")
            self.save_progress()
    
    def clean_database(self):
        """Clean all stored data and restart from scratch"""
        try:
            # Remove JSON files
            data_files = ['data/bilkent_data.json', 'data/visited_urls.json', 'data/failed_urls.json']
            for file in data_files:
                if os.path.exists(file):
                    os.remove(file)
                    logger.info(f"Removed {file}")
            
            # Reset instance variables
            self.visited_urls = set()
            self.failed_urls = set()
            self.data = []
            self.url_stack = deque([self.start_url])
            
            logger.info("Database cleaned and reinitialized successfully")
            
        except Exception as e:
            logger.error(f"Error cleaning database: {str(e)}")

if __name__ == "__main__":
    scraper = BilkentScraper()
    scraper.clean_database()  # Optional: clean before starting
    scraper.start_scraping(method='bfs')  # Use BFS method