/**
 * CollabAI Editor — LoadingSkeleton Component
 * Skeleton screens for loading states.
 */

"use client";

import React from "react";

export function EditorSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      {/* Toolbar skeleton */}
      <div className="flex gap-2 p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-lg bg-surface-200 dark:bg-surface-700"
          />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="space-y-3 mt-6">
        <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded-lg w-3/4" />
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-full" />
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-5/6" />
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-4/6" />
        <div className="h-6 mt-4 bg-surface-200 dark:bg-surface-700 rounded-lg w-1/2" />
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-full" />
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-5/6" />
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-2/3" />
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-surface-100 dark:bg-surface-800 space-y-2"
        >
          <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/4" />
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-full" />
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function UserPresenceSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-2 p-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700"
        />
      ))}
    </div>
  );
}
