import chromadb
from typing import List

class BilkentKnowledgeBase:
    def __init__(self):
        self.chroma_client = chromadb.Client()
        self.collection = self.chroma_client.get_collection("bilkent_knowledge")
    
    def query_knowledge_base(self, query: str, n_results: int = 3) -> List[str]:
        """Query the knowledge base and return relevant results"""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        # Format results
        formatted_results = []
        for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
            formatted_results.append({
                'content': doc,
                'source': metadata['source'],
                'title': metadata['title']
            })
            
        return formatted_results 