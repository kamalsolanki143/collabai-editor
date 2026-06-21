/**
 * CollabAI Editor — Yjs Provider
 * Wrapper utility for local Yjs document setup without websocket connection.
 */

import * as Y from "yjs";

export function createYjsProvider(documentId: string): { ydoc: Y.Doc; provider: null } {
  const ydoc = new Y.Doc();
  return { ydoc, provider: null };
}
