/**
 * CollabAI Editor — Toolbar Component
 * Rich text formatting toolbar for the TipTap editor.
 */

"use client";

import React, { memo } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code2,
  Quote,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  icon,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded-lg transition-all duration-150 ease-out
        ${
          isActive
            ? "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 shadow-sm"
            : "text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-700/50"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95"}
      `}
    >
      {icon}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-0.5" />
  );
}

function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  return (
    <div
      id="editor-toolbar"
      className="
        flex items-center gap-0.5 p-2 flex-wrap
        bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm
        border-b border-surface-200 dark:border-surface-700
        sticky top-0 z-10
      "
    >
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        icon={<Bold className="w-4 h-4" />}
        title="Bold (Ctrl+B)"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        icon={<Italic className="w-4 h-4" />}
        title="Italic (Ctrl+I)"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        icon={<Underline className="w-4 h-4" />}
        title="Underline (Ctrl+U)"
      />

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        icon={<Heading1 className="w-4 h-4" />}
        title="Heading 1"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        icon={<Heading2 className="w-4 h-4" />}
        title="Heading 2"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        icon={<Heading3 className="w-4 h-4" />}
        title="Heading 3"
      />

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        icon={<List className="w-4 h-4" />}
        title="Bullet List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        icon={<ListOrdered className="w-4 h-4" />}
        title="Numbered List"
      />

      <ToolbarDivider />

      {/* Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        icon={<Code2 className="w-4 h-4" />}
        title="Code Block"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        icon={<Quote className="w-4 h-4" />}
        title="Block Quote"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        icon={<Minus className="w-4 h-4" />}
        title="Horizontal Rule"
      />

      <ToolbarDivider />

      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        icon={<Undo2 className="w-4 h-4" />}
        title="Undo (Ctrl+Z)"
/>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        icon={<Redo2 className="w-4 h-4" />}
        title="Redo (Ctrl+Shift+Z)"
      />
    </div>
  );
}

export default memo(Toolbar);