from flask import Flask, request, jsonify
import chromadb
from chromadb.utils import embedding_functions
import torch
import os

# Disable CoreML
os.environ["DISABLE_COREML"] = "1"

app = Flask(__name__)

class ChromaService:
    def __init__(self):
        # Initialize with the same embedding model
        embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
            device="cuda" if torch.cuda.is_available() else "cpu"
        )
        
        self.chroma_client = chromadb.PersistentClient(path="./data/chroma")
        self.collection = self.chroma_client.get_collection(
            name="bilkent_knowledge",
            embedding_function=embedding_function
        )

    def query(self, query_text, n_results=5):
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        
        formatted_results = []
        for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
            formatted_results.append({
                'content': doc[:300] + "..." if len(doc) > 300 else doc,
                'full_content': doc,
                'source': metadata['source'],
                'title': metadata['title'],
                'lang': metadata.get('lang', 'tr')
            })
            
        return formatted_results

chroma_service = ChromaService()

@app.route('/query', methods=['POST'])
def query():
    try:
        data = request.json
        query_text = data.get('query')
        n_results = data.get('n_results', 5)
        
        if not query_text:
            return jsonify({'error': 'No query provided'}), 400
        
        results = chroma_service.query(query_text, n_results)
        
        # Log the matches for debugging
        print(f"\nQuery: {query_text}")
        print("Matches found:")
        for r in results:
            print(f"Title: {r['title']}")
            print(f"Source: {r['source']}")
            print(f"Content preview: {r['content']}")
            print("-" * 80)
            
        return jsonify({'results': results})
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'ChromaDB service is running'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)