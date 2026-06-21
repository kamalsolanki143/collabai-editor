/**
 * CollabAI Editor — useSearch Hook
 * Manages semantic search state, history, debouncing, and API communication.
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { searchDocuments } from "@/lib/api";
import { SEARCH_DEBOUNCE_MS, MAX_SEARCH_HISTORY } from "@/lib/constants";
import type { SearchResult, SearchHistoryItem } from "@/types";

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  searchHistory: SearchHistoryItem[];
  performSearch: (searchQuery?: string) => Promise<void>;
  clearResults: () => void;
  clearHistory: () => void;
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("collabai_search_history");
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save search history to localStorage
  const saveHistory = useCallback((history: SearchHistoryItem[]) => {
    try {
      localStorage.setItem("collabai_search_history", JSON.stringify(history));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const performSearch = useCallback(
    async (searchQuery?: string) => {
      const q = (searchQuery || query).trim();
      if (!q) {
        setError("Please enter a search query.");
        return;
      }

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const response = await searchDocuments({
          query: q,
          n_results: 10,
        });

        setResults(response.results);

        // Add to search history
        const historyItem: SearchHistoryItem = {
          query: q,
          timestamp: Date.now(),
          resultCount: response.total_results,
        };

        setSearchHistory((prev) => {
          const updated = [
            historyItem,
            ...prev.filter((h) => h.query !== q),
          ].slice(0, MAX_SEARCH_HISTORY);
          saveHistory(updated);
          return updated;
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Search failed. Please try again.";
        setError(message);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [query, saveHistory]
  );

  // Debounced search on query change
  useEffect(() => {
    if (!query.trim()) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Only auto-search if query is at least 3 characters
      if (query.trim().length >= 3) {
        performSearch();
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // intentionally not including performSearch to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setQuery("");
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    saveHistory([]);
  }, [saveHistory]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchHistory,
    performSearch,
    clearResults,
    clearHistory,
  };
}
