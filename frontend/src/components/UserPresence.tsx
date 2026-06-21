/**
 * CollabAI Editor — UserPresence Component
 * Displays active users with avatars, online indicators, and typing status.
 */

"use client";

import React, { memo } from "react";
import { Users, PenLine } from "lucide-react";
import type { User } from "@/types";

interface UserPresenceProps {
  users: User[];
  currentUserSid: string | null;
}

function getInitials(name: string): string {
  return name
    .split(/[\s_]+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function UserPresence({ users, currentUserSid }: UserPresenceProps) {
  const otherUsers = users.filter((u) => u.sid !== currentUserSid);
  const currentUser = users.find((u) => u.sid === currentUserSid);
  const typingUsers = otherUsers.filter((u) => u.is_typing);

  return (
    <div id="user-presence" className="flex items-center gap-3">
      {/* User count */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-surface-500 dark:text-surface-400">
        <Users className="w-4 h-4" />
        <span>{users.length} online</span>
      </div>

      {/* Avatars */}
      <div className="flex items-center -space-x-2">
        {/* Current user */}
        {currentUser && (
          <div className="relative group" title={`${currentUser.name} (you)`}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-white dark:ring-surface-900 transition-transform hover:scale-110 hover:z-10"
              style={{ backgroundColor: currentUser.color }}
            >
              {getInitials(currentUser.name)}
            </div>
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-surface-900" />
            {/* Tooltip */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-900 dark:bg-surface-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
              {currentUser.name} (you)
            </div>
          </div>
        )}

        {/* Other users */}
        {otherUsers.map((user) => (
          <div key={user.sid} className="relative group" title={user.name}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-white dark:ring-surface-900 transition-transform hover:scale-110 hover:z-10"
              style={{ backgroundColor: user.color }}
            >
              {getInitials(user.name)}
            </div>
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-surface-900" />
            {/* Typing indicator */}
            {user.is_typing && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-brand-500 rounded-full ring-2 ring-white dark:ring-surface-900">
                <PenLine className="w-2.5 h-2.5 text-white" />
              </span>
            )}
            {/* Tooltip */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-900 dark:bg-surface-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
              {user.name}
              {user.is_typing ? " (typing...)" : ""}
            </div>
          </div>
        ))}
      </div>

      {/* Typing indicator text */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-surface-400 dark:text-surface-500 animate-fade-in">
          <div className="flex gap-0.5">
            <span className="w-1 h-1 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-1 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-1 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0].name} is typing`
              : `${typingUsers.length} people typing`}
          </span>
        </div>
      )}
    </div>
  );
}

export default memo(UserPresence);
