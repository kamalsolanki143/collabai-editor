"""
CollabAI Editor — Embeddings Module
Handles text chunking and embedding generation using LangChain + Google Gemini.
"""

import logging
from typing import List, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from config import settings

logger = logging.getLogger("collabai.embeddings")


class EmbeddingService:
    """Service for text chunking and embedding generation."""

    def __init__(self) -> None:
        """Initialize the text splitter and embedding model."""
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", ""],
        )

        self._embeddings_model: Optional[GoogleGenerativeAIEmbeddings] = None

        if settings.GOOGLE_API_KEY:
            try:
                self._embeddings_model = GoogleGenerativeAIEmbeddings(
                    model="models/text-embedding-004",
                    google_api_key=settings.GOOGLE_API_KEY,
                )
                logger.info("Google Gemini embedding model initialized.")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini embeddings: {e}")
                self._embeddings_model = None
        else:
            logger.warning(
                "GOOGLE_API_KEY not set. Embedding generation is disabled."
            )

    @property
    def is_available(self) -> bool:
        """Check if embedding generation is available."""
        return self._embeddings_model is not None

    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into semantic chunks.

        Args:
            text: The full document text.

        Returns:
            List of text chunks.
        """
        if not text or not text.strip():
            return []

        chunks = self._splitter.split_text(text)
        # Filter out empty or whitespace-only chunks
        chunks = [c.strip() for c in chunks if c.strip()]
        logger.info(f"Chunked text into {len(chunks)} segments.")
        return chunks

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of text chunks.

        Args:
            texts: List of text strings to embed.

        Returns:
            List of embedding vectors.

        Raises:
            RuntimeError: If embedding model is not available.
        """
        if not self._embeddings_model:
            raise RuntimeError(
                "Embedding model not available. Set GOOGLE_API_KEY in your environment."
            )

        if not texts:
            return []

        try:
            # LangChain's embed_documents handles batching internally
            embeddings = await self._embeddings_model.aembed_documents(texts)
            logger.info(f"Generated {len(embeddings)} embeddings (dim={len(embeddings[0]) if embeddings else 0}).")
            return embeddings
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise

    async def generate_query_embedding(self, query: str) -> List[float]:
        """
        Generate an embedding for a search query.

        Args:
            query: The search query string.

        Returns:
            Embedding vector for the query.

        Raises:
            RuntimeError: If embedding model is not available.
        """
        if not self._embeddings_model:
            raise RuntimeError(
                "Embedding model not available. Set GOOGLE_API_KEY in your environment."
            )

        if not query or not query.strip():
            raise ValueError("Query cannot be empty.")

        try:
            embedding = await self._embeddings_model.aembed_query(query)
            logger.info(f"Generated query embedding (dim={len(embedding)}).")
            return embedding
        except Exception as e:
            logger.error(f"Query embedding generation failed: {e}")
            raise


# Singleton instance
embedding_service = EmbeddingService()
