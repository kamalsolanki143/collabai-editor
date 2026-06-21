"""
CollabAI Editor — Configuration Module
Loads and validates environment variables using Pydantic BaseSettings.
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Google Gemini API key for embedding generation
    GOOGLE_API_KEY: str = ""

    # FAISS vector database persistence directory
    FAISS_DB_PATH: str = "./faiss_data"

    # Server port
    PORT: int = 8000

    # CORS allowed origins (comma-separated in env)
    CORS_ORIGINS: str = (
    "http://localhost:3000,"
    "http://127.0.0.1:3000,"
    "https://collabai-editor.vercel.app"
)

    # Yjs WebSocket path
    YJS_WS_PATH: str = "/yjs"

    # Indexing debounce delay in seconds
    INDEX_DEBOUNCE_SECONDS: float = 2.0

    # Chunk size for text splitting
    CHUNK_SIZE: int = 500

    # Chunk overlap for text splitting
    CHUNK_OVERLAP: int = 50

    # Maximum search results to return
    MAX_SEARCH_RESULTS: int = 10

    # Rate limiting: max search requests per minute per client
    SEARCH_RATE_LIMIT: int = 30

    # Log level
    LOG_LEVEL: str = "INFO"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def validate_required(self) -> None:
        """Validate that required settings are present. Warn if missing."""
        import logging
        logger = logging.getLogger("collabai.config")

        if not self.GOOGLE_API_KEY:
            logger.warning(
                "GOOGLE_API_KEY is not set. Embedding generation and semantic search will be disabled. "
                "Set it in your .env file or environment variables."
            )

        # Ensure FAISS path exists
        os.makedirs(self.FAISS_DB_PATH, exist_ok=True)
        logger.info(f"FAISS path: {os.path.abspath(self.FAISS_DB_PATH)}")
        logger.info(f"Server port: {self.PORT}")
        logger.info(f"CORS origins: {self.cors_origins_list}")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Singleton settings instance
settings = Settings()
