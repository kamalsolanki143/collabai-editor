/**
 * CollabAI Editor — Root Layout
 * Defines HTML structure, metadata, fonts, and dark mode class.
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CollabAI Editor — Real-Time Collaborative Document Editor",
  description:
    "A web-based real-time collaborative rich text editor with AI-powered semantic search. Edit documents simultaneously with multiple users and search content using natural language.",
  keywords: [
    "collaborative editor",
    "real-time editing",
    "AI search",
    "semantic search",
    "document editor",
    "TipTap",
    "Yjs",
    "CRDT",
  ],
  authors: [{ name: "CollabAI Team" }],
  openGraph: {
    title: "CollabAI Editor",
    description:
      "Real-time collaborative document editing with AI-powered semantic search.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
