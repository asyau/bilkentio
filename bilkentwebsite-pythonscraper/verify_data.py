import chromadb
import json
import logging
from chromadb.utils import embedding_functions
import torch
import os

# Disable CoreML
os.environ["DISABLE_COREML"] = "1"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verify_data():
    try:
        # Load scraped data
        with open('data/bilkent_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info(f"Found {len(data)} entries in bilkent_data.json")
        
        # Initialize ChromaDB with sentence-transformers
        embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
            device="cuda" if torch.cuda.is_available() else "cpu"
        )
        
        # Initialize ChromaDB
        client = chromadb.PersistentClient(path="./data/chroma")
        collection = client.get_collection(
            name="bilkent_knowledge",
            embedding_function=embedding_function
        )
        
        # Get count of documents in ChromaDB
        count = collection.count()
        logger.info(f"Found {count} documents in ChromaDB")
        
        # Test queries in both English and Turkish
        test_queries = [
            # Turkish queries (primary)
            "Bilkent'te hangi lisans bölümleri var?",
            "Bilkent Üniversitesi başvuru koşulları nelerdir?",
            "Bilkent yurt ücretleri ne kadar?",
            "Bilkent'te burs imkanları nelerdir?",
            "Bilkentte Öğrenim Ücreti ne kadar?",
            "Bilkent Bilgisayar Mühendisliği araştırma olanakları nelerdir?",
        ]
        
        for query in test_queries:
            logger.info(f"\nTesting query: {query}")
            results = collection.query(
                query_texts=[query],
                n_results=5  # Increased to get more potential matches
            )
            
            # Process results
            for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
                logger.info(f"\nSource: {metadata['source']}")
                logger.info(f"Title: {metadata['title']}")
                
                # Show preview of content
                preview = doc[:300]
                if len(doc) > 300:
                    preview += "..."
                logger.info(f"Content: {preview}")
                
            logger.info("-" * 80)
            
    except Exception as e:
        logger.error(f"Error during verification: {str(e)}")
        raise e

if __name__ == "__main__":
    verify_data() 