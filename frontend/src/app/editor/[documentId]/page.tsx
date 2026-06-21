/**
 * CollabAI Editor — Editor Page
 * Dynamic document editor page.
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Sparkles, FileEdit, Zap } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useCollaboration } from "@/hooks/useCollaboration";
import ConnectionStatus from "@/components/ConnectionStatus";
import IndexStatusBadge from "@/components/IndexStatusBadge";
import UserPresence from "@/components/UserPresence";
import SearchPanel from "@/components/SearchPanel";
import NotificationToast from "@/components/NotificationToast";
import { EditorSkeleton } from "@/components/LoadingSkeleton";

// Dynamically import the Editor to avoid SSR issues with TipTap/Yjs
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

export default function EditorPage() {
  const params = useParams();
  const documentId = (params.documentId as string) || "default";
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    connectionStatus,
    users,
    currentUser,
    indexingStatus,
    notifications,
    sendCursorUpdate,
    sendTyping,
    sendDocumentContent,
    dismissNotification,
  } = useSocket();

  const handleContentChange = useCallback(
    (content: string) => {
      sendDocumentContent(content);
    },
    [sendDocumentContent]
  );

  const { ydoc, provider } = useCollaboration(handleContentChange);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev: boolean) => !prev);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800 z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
              <FileEdit className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-surface-900" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold tracking-tight">
              <span className="text-gradient">CollabAI</span>
              <span className="text-surface-600 dark:text-surface-400 font-semibold ml-1">
                Editor
              </span>
            </h1>
            <p className="text-[10px] text-surface-400 dark:text-surface-500 -mt-0.5">
              Doc: {documentId}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ConnectionStatus status={connectionStatus} />
          <IndexStatusBadge status={indexingStatus} />
        </div>

        <div className="flex items-center gap-3">
          <UserPresence
            users={users}
            currentUserSid={currentUser?.sid || null}
          />
          <div className="w-px h-6 bg-surface-200 dark:bg-surface-700" />
          <button
            onClick={toggleSearch}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${
              isSearchOpen
                ? "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 shadow-sm"
                : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Search</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {isLoaded && ydoc ? (
            <div className="flex-1 overflow-hidden">
              <Editor
                ydoc={ydoc}
                provider={provider}
                currentUserName={currentUser?.name || "Anonymous"}
                currentUserColor={currentUser?.color || "#6366F1"}
                onContentChange={handleContentChange}
                onCursorUpdate={sendCursorUpdate}
                onTyping={sendTyping}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <EditorSkeleton />
              <div className="flex flex-col items-center justify-center flex-1 px-6 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-brand-400" />
                </div>
                <h2 className="text-lg font-semibold text-surface-700 dark:text-surface-300 text-center">
                  Initializing Editor
                </h2>
                <div className="flex gap-1 mt-4">
                  <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <SearchPanel isOpen={isSearchOpen} onToggle={toggleSearch} />
      </main>

      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
