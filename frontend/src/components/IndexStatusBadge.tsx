/**
 * CollabAI Editor — IndexStatusBadge Component
 * Visual badge showing the current document indexing state.
 */

"use client";

import React, { memo } from "react";
import { Database, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import type { IndexingStatus as IndexingStatusType } from "@/types";

interface IndexStatusBadgeProps {
  status: IndexingStatusType;
}

const statusConfig = {
  idle: {
    icon: Database,
    label: "Not indexed",
    color: "text-surface-400 dark:text-surface-500",
    bg: "bg-surface-50 dark:bg-surface-800/50",
    border: "border-surface-200 dark:border-surface-700",
  },
  pending: {
    icon: Clock,
    label: "Pending...",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
  },
  indexing: {
    icon: Loader2,
    label: "Indexing...",
    color: "text-brand-500 dark:text-brand-400",
    bg: "bg-brand-50 dark:bg-brand-950/30",
    border: "border-brand-200 dark:border-brand-800",
  },
  indexed: {
    icon: CheckCircle,
    label: "Indexed",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  failed: {
    icon: AlertCircle,
    label: "Failed",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
  },
};

function IndexStatusBadge({ status }: IndexStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
        border transition-all duration-300
        ${config.bg} ${config.border} ${config.color}
      `}
    >
      <Icon
        className={`w-3.5 h-3.5 ${status === "indexing" ? "animate-spin" : ""}`}
      />
      <span>{config.label}</span>
    </div>
  );
}

export default memo(IndexStatusBadge);
