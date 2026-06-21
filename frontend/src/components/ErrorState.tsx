/**
 * CollabAI Editor — Error State Component
 * Reusable component for displaying error states.
 */

"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in w-full h-full min-h-[300px]">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/50">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-red-600 dark:text-red-400 max-w-sm mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
