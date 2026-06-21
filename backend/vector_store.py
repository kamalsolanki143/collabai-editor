"""
CollabAI Editor — Vector Store Module
Manages FAISS index for document chunk storage and semantic similarity search.
"""

import faiss
import json
import logging
import numpy as np
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

from config import settings

logger = logging.getLogger("collabai.vector_store")


class VectorStore:
    """FAISS-backed vector store for document embeddings."""

    COLLECTION_NAME = "document_chunks"
    EMBEDDING_DIM = 768  # Google Gemini embedding dimension

    def __init__(self) -> None:
        """Initialize FAISS index and metadata store."""
        try:
            self._data_dir = Path(settings.FAISS_DB_PATH)
            self._data_dir.mkdir(parents=True, exist_ok=True)
            
            self._index_path = self._data_dir / "faiss_index.bin"
            self._metadata_path = self._data_dir / "metadata.json"
            self._id_mapping_path = self._data_dir / "id_mapping.json"
            self._embeddings_path = self._data_dir / "embeddings.npy"
            
            # Load or create index
            if self._index_path.exists():
                self._index = faiss.read_index(str(self._index_path))
                self._metadata = self._load_metadata()
                self._id_mapping = self._load_id_mapping()
                self._embeddings_dict = self._load_embeddings()
                logger.info(
                    f"FAISS index loaded with {self._index.ntotal} vectors "
                    f"and {len(self._metadata)} metadata entries."
                )
            else:
                self._index = faiss.IndexFlatL2(self.EMBEDDING_DIM)
                self._metadata: Dict[str, Dict[str, Any]] = {}
                self._id_mapping: Dict[str, int] = {}
                self._embeddings_dict: Dict[str, List[float]] = {}
                logger.info(f"Created new FAISS index (dimension={self.EMBEDDING_DIM}).")
                
        except Exception as e:
            logger.error(f"Failed to initialize FAISS: {e}")
            raise

    def _load_metadata(self) -> Dict[str, Dict[str, Any]]:
        """Load metadata from JSON file."""
        if self._metadata_path.exists():
            with open(self._metadata_path, "r") as f:
                return json.load(f)
        return {}

    def _load_id_mapping(self) -> Dict[str, int]:
        """Load ID to FAISS index mapping from JSON file."""
        if self._id_mapping_path.exists():
            with open(self._id_mapping_path, "r") as f:
                return json.load(f)
        return {}

    def _load_embeddings(self) -> Dict[str, List[float]]:
        """Load embeddings from JSON file."""
        if self._embeddings_path.exists():
            with open(self._embeddings_path, "r") as f:
                return json.load(f)
        return {}

    def _save_metadata(self) -> None:
        """Persist metadata to JSON file."""
        with open(self._metadata_path, "w") as f:
            json.dump(self._metadata, f, indent=2)

    def _save_id_mapping(self) -> None:
        """Persist ID mapping to JSON file."""
        with open(self._id_mapping_path, "w") as f:
            json.dump(self._id_mapping, f, indent=2)

    def _save_embeddings(self) -> None:
        """Persist embeddings to JSON file."""
        with open(self._embeddings_path, "w") as f:
            json.dump(self._embeddings_dict, f)

    def _persist_index(self) -> None:
        """Save FAISS index to disk."""
        faiss.write_index(self._index, str(self._index_path))

    def upsert_chunks(
        self,
        document_id: str,
        chunks: List[str],
        embeddings: List[List[float]],
        metadatas: Optional[List[Dict[str, Any]]] = None,
    ) -> int:
        """
        Upsert document chunks with their embeddings into FAISS.

        Args:
            document_id: Unique document identifier.
            chunks: List of text chunks.
            embeddings: Corresponding embedding vectors.
            metadatas: Optional metadata for each chunk.

        Returns:
            Number of chunks upserted.
        """
        if not chunks or not embeddings:
            logger.warning("No chunks or embeddings provided for upsert.")
            return 0

        if len(chunks) != len(embeddings):
            raise ValueError(
                f"Mismatch: {len(chunks)} chunks but {len(embeddings)} embeddings."
            )

        try:
            # Convert embeddings to numpy array (float32 for FAISS)
            embeddings_array = np.array(embeddings, dtype=np.float32)
            
            # Generate deterministic IDs based on document_id and chunk index
            ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
            
            # Build metadata list
            if metadatas is None:
                metadatas = []
            
            upserted_count = 0
            for i, chunk in enumerate(chunks):
                chunk_id = ids[i]
                
                # Prepare metadata
                meta = metadatas[i] if i < len(metadatas) else {}
                final_meta = {
                    "document_id": document_id,
                    "chunk_index": i,
                    "chunk_text": chunk[:500],  # Store truncated text in metadata
                    **meta,
                }
                
                # Check if this ID already exists (update case)
                if chunk_id in self._id_mapping:
                    del self._id_mapping[chunk_id]
                    if chunk_id in self._metadata:
                        del self._metadata[chunk_id]
                    if chunk_id in self._embeddings_dict:
                        del self._embeddings_dict[chunk_id]
                
                # Add new embedding
                faiss_idx = self._index.ntotal
                self._index.add(embeddings_array[i:i+1])
                
                # Store mapping, metadata, and embeddings
                self._id_mapping[chunk_id] = faiss_idx
                self._metadata[chunk_id] = final_meta
                self._embeddings_dict[chunk_id] = embeddings[i]
                upserted_count += 1
            
            # Persist to disk
            self._save_metadata()
            self._save_id_mapping()
            self._save_embeddings()
            self._persist_index()
            
            logger.info(f"Upserted {upserted_count} chunks for document '{document_id}'.")
            return upserted_count
            
        except Exception as e:
            logger.error(f"FAISS upsert failed: {e}")
            raise

    def delete_document(self, document_id: str) -> None:
        """Delete all chunks belonging to a document."""
        try:
            # Find all chunks for this document
            chunk_ids_to_delete = [
                chunk_id for chunk_id, meta in self._metadata.items()
                if meta.get("document_id") == document_id
            ]
            
            if not chunk_ids_to_delete:
                logger.debug(f"No chunks found for document '{document_id}'.")
                return
            
            # Remove from mapping and metadata
            for chunk_id in chunk_ids_to_delete:
                if chunk_id in self._id_mapping:
                    del self._id_mapping[chunk_id]
                if chunk_id in self._metadata:
                    del self._metadata[chunk_id]
            
            # Rebuild index without deleted chunks
            self._rebuild_index()
            
            logger.info(
                f"Deleted {len(chunk_ids_to_delete)} chunks for document '{document_id}'."
            )
        except Exception as e:
            logger.error(f"FAISS delete failed: {e}")
            raise

    def _rebuild_index(self) -> None:
        """Rebuild FAISS index from scratch with current metadata."""
        # Create new index
        new_index = faiss.IndexFlatL2(self.EMBEDDING_DIM)
        new_id_mapping: Dict[str, int] = {}
        
        # Collect embeddings in sorted order
        embeddings_to_add = []
        for i, chunk_id in enumerate(sorted(self._metadata.keys())):
            if chunk_id in self._embeddings_dict:
                embedding = self._embeddings_dict[chunk_id]
                embeddings_to_add.append(embedding)
                new_id_mapping[chunk_id] = i
        
        # Add all embeddings to new index
        if embeddings_to_add:
            embeddings_array = np.array(embeddings_to_add, dtype=np.float32)
            new_index.add(embeddings_array)
        
        self._index = new_index
        self._id_mapping = new_id_mapping
        self._persist_index()
        self._save_id_mapping()

    def search(
        self,
        query_embedding: List[float],
        n_results: int = 10,
        document_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Perform similarity search against stored embeddings.

        Args:
            query_embedding: The query vector.
            n_results: Max number of results.
            document_id: Optional filter by document.

        Returns:
            List of result dicts with text, score, and metadata.
        """
        try:
            if self._index.ntotal == 0:
                logger.info("Index is empty, returning no results.")
                return []
            
            # Convert query to numpy array (float32)
            query_array = np.array([query_embedding], dtype=np.float32)
            
            # Search in FAISS
            k = min(n_results, settings.MAX_SEARCH_RESULTS)
            distances, indices = self._index.search(query_array, k * 2)  # Get more to filter
            
            search_results = []
            seen_chunks = set()
            
            if indices is not None and len(indices) > 0:
                # Get the reverse mapping (FAISS index -> chunk_id)
                reverse_mapping = {v: k for k, v in self._id_mapping.items()}
                
                for faiss_idx, distance in zip(indices[0], distances[0]):
                    if faiss_idx == -1:  # Invalid index
                        continue
                    
                    chunk_id = reverse_mapping.get(faiss_idx)
                    if not chunk_id or chunk_id in seen_chunks:
                        continue
                    
                    metadata = self._metadata.get(chunk_id, {})
                    
                    # Filter by document_id if specified
                    if document_id and metadata.get("document_id") != document_id:
                        continue
                    
                    # Convert L2 distance to similarity score (0-1)
                    # L2 distance is Euclidean; convert to cosine-like similarity
                    similarity = 1.0 / (1.0 + distance)
                    
                    search_results.append({
                        "text": metadata.get("chunk_text", ""),
                        "score": round(similarity, 4),
                        "chunk_index": metadata.get("chunk_index", 0),
                        "document_id": metadata.get("document_id", ""),
                        "metadata": metadata,
                    })
                    
                    seen_chunks.add(chunk_id)
                    
                    if len(search_results) >= n_results:
                        break
            
            logger.info(f"Search returned {len(search_results)} results.")
            return search_results
            
        except Exception as e:
            logger.error(f"FAISS search failed: {e}")
            raise

    def get_collection_stats(self) -> Dict[str, Any]:
        """Get collection statistics."""
        try:
            return {
                "collection_name": self.COLLECTION_NAME,
                "total_chunks": self._index.ntotal,
            }
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {"collection_name": self.COLLECTION_NAME, "total_chunks": 0, "error": str(e)}

    def clear_all(self) -> None:
        """Clear all data from the vector store (use with caution)."""
        try:
            # Reset FAISS index
            self._index.reset()
            self._metadata.clear()
            self._id_mapping.clear()
            
            # Persist empty state
            self._save_metadata()
            self._save_id_mapping()
            self._persist_index()
            
            logger.info("Cleared all data from vector store.")
        except Exception as e:
            logger.error(f"Failed to clear vector store: {e}")
            raise


# Singleton instance
vector_store = VectorStore()
