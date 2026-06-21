/**
 * CollabAI Editor — SearchPanel Component
 * Semantic search interface with results, history, sample queries, and state management.
 */

"use client";

import React, { memo, useState } from "react";
import {
  Search,
  Sparkles,
  X,
  Clock,
  Trash2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { SAMPLE_QUERIES } from "@/lib/constants";
import { SearchSkeleton } from "./LoadingSkeleton";

interface SearchPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const parts = text.split(new RegExp(`(${words.join("|")})`, "gi"));

  return parts.map((part, i) =>
    words.includes(part.toLowerCase()) ? (
      <mark
        key={i}
        className="bg-brand-100 dark:bg-brand-900/50 text-brand-800 dark:text-brand-200 px-0.5 rounded"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40";
  if (score >= 0.6) return "text-brand-500 bg-brand-50 dark:bg-brand-950/40";
  if (score >= 0.4) return "text-amber-500 bg-amber-50 dark:bg-amber-950/40";
  return "text-surface-400 bg-surface-50 dark:bg-surface-800";
}

function SearchPanel({ isOpen, onToggle }: SearchPanelProps) {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchHistory,
    performSearch,
    clearResults,
    clearHistory,
  } = useSearch();

  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="search-panel"
      className="
        w-full lg:w-96 flex flex-col
        bg-white dark:bg-surface-900
        border-l border-surface-200 dark:border-surface-700
        animate-slide-left h-full overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/30">
            <Sparkles className="w-4 h-4 text-brand-500" />
          </div>
          <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            AI Semantic Search
          </h2>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 transition-colors"
          aria-label="Close search panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search input */}
      <div className="p-4 border-b border-surface-100 dark:border-surface-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search document content..."
            className="
              w-full pl-10 pr-10 py-2.5 rounded-xl text-sm
              bg-surface-50 dark:bg-surface-800
              border border-surface-200 dark:border-surface-700
              text-surface-900 dark:text-surface-100
              placeholder:text-surface-400 dark:placeholder:text-surface-500
              focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400
              transition-all
            "
          />
          {query && (
            <button
              onClick={clearResults}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search button */}
        <button
          onClick={() => performSearch()}
          disabled={isLoading || !query.trim()}
          className="
            w-full mt-2 px-4 py-2 rounded-xl text-sm font-medium
            bg-brand-600 hover:bg-brand-700 text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all active:scale-[0.98]
            flex items-center justify-center gap-2
          "
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Search
            </>
          )}
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
      {/* AI Search (Beta)*/}
      {error && (
        <div className="m-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 animate-scale-in">
          <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          AI Search (Coming Soon)
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Semantic search is currently being upgraded and will be available in a future release.
        </p>
      </div>
    </div>
  </div>
)}

        {/* Loading state */}
        {isLoading && <SearchSkeleton />}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {results.map((result, index) => (
              <div
                key={index}
                className="
                  p-4 rounded-xl
                  bg-surface-50 dark:bg-surface-800/50
                  border border-surface-100 dark:border-surface-700/50
                  hover:border-brand-200 dark:hover:border-brand-800
                  transition-all duration-200
                  animate-slide-up
                "
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Score badge */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`
                      text-xs font-bold px-2 py-0.5 rounded-full
                      ${getScoreColor(result.score)}
                    `}
                  >
                    {Math.round(result.score * 100)}% match
                  </span>
                  <span className="text-xs text-surface-400 dark:text-surface-500">
                    Chunk #{result.chunk_index + 1}
                  </span>
                </div>

                {/* Result text with highlighting */}
                <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                  {highlightText(result.text, query)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Empty search results state */}
        {!isLoading && !error && query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-surface-400" />
            </div>
            <p className="text-sm font-medium text-surface-600 dark:text-surface-400 text-center">
              No results found
            </p>
            <p className="text-xs text-surface-400 dark:text-surface-500 text-center mt-1">
              Try a different query or ensure the document has been indexed.
            </p>
          </div>
        )}

        {/* Sample queries (shown when no query) */}
        {!query && showSuggestions && (
          <div className="p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                Try a sample query
              </p>
            </div>
            <div className="space-y-1.5">
              {SAMPLE_QUERIES.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(sample);
                    performSearch(sample);
                  }}
                  className="
                    w-full text-left px-3 py-2.5 rounded-lg text-xs
                    text-surface-600 dark:text-surface-400
                    hover:bg-brand-50 dark:hover:bg-brand-950/30
                    hover:text-brand-700 dark:hover:text-brand-300
                    transition-colors
                  "
                >
                  <span className="text-brand-400 mr-1.5">→</span>
                  {sample}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search history */}
        {searchHistory.length > 0 && !query && (
          <div className="p-4 border-t border-surface-100 dark:border-surface-800">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Recent Searches
              </span>
              {showHistory ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showHistory && (
              <div className="mt-2 space-y-1 animate-slide-down">
                {searchHistory.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(item.query);
                      performSearch(item.query);
                    }}
                    className="
                      w-full text-left flex items-center justify-between
                      px-3 py-2 rounded-lg text-xs
                      text-surface-600 dark:text-surface-400
                      hover:bg-surface-50 dark:hover:bg-surface-800
                      transition-colors
                    "
                  >
                    <span className="truncate">{item.query}</span>
                    <span className="text-surface-300 dark:text-surface-600 flex-shrink-0 ml-2">
                      {item.resultCount} results
                    </span>
                  </button>
                ))}

                <button
                  onClick={clearHistory}
                  className="
                    w-full flex items-center justify-center gap-1.5 mt-2
                    px-3 py-2 rounded-lg text-xs
                    text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20
                    transition-colors
                  "
                >
                  <Trash2 className="w-3 h-3" />
                  Clear History
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(SearchPanel);
