/**
 * CollabAI Editor — useCollaboration Hook
 * Manages local Yjs document and TipTap editor integration.
 */

"use client";

import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { DEFAULT_DOCUMENT_ID } from "@/lib/constants";
import { createYjsProvider } from "@/lib/yjs-provider";

interface UseCollaborationReturn {
  ydoc: Y.Doc | null;
  provider: null;
  isConnected: boolean;
  isSynced: boolean;
}

export function useCollaboration(
  onContentChange?: (content: string) => void
): UseCollaborationReturn {
  const ydocRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    const { ydoc } = createYjsProvider(DEFAULT_DOCUMENT_ID);
    ydocRef.current = ydoc;

    return () => {
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
    };
  }, []);

  return {
    ydoc: ydocRef.current,
    provider: null,
    isConnected: false,
    isSynced: true,
  };
}
