/**
 * CollabAI Editor — Editor Component
 * TipTap rich text editor with Yjs collaboration, cursor awareness, and demo content.
 */

"use client";

import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
// @ts-ignore: spurious type error after npm install
import * as Y from "yjs";
import Toolbar from "./Toolbar";
import { DEMO_CONTENT } from "@/lib/demo-content";

interface EditorProps {
  ydoc: Y.Doc | null;
  provider: null;
  currentUserName: string;
  currentUserColor: string;
  onContentChange?: (content: string) => void;
  onCursorUpdate?: (position: { anchor: number; head: number }) => void;
  onTyping?: (isTyping: boolean) => void;
}

export default function Editor({
  ydoc,
  provider,
  currentUserName,
  currentUserColor,
  onContentChange,
  onCursorUpdate,
  onTyping,
}: EditorProps) {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInsertedDemoRef = useRef(false);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          codeBlock: {
            HTMLAttributes: {
              class: "code-block",
            },
          },
          heading: {
            levels: [1, 2, 3],
          },
        }),
        UnderlineExtension,
        Placeholder.configure({
          placeholder: "Start typing your document...",
          emptyEditorClass: "is-editor-empty",
        }),
      ],
      editorProps: {
        attributes: {
          class: "editor-content focus:outline-none",
          id: "tiptap-editor",
        },
      },
      onUpdate: ({ editor: ed }: any) => {
        // Send text content for indexing
        if (onContentChange) {
          const text = ed.getText();
          onContentChange(text);
        }

        // Typing indicator
        if (onTyping) {
          onTyping(true);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            onTyping(false);
          }, 1500);
        } 
      },
      onSelectionUpdate: ({ editor: ed }: any) => {
        if (onCursorUpdate) {
          const { from, to } = ed.state.selection;
          onCursorUpdate({ anchor: from, head: to });
        }
      },
    },
    [ydoc, provider, currentUserName, currentUserColor]
  );

  // Insert demo content on first load (dev mode only)
  useEffect(() => {
    if (
      editor &&
      ydoc &&
      !hasInsertedDemoRef.current &&
      // @ts-ignore: process.env may not be typed if @types/node is missing
      typeof process !== 'undefined' && process.env.NODE_ENV === "development"
    ) {
      // Wait for sync, then insert demo content if document is empty
      const timer = setTimeout(() => {
        if (editor.isEmpty && !hasInsertedDemoRef.current) {
          hasInsertedDemoRef.current = true;
          editor.commands.setContent(DEMO_CONTENT);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [editor, ydoc]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div id="editor-container" className="flex flex-col h-full">
      <Toolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="editor-wrapper"
        />
      </div>
    </div>
  );
}
