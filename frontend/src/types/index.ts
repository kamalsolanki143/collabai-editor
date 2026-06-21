/**
 * CollabAI Editor — Type Definitions
 * Shared TypeScript types used across the frontend.
 */

// ─── User & Presence ────────────────────────────────────────────────────────

export interface User {
  sid: string;
  name: string;
  color: string;
  document_id: string | null;
  cursor_position: CursorPosition | null;
  is_typing: boolean;
}

export interface CursorPosition {
  anchor: number;
  head: number;
}

export interface RoomState {
  users: User[];
  count: number;
  document_id: string;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResult {
  text: string;
  score: number;
  chunk_index: number;
  document_id: string;
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
  status: string;
}

export interface SearchRequest {
  query: string;
  document_id?: string;
  n_results?: number;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
}

// ─── Indexing ────────────────────────────────────────────────────────────────

export type IndexingStatus = "idle" | "pending" | "indexing" | "indexed" | "failed";

export interface IndexingState {
  status: IndexingStatus;
  document_id: string;
}

// ─── Connection ──────────────────────────────────────────────────────────────

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "reconnecting";

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  duration?: number;
}

// ─── Health ──────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  embedding_service: boolean;
  vector_store: {
    collection_name: string;
    total_chunks: number;
  };
  connected_users: number;
  yjs_rooms: number;
}

// ─── Socket.IO Events ───────────────────────────────────────────────────────

export interface ServerToClientEvents {
  room_state: (data: RoomState) => void;
  user_joined: (data: { user: User; users: User[]; count: number }) => void;
  user_left: (data: { user: User; users: User[]; count: number }) => void;
  cursor_updated: (data: { sid: string; user: User }) => void;
  user_typing: (data: { sid: string; user: User; is_typing: boolean }) => void;
  indexing_status: (data: IndexingState) => void;
}

export interface ClientToServerEvents {
  join_document: (data: { document_id: string; username?: string }) => void;
  leave_document: (data: { document_id: string }) => void;
  cursor_update: (data: { position: CursorPosition }) => void;
  typing: (data: { is_typing: boolean }) => void;
  document_content: (data: { document_id: string; content: string }) => void;
}
