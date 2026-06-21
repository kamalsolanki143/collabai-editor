"""
CollabAI Editor — API Models
Pydantic models for request and response validation.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="Natural language search query.")
    document_id: str = Field(default="default", description="Document to search within.")
    n_results: int = Field(default=5, ge=1, le=20, description="Number of results to return.")

class SearchResult(BaseModel):
    text: str
    score: float
    chunk_index: int
    document_id: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_results: int
    status: str

class IndexRequest(BaseModel):
    document_id: str = Field(default="default", description="Document ID to index.")
    content: str = Field(..., min_length=1, description="Full document text content.")
