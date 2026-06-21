/**
 * CollabAI Editor — Constants
 * Application-wide constants and configuration.
 */

// Backend URLs (with fallbacks for development)
export const BACKEND_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000")
    : "http://localhost:8000";

export const SOCKET_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000")
    : "http://localhost:8000";

export const YJS_WS_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_YJS_WS_URL || "ws://localhost:8000/yjs")
    : "ws://localhost:8000/yjs";

// Document
export const DEFAULT_DOCUMENT_ID = "default";

// Search
export const SEARCH_DEBOUNCE_MS = 500;
export const MAX_SEARCH_HISTORY = 10;

// Indexing
export const CONTENT_SEND_DEBOUNCE_MS = 3000;

// Notifications
export const NOTIFICATION_DURATION_MS = 4000;

// Sample search queries for the search panel
export const SAMPLE_QUERIES = [
  "What does this document say about machine learning?",
  "Summarize AI concepts discussed in the document.",
  "Show paragraphs related to neural networks.",
  "Find content discussing vector databases.",
  "Search information about collaborative editing.",
];

// User colors palette
export const USER_COLORS = [
  "#6366F1", "#EC4899", "#F59E0B", "#10B981",
  "#3B82F6", "#EF4444", "#8B5CF6", "#14B8A6",
  "#F97316", "#06B6D4", "#84CC16", "#E11D48",
];
