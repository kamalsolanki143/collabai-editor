/**
 * CollabAI Editor — Empty State Component
 * Reusable component for displaying empty states (no results, no documents, etc.)
 */

"use client";

import React from "react";
import { FileText } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon = <FileText className="w-8 h-8 text-surface-400" />,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in w-full h-full min-h-[300px]">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
