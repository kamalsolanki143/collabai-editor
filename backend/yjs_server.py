"""
CollabAI Editor — Yjs WebSocket Sync Server
Provides a WebSocket endpoint for Yjs CRDT document synchronization.
Implements the y-websocket protocol for binary CRDT message exchange.
"""

import asyncio
import logging
from typing import Dict, Set
from starlette.websockets import WebSocket, WebSocketDisconnect

logger = logging.getLogger("collabai.yjs_server")


class YjsRoom:
    """Represents a Yjs document room with connected clients and shared state."""

    def __init__(self, name: str) -> None:
        self.name = name
        self.clients: Set[WebSocket] = set()
        self.awareness_states: Dict[int, bytes] = {}
        # Store the Yjs document state as accumulated updates
        self._document_updates: list[bytes] = []

    async def add_client(self, ws: WebSocket) -> None:
        """Add a WebSocket client to the room."""
        self.clients.add(ws)
        logger.info(f"Client joined Yjs room '{self.name}'. Total: {len(self.clients)}")

        # Send existing document state to the new client
        for update in self._document_updates:
            try:
                await ws.send_bytes(update)
            except Exception as e:
                logger.error(f"Failed to send state to new client: {e}")

    def remove_client(self, ws: WebSocket) -> None:
        """Remove a WebSocket client from the room."""
        self.clients.discard(ws)
        logger.info(f"Client left Yjs room '{self.name}'. Total: {len(self.clients)}")

    async def broadcast(self, data: bytes, sender: WebSocket) -> None:
        """Broadcast a binary message to all clients except the sender."""
        # Store update for new clients
        self._document_updates.append(data)

        # Limit stored updates to prevent unbounded memory growth
        if len(self._document_updates) > 1000:
            self._document_updates = self._document_updates[-500:]

        disconnected = set()
        for client in self.clients:
            if client != sender:
                try:
                    await client.send_bytes(data)
                except Exception:
                    disconnected.add(client)

        # Clean up disconnected clients
        for client in disconnected:
            self.clients.discard(client)

    def is_empty(self) -> bool:
        return len(self.clients) == 0

    def get_text_content(self) -> str:
        """
        This is a simplified placeholder. In production, you'd decode
        the Yjs document state to extract text. For now, we rely on
        the frontend sending text content via Socket.IO for indexing.
        """
        return ""


class YjsServer:
    """Manages Yjs WebSocket rooms and client connections."""

    def __init__(self) -> None:
        self._rooms: Dict[str, YjsRoom] = {}

    def get_or_create_room(self, room_name: str) -> YjsRoom:
        """Get an existing room or create a new one."""
        if room_name not in self._rooms:
            self._rooms[room_name] = YjsRoom(room_name)
            logger.info(f"Created Yjs room: '{room_name}'")
        return self._rooms[room_name]

    def cleanup_room(self, room_name: str) -> None:
        """Remove an empty room."""
        room = self._rooms.get(room_name)
        if room and room.is_empty():
            del self._rooms[room_name]
            logger.info(f"Cleaned up empty Yjs room: '{room_name}'")

    async def handle_connection(self, websocket: WebSocket, document_id: str) -> None:
        """
        Handle a Yjs WebSocket connection lifecycle:
        accept → join room → relay messages → cleanup on disconnect.
        """
        await websocket.accept()
        room = self.get_or_create_room(document_id)
        await room.add_client(websocket)

        try:
            while True:
                # Receive binary Yjs CRDT messages
                data = await websocket.receive_bytes()
                # Broadcast to all other clients in the room
                await room.broadcast(data, websocket)
        except WebSocketDisconnect:
            logger.info(f"Yjs client disconnected from room '{document_id}'")
        except Exception as e:
            logger.error(f"Yjs WebSocket error in room '{document_id}': {e}")
        finally:
            room.remove_client(websocket)
            self.cleanup_room(document_id)

    def get_room_count(self) -> int:
        """Get total number of active rooms."""
        return len(self._rooms)

    def get_room_client_count(self, room_name: str) -> int:
        """Get number of clients in a specific room."""
        room = self._rooms.get(room_name)
        return len(room.clients) if room else 0


# Singleton instance
yjs_server = YjsServer()
