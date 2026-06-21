/**
 * CollabAI Editor — Notification Component
 * Toast-style notification system for user events and status updates.
 */

"use client";

import React, { memo } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { Notification as NotificationType } from "@/types";

interface NotificationProps {
  notifications: NotificationType[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const colorMap = {
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-200",
  success:
    "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200",
  warning:
    "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200",
  error:
    "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-200",
};

const iconColorMap = {
  info: "text-blue-500 dark:text-blue-400",
  success: "text-emerald-500 dark:text-emerald-400",
  warning: "text-amber-500 dark:text-amber-400",
  error: "text-red-500 dark:text-red-400",
};

function NotificationStack({ notifications, onDismiss }: NotificationProps) {
  if (notifications.length === 0) return null;

  return (
    <div
      id="notification-stack"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm"
    >
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type];
        return (
          <div
            key={notification.id}
            className={`
              flex items-start gap-3 px-4 py-3 rounded-xl border shadow-glass
              animate-slide-up backdrop-blur-sm
              ${colorMap[notification.type]}
            `}
          >
            <Icon
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColorMap[notification.type]}`}
            />
            <p className="text-sm font-medium flex-1">{notification.message}</p>
            <button
              onClick={() => onDismiss(notification.id)}
              className="flex-shrink-0 p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4 opacity-60" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default memo(NotificationStack);
