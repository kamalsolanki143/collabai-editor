/**
 * CollabAI Editor — useSocket Hook
 * Manages Socket.IO connection lifecycle, user presence, and event handling.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { DEFAULT_DOCUMENT_ID } from "@/lib/constants";
import { generateUsername } from "@/lib/utils";
import type {
  ConnectionStatus,
  User,
  IndexingStatus,
  Notification,
  NotificationType,
} from "@/types";

interface UseSocketReturn {
  connectionStatus: ConnectionStatus;
  users: User[];
  userCount: number;
  currentUser: User | null;
  indexingStatus: IndexingStatus;
  notifications: Notification[];
  sendCursorUpdate: (position: { anchor: number; head: number }) => void;
  sendTyping: (isTyping: boolean) => void;
  sendDocumentContent: (content: string) => void;
  dismissNotification: (id: string) => void;
}

export function useSocket(): UseSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [indexingStatus, setIndexingStatus] = useState<IndexingStatus>("idle");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const usernameRef = useRef<string>(generateUsername());

  const addNotification = useCallback(
    (type: NotificationType, message: string) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        message,
        timestamp: Date.now(),
        duration: 4000,
      };
      setNotifications((prev) => [...prev.slice(-4), notification]);

      // Auto-dismiss
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, notification.duration);
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const socket = getSocket();

    // Connection events
    socket.on("connect", () => {
      setConnectionStatus("connected");
      addNotification("success", "Connected to server");

      // Join document room
      socket.emit("join_document", {
        document_id: DEFAULT_DOCUMENT_ID,
        username: usernameRef.current,
      });
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
      addNotification("warning", "Disconnected from server");
    });

    socket.io.on("reconnect_attempt", () => {
      setConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect", () => {
      setConnectionStatus("connected");
      addNotification("success", "Reconnected to server");
      socket.emit("join_document", {
        document_id: DEFAULT_DOCUMENT_ID,
        username: usernameRef.current,
      });
    });

    socket.io.on("reconnect_failed", () => {
      setConnectionStatus("disconnected");
      addNotification("error", "Failed to reconnect. Please refresh the page.");
    });

    // Presence events
    socket.on("room_state", (data) => {
      setUsers(data.users);
      const me = data.users.find((u) => u.sid === socket.id);
      if (me) setCurrentUser(me);
    });

    socket.on("user_joined", (data) => {
      setUsers(data.users);
      if (data.user.sid !== socket.id) {
        addNotification("info", `${data.user.name} joined the document`);
      }
    });

    socket.on("user_left", (data) => {
      setUsers(data.users);
      addNotification("info", `${data.user.name} left the document`);
    });

    socket.on("cursor_updated", (data) => {
      setUsers((prev) =>
        prev.map((u) => (u.sid === data.sid ? { ...u, ...data.user } : u))
      );
    });

    socket.on("user_typing", (data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.sid === data.sid ? { ...u, is_typing: data.is_typing } : u
        )
      );
    });

    // Indexing status
    socket.on("indexing_status", (data) => {
      setIndexingStatus(data.status);
      if (data.status === "indexed") {
        addNotification("success", "Document indexed successfully");
      } else if (data.status === "failed") {
        addNotification("error", "Document indexing failed");
      }
    });

    // Connect
    setConnectionStatus("connecting");
    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("room_state");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("cursor_updated");
      socket.off("user_typing");
      socket.off("indexing_status");
      disconnectSocket();
    };
  }, [addNotification]);

  const sendCursorUpdate = useCallback(
    (position: { anchor: number; head: number }) => {
      const socket = getSocket();
      if (socket.connected) {
        socket.emit("cursor_update", { position });
      }
    },
    []
  );

  const sendTyping = useCallback((isTyping: boolean) => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("typing", { is_typing: isTyping });
    }
  }, []);

  const sendDocumentContent = useCallback((content: string) => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("document_content", {
        document_id: DEFAULT_DOCUMENT_ID,
        content,
      });
    }
  }, []);

  return {
    connectionStatus,
    users,
    userCount: users.length,
    currentUser,
    indexingStatus,
    notifications,
    sendCursorUpdate,
    sendTyping,
    sendDocumentContent,
    dismissNotification,
  };
}
