/**
 * Form constants and configuration
 */

export const BUDGET_OPTIONS = [
  "< $1k",
  "$1k – $5k",
  "$5k – $10k",
  "$10k – $50k",
  "$50k – $250k",
  "$250k – $1m",
] as const;

export const TIMELINE_OPTIONS = [
  "ASAP",
  "Less than a week",
  "Less than a month",
  "2 to 6 months",
  "Less than a year",
] as const;

export const DEFAULT_SOURCE = "website" as const;

export const API_ENDPOINTS = {
  LEAD: "/lead",
} as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

