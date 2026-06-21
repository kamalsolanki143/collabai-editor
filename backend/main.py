"""
CollabAI Editor — Main FastAPI Application
Entry point for the backend server. Combines:
  - REST API endpoints (health, search, index)
  - Socket.IO for presence, notifications, typing
  - Yjs WebSocket for CRDT document sync
  - Background indexing worker
"""

import asyncio
from contextlib import asynccontextmanager
from typing import Dict

import socketio
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.routing import WebSocketRoute

from config import settings
from logging_config import setup_logging, get_logger
from models import SearchRequest, SearchResponse, IndexRequest
from middleware import RateLimitMiddleware, global_exception_handler
from embeddings import embedding_service
from vector_store import vector_store
from websocket_manager import ws_manager
from worker import indexing_worker
from yjs_server import yjs_server

# Initialize logging
setup_logging()
logger = get_logger("collabai.main")

# ---------------------------------------------------------------------------
# Socket.IO server (async mode for FastAPI compatibility)
# ---------------------------------------------------------------------------
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=settings.cors_origins_list,
    logger=False,
    engineio_logger=False,
)

@sio.event
async def connect(sid: str, environ: dict) -> None:
    logger.info(f"Socket.IO connect: {sid}")

@sio.event
async def disconnect(sid: str) -> None:
    user = ws_manager.disconnect_user(sid)
    if user and user.document_id:
        room_users = ws_manager.get_room_users(user.document_id)
        await sio.emit(
            "user_left",
            {"user": user.to_dict(), "users": room_users, "count": len(room_users)},
            room=user.document_id,
        )
    logger.info(f"Socket.IO disconnect: {sid}")

@sio.event
async def join_document(sid: str, data: dict) -> None:
    document_id = data.get("document_id", "default")
    username = data.get("username", None)
    
    user = ws_manager.connect_user(sid, username)
    ws_manager.join_room(sid, document_id)
    sio.enter_room(sid, document_id)
    
    room_users = ws_manager.get_room_users(document_id)
    await sio.emit(
        "room_state",
        {"users": room_users, "count": len(room_users), "document_id": document_id},
        to=sid,
    )
    
    await sio.emit(
        "user_joined",
        {"user": user.to_dict(), "users": room_users, "count": len(room_users)},
        room=document_id,
        skip_sid=sid,
    )
    logger.info(f"User '{user.name}' joined document '{document_id}'")

@sio.event
async def leave_document(sid: str, data: dict) -> None:
    user = ws_manager.get_user(sid)
    if not user or not user.document_id:
        return
        
    document_id = user.document_id
    ws_manager.leave_room(sid)
    sio.leave_room(sid, document_id)
    
    room_users = ws_manager.get_room_users(document_id)
    await sio.emit(
        "user_left",
        {"user": user.to_dict(), "users": room_users, "count": len(room_users)},
        room=document_id,
    )

@sio.event
async def cursor_update(sid: str, data: dict) -> None:
    user = ws_manager.update_cursor(sid, data.get("position", {}))
    if user and user.document_id:
        await sio.emit(
            "cursor_updated",
            {"sid": sid, "user": user.to_dict()},
            room=user.document_id,
            skip_sid=sid,
        )

@sio.event
async def typing(sid: str, data: dict) -> None:
    is_typing = data.get("is_typing", False)
    user = ws_manager.set_typing(sid, is_typing)
    if user and user.document_id:
        await sio.emit(
            "user_typing",
            {"sid": sid, "user": user.to_dict(), "is_typing": is_typing},
            room=user.document_id,
            skip_sid=sid,
        )

@sio.event
async def document_content(sid: str, data: dict) -> None:
    document_id = data.get("document_id", "default")
    content = data.get("content", "")
    await indexing_worker.schedule_indexing(document_id, content)

# Indexing status callback
async def _indexing_status_callback(document_id: str, status: str) -> None:
    await sio.emit(
        "indexing_status",
        {"document_id": document_id, "status": status},
        room=document_id,
    )

indexing_worker.set_status_callback(_indexing_status_callback)

# ---------------------------------------------------------------------------
# FastAPI app setup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.validate_required()
    logger.info("CollabAI Editor backend starting up...")
    logger.info(f"Embedding service available: {embedding_service.is_available}")
    yield
    logger.info("CollabAI Editor backend shutting down...")

app = FastAPI(
    title="CollabAI Editor API",
    description="Real-time collaborative document editor with AI semantic search.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware)
app.add_exception_handler(Exception, global_exception_handler)

# ---------------------------------------------------------------------------
# REST Endpoints
# ---------------------------------------------------------------------------
@app.get("/", tags=["General"])
async def root():
    return {"name": "CollabAI Editor API", "status": "running"}

@app.get("/health", tags=["General"])
async def health_check():
    stats = vector_store.get_collection_stats()
    return {
        "status": "healthy",
        "embedding_service": embedding_service.is_available,
        "vector_store": stats,
        "connected_users": ws_manager.get_total_users(),
        "yjs_rooms": yjs_server.get_room_count(),
    }

@app.post("/search", response_model=SearchResponse, tags=["Search"])
async def search(body: SearchRequest):
    if not embedding_service.is_available:
        raise HTTPException(
            status_code=503,
            detail="Semantic search unavailable. GOOGLE_API_KEY is not configured.",
        )
    try:
        query_embedding = await embedding_service.generate_query_embedding(body.query)
        results = vector_store.search(
            query_embedding=query_embedding,
            n_results=body.n_results,
            document_id=body.document_id,
        )
        return SearchResponse(
            query=body.query,
            results=results,
            total_results=len(results),
            status="success",
        )
    except Exception as e:
        logger.error(f"Search failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/index", tags=["Indexing"])
async def index_document(body: IndexRequest):
    result = await indexing_worker.force_index(body.document_id, body.content)
    if result.get("status") == "error":
        raise HTTPException(status_code=503, detail=result.get("message", "Error"))
    return result

# ---------------------------------------------------------------------------
# Yjs WebSocket route (Starlette-level)
# ---------------------------------------------------------------------------
@app.websocket("/yjs/{document_id}")
async def yjs_websocket_endpoint(websocket, document_id: str = "default"):
    await yjs_server.handle_connection(websocket, document_id)

# Mount Socket.IO
sio_app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    uvicorn.run("main:sio_app", host="0.0.0.0", port=settings.PORT, reload=True)
