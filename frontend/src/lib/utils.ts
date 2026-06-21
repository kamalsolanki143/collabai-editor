/**
 * CollabAI Editor — Utilities
 * Helper functions for the frontend.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind CSS classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a random username.
 */
export function generateUsername(): string {
  const adjectives = [
    "Swift", "Bright", "Calm", "Daring", "Eager",
    "Gentle", "Happy", "Keen", "Lively", "Noble",
    "Quick", "Sharp", "Vivid", "Wise", "Zen",
  ];
  const nouns = [
    "Falcon", "Phoenix", "Tiger", "Dolphin", "Eagle",
    "Panther", "Hawk", "Wolf", "Fox", "Owl",
    "Raven", "Lynx", "Bear", "Stag", "Crane",
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}
