"""
CollabAI Editor — Middleware
FastAPI middleware for CORS, rate limiting, and exception handling.
"""

import time
from typing import Dict, Callable, Awaitable
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from config import settings
from logging_config import get_logger

logger = get_logger("collabai.middleware")

# Simple in-memory rate limit store
_rate_limit_store: Dict[str, list] = {}

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        # Only rate limit search and index endpoints
        if request.url.path in ["/search", "/index"]:
            client_ip = request.client.host if request.client else "unknown"
            now = time.time()
            window = 60  # 1-minute window
            
            if client_ip not in _rate_limit_store:
                _rate_limit_store[client_ip] = []
                
            # Prune old entries
            _rate_limit_store[client_ip] = [
                t for t in _rate_limit_store[client_ip] if now - t < window
            ]
            
            if len(_rate_limit_store[client_ip]) >= settings.SEARCH_RATE_LIMIT:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Rate limit exceeded. Please wait before making more requests."}
                )
                
            _rate_limit_store[client_ip].append(now)
            
        return await call_next(request)

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unhandled exceptions globally."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)},
    )
