/**
 * CollabAI Editor — ConnectionStatus Component
 * Visual indicator for WebSocket connection state.
 */

"use client";

import React, { memo } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import type { ConnectionStatus as ConnectionStatusType } from "@/types";

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

const statusConfig = {
  connected: {
    icon: Wifi,
    label: "Connected",
    dotColor: "bg-emerald-400",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  connecting: {
    icon: Loader2,
    label: "Connecting...",
    dotColor: "bg-amber-400",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  reconnecting: {
    icon: Loader2,
    label: "Reconnecting...",
    dotColor: "bg-amber-400",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  disconnected: {
    icon: WifiOff,
    label: "Disconnected",
    dotColor: "bg-red-400",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
  },
};

function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isAnimating = status === "connecting" || status === "reconnecting";

  return (
    <div
      id="connection-status"
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
        border transition-all duration-300
        ${config.bgColor} ${config.borderColor} ${config.textColor}
      `}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`
            absolute inline-flex h-full w-full rounded-full opacity-75
            ${config.dotColor}
            ${status === "connected" ? "animate-ping" : ""}
          `}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}
        />
      </span>
      <Icon className={`w-3.5 h-3.5 ${isAnimating ? "animate-spin" : ""}`} />
      <span>{config.label}</span>
    </div>
  );
}

export default memo(ConnectionStatus);
