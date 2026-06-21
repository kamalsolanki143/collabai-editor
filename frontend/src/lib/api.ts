/**
 * CollabAI Editor — API Client
 * HTTP client for communicating with the FastAPI backend REST endpoints.
 */

import { BACKEND_URL } from "./constants";
import type { SearchRequest, SearchResponse, HealthResponse } from "@/types";

/**
 * Generic fetch wrapper with error handling.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody.detail || `API request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Unable to connect to the backend server. Please ensure it is running."
      );
    }
    throw error;
  }
}

/**
 * Perform semantic search on indexed document content.
 */
export async function searchDocuments(
  request: SearchRequest
): Promise<SearchResponse> {
  return apiFetch<SearchResponse>("/search", {
    method: "POST",
    body: JSON.stringify({
      query: request.query,
      document_id: request.document_id || "default",
      n_results: request.n_results || 5,
    }),
  });
}

/**
 * Manually trigger document indexing.
 */
export async function indexDocument(
  documentId: string,
  content: string
): Promise<{ status: string; document_id: string; total_chunks: number }> {
  return apiFetch("/index", {
    method: "POST",
    body: JSON.stringify({
      document_id: documentId,
      content,
    }),
  });
}

/**
 * Check backend health status.
 */
export async function checkHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}
