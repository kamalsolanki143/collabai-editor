"""
CollabAI Editor — WebSocket Manager Module
Manages user presence, cursor tracking, typing indicators,
and broadcast notifications via Socket.IO.
"""

import logging
import time
from typing import Dict, Set, Optional, Any
from dataclasses import dataclass, field, asdict
import random

logger = logging.getLogger("collabai.websocket_manager")

# Colors for user cursors — a curated palette of vibrant, distinguishable colors
USER_COLORS = [
    "#6366F1",  # Indigo
    "#EC4899",  # Pink
    "#F59E0B",  # Amber
    "#10B981",  # Emerald
    "#3B82F6",  # Blue
    "#EF4444",  # Red
    "#8B5CF6",  # Violet
    "#14B8A6",  # Teal
    "#F97316",  # Orange
    "#06B6D4",  # Cyan
    "#84CC16",  # Lime
    "#E11D48",  # Rose
]


@dataclass
class UserInfo:
    """Represents a connected user."""
    sid: str
    name: str
    color: str
    document_id: Optional[str] = None
    cursor_position: Optional[Dict[str, Any]] = None
    is_typing: bool = False
    connected_at: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sid": self.sid,
            "name": self.name,
            "color": self.color,
            "document_id": self.document_id,
            "cursor_position": self.cursor_position,
            "is_typing": self.is_typing,
        }


class WebSocketManager:
    """Manages WebSocket connections, user presence, and room-based broadcasts."""

    def __init__(self) -> None:
        self._users: Dict[str, UserInfo] = {}  # sid -> UserInfo
        self._rooms: Dict[str, Set[str]] = {}  # document_id -> set of sids
        self._color_index: int = 0

    def _next_color(self) -> str:
        """Get the next color from the palette in round-robin fashion."""
        color = USER_COLORS[self._color_index % len(USER_COLORS)]
        self._color_index += 1
        return color

    def connect_user(self, sid: str, name: Optional[str] = None) -> UserInfo:
        """Register a new user connection."""
        if not name:
            name = f"User {len(self._users) + 1}"

        user = UserInfo(
            sid=sid,
            name=name,
            color=self._next_color(),
        )
        self._users[sid] = user
        logger.info(f"User connected: {user.name} ({sid})")
        return user

    def disconnect_user(self, sid: str) -> Optional[UserInfo]:
        """Remove a user from all rooms and tracking."""
        user = self._users.pop(sid, None)
        if user:
            # Remove from any room they were in
            if user.document_id and user.document_id in self._rooms:
                self._rooms[user.document_id].discard(sid)
                if not self._rooms[user.document_id]:
                    del self._rooms[user.document_id]
            logger.info(f"User disconnected: {user.name} ({sid})")
        return user

    def join_room(self, sid: str, document_id: str) -> Optional[UserInfo]:
        """Add a user to a document room."""
        user = self._users.get(sid)
        if not user:
            return None

        # Leave previous room if any
        if user.document_id and user.document_id in self._rooms:
            self._rooms[user.document_id].discard(sid)

        # Join new room
        user.document_id = document_id
        if document_id not in self._rooms:
            self._rooms[document_id] = set()
        self._rooms[document_id].add(sid)

        logger.info(f"User {user.name} joined room '{document_id}'")
        return user

    def leave_room(self, sid: str) -> Optional[UserInfo]:
        """Remove a user from their current room."""
        user = self._users.get(sid)
        if not user or not user.document_id:
            return None

        document_id = user.document_id
        if document_id in self._rooms:
            self._rooms[document_id].discard(sid)
            if not self._rooms[document_id]:
                del self._rooms[document_id]

        user.document_id = None
        logger.info(f"User {user.name} left room '{document_id}'")
        return user

    def update_cursor(self, sid: str, position: Dict[str, Any]) -> Optional[UserInfo]:
        """Update a user's cursor position."""
        user = self._users.get(sid)
        if user:
            user.cursor_position = position
        return user

    def set_typing(self, sid: str, is_typing: bool) -> Optional[UserInfo]:
        """Update a user's typing status."""
        user = self._users.get(sid)
        if user:
            user.is_typing = is_typing
        return user

    def get_room_users(self, document_id: str) -> list:
        """Get all users in a specific document room."""
        sids = self._rooms.get(document_id, set())
        return [
            self._users[sid].to_dict()
            for sid in sids
            if sid in self._users
        ]

    def get_room_sids(self, document_id: str, exclude_sid: Optional[str] = None) -> list:
        """Get all SIDs in a room, optionally excluding one."""
        sids = self._rooms.get(document_id, set())
        if exclude_sid:
            return [s for s in sids if s != exclude_sid]
        return list(sids)

    def get_user(self, sid: str) -> Optional[UserInfo]:
        """Get user info by SID."""
        return self._users.get(sid)

    def get_total_users(self) -> int:
        """Get total number of connected users."""
        return len(self._users)

    def get_room_count(self, document_id: str) -> int:
        """Get number of users in a specific room."""
        return len(self._rooms.get(document_id, set()))


# Singleton instance
ws_manager = WebSocketManager()
