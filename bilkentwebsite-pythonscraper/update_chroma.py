import chromadb
import json
import logging
from chromadb.utils import embedding_functions
import shutil
import os
import torch

# Disable CoreML
os.environ["DISABLE_COREML"] = "1"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_chroma():
    try:
        # Load scraped data
        with open('data/bilkent_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Delete existing ChromaDB directory
        chroma_dir = "./data/chroma"
        if os.path.exists(chroma_dir):
            shutil.rmtree(chroma_dir)
            logger.info("Deleted existing ChromaDB directory")
        
        # Initialize ChromaDB with sentence-transformers
        embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
            device="cuda" if torch.cuda.is_available() else "cpu"
        )
        
        # Initialize ChromaDB
        client = chromadb.PersistentClient(path=chroma_dir)
        
        # Create new collection
        collection = client.create_collection(
            name="bilkent_knowledge",
            embedding_function=embedding_function,
            metadata={"hnsw:space": "cosine"}
        )
        logger.info("Created new collection")
        
        # Process data to join content lists into strings
        processed_data = []
        for item in data:
            if isinstance(item['content'], list):
                # Join the content list with spaces
                content = ' '.join(item['content'])
            else:
                content = str(item['content'])
            
            processed_data.append({
                'content': content,
                'url': item['url'],
                'title': item['title'],
                'timestamp': item['timestamp']
            })
        
        # Add data in batches
        batch_size = 50
        total_batches = (len(processed_data) + batch_size - 1) // batch_size
        
        for i in range(0, len(processed_data), batch_size):
            batch = processed_data[i:i + batch_size]
            try:
                collection.add(
                    documents=[item['content'] for item in batch],
                    metadatas=[{
                        "source": item['url'],
                        "title": item['title'],
                        "timestamp": item['timestamp'],
                        "lang": "tr"
                    } for item in batch],
                    ids=[f"doc_{i + j}" for j in range(len(batch))]
                )
                logger.info(f"Added batch {i//batch_size + 1}/{total_batches}")
            except Exception as e:
                logger.error(f"Error adding batch to ChromaDB: {str(e)}")
                logger.error(f"Problematic content: {batch[0]['content'][:100]}...")  # Print first 100 chars of failing content
        
        logger.info(f"Update completed successfully. Added {len(processed_data)} documents")
        
    except Exception as e:
        logger.error(f"Error during update: {str(e)}")

if __name__ == "__main__":
    update_chroma() 