"""
CollabAI Editor — Background Worker Module
Handles debounced, asynchronous document indexing:
  detect changes → chunk text → generate embeddings → upsert into FAISS.
"""

import asyncio
import logging
import time
from typing import Dict, Optional, Callable, Awaitable
from enum import Enum

from embeddings import embedding_service
from vector_store import vector_store
from config import settings

logger = logging.getLogger("collabai.worker")


class IndexingStatus(str, Enum):
    """Document indexing status."""
    IDLE = "idle"
    PENDING = "pending"
    INDEXING = "indexing"
    INDEXED = "indexed"
    FAILED = "failed"


class IndexingWorker:
    """
    Background worker that indexes document content asynchronously.
    Uses debouncing to avoid excessive API calls on rapid edits.
    """

    def __init__(self) -> None:
        self._debounce_tasks: Dict[str, asyncio.Task] = {}
        self._status: Dict[str, IndexingStatus] = {}
        self._last_indexed_content: Dict[str, str] = {}
        self._status_callback: Optional[Callable[[str, str], Awaitable[None]]] = None
        self._lock = asyncio.Lock()

    def set_status_callback(
        self, callback: Callable[[str, str], Awaitable[None]]
    ) -> None:
        """Set a callback that is invoked when indexing status changes."""
        self._status_callback = callback

    def get_status(self, document_id: str) -> str:
        """Get current indexing status for a document."""
        return self._status.get(document_id, IndexingStatus.IDLE).value

    async def _notify_status(self, document_id: str, status: IndexingStatus) -> None:
        """Update status and notify via callback."""
        self._status[document_id] = status
        if self._status_callback:
            try:
                await self._status_callback(document_id, status.value)
            except Exception as e:
                logger.error(f"Status callback failed: {e}")

    async def schedule_indexing(self, document_id: str, content: str) -> None:
        """
        Schedule document indexing with debouncing.
        If called again within the debounce window, the previous pending
        index is cancelled and rescheduled.

        Args:
            document_id: Unique document identifier.
            content: Full document text content.
        """
        if not embedding_service.is_available:
            logger.debug("Embedding service unavailable; skipping indexing.")
            return

        # Skip if content hasn't changed since last successful index
        if self._last_indexed_content.get(document_id) == content:
            logger.debug(f"Content unchanged for '{document_id}'; skipping.")
            return

        # Cancel any pending debounce task for this document
        async with self._lock:
            existing_task = self._debounce_tasks.get(document_id)
            if existing_task and not existing_task.done():
                existing_task.cancel()
                logger.debug(f"Cancelled pending index for '{document_id}'.")

            await self._notify_status(document_id, IndexingStatus.PENDING)

            # Create a new debounced task
            task = asyncio.create_task(
                self._debounced_index(document_id, content)
            )
            self._debounce_tasks[document_id] = task

    async def _debounced_index(self, document_id: str, content: str) -> None:
        """Wait for debounce period then perform indexing."""
        try:
            await asyncio.sleep(settings.INDEX_DEBOUNCE_SECONDS)
            await self._perform_indexing(document_id, content)
        except asyncio.CancelledError:
            logger.debug(f"Debounced indexing cancelled for '{document_id}'.")
        except Exception as e:
            logger.error(f"Indexing failed for '{document_id}': {e}")
            await self._notify_status(document_id, IndexingStatus.FAILED)

    async def _perform_indexing(self, document_id: str, content: str) -> None:
        """
        Perform the full indexing pipeline:
        1. Chunk text
        2. Generate embeddings
        3. Delete old chunks
        4. Upsert new chunks
        """
        await self._notify_status(document_id, IndexingStatus.INDEXING)
        start_time = time.time()

        try:
            # Step 1: Chunk the text
            chunks = embedding_service.chunk_text(content)
            if not chunks:
                logger.info(f"No chunks produced for '{document_id}'; clearing old data.")
                vector_store.delete_document(document_id)
                self._last_indexed_content[document_id] = content
                await self._notify_status(document_id, IndexingStatus.INDEXED)
                return

            logger.info(
                f"Indexing '{document_id}': {len(chunks)} chunks, "
                f"{len(content)} chars total."
            )

            # Step 2: Generate embeddings
            embeddings = await embedding_service.generate_embeddings(chunks)

            # Step 3: Delete old chunks and upsert new ones
            vector_store.delete_document(document_id)
            upserted = vector_store.upsert_chunks(
                document_id=document_id,
                chunks=chunks,
                embeddings=embeddings,
            )

            elapsed = time.time() - start_time
            logger.info(
                f"Indexed '{document_id}': {upserted} chunks in {elapsed:.2f}s."
            )

            self._last_indexed_content[document_id] = content
            await self._notify_status(document_id, IndexingStatus.INDEXED)

        except Exception as e:
            logger.error(f"Indexing pipeline failed for '{document_id}': {e}")
            await self._notify_status(document_id, IndexingStatus.FAILED)
            raise

    async def force_index(self, document_id: str, content: str) -> Dict:
        """
        Immediately index a document without debouncing.
        Used for the POST /index endpoint.

        Returns:
            Dict with indexing results.
        """
        if not embedding_service.is_available:
            return {
                "status": "error",
                "message": "Embedding service unavailable. Set GOOGLE_API_KEY.",
            }

        try:
            await self._perform_indexing(document_id, content)
            stats = vector_store.get_collection_stats()
            return {
                "status": "success",
                "document_id": document_id,
                "total_chunks": stats["total_chunks"],
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}


# Singleton instance
indexing_worker = IndexingWorker()
