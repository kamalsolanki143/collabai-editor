/**
 * CollabAI Editor — Socket.IO Client
 * Manages the Socket.IO connection to the backend for presence and notifications.
 */

import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./constants";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types";

let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

/**
 * Get or create the singleton Socket.IO client instance.
 */
export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: false,
    });
  }
  return socketInstance;
}

/**
 * Disconnect and clean up the socket instance.
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
