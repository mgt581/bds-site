/**
 * Core types for the SEO audit engine.
 * These are shared across the audit, scoring, prioritization, and persistence layers.
 */

export type Priority = 'high' | 'medium' | 'low';

export type FindingStatus = 'pass' | 'warning' | 'fail';

export interface AuditFinding {
  /** Unique identifier for this check (e.g. "title-length") */
  id: string;
  /** Category of check (e.g. "Title", "Meta Description") */
  category: string;
  /** Short label shown in the UI */
  label: string;
  /** Pass / warning / fail */
  status: FindingStatus;
  /** Priority level assigned by the prioritization layer */
  priority: Priority;
  /** Plain-English explanation of what was found */
  explanation: string;
  /** Optional: the actual value found on the page */
  value?: string;
  /** Points deducted from the score (0 for passes) */
  pointsDeducted: number;
}

export interface AuditInput {
  url: string;
  businessName: string;
  email: string;
}

export interface AuditResult {
  id: string;
  input: AuditInput;
  auditedAt: string; // ISO string
  score: number; // 0–100
  findings: AuditFinding[];
  /** Convenience breakdown by priority */
  summary: {
    high: number;
    medium: number;
    low: number;
    passed: number;
  };
}

/** Raw data extracted from the page during crawl */
export interface PageData {
  url: string;
  title: string | null;
  metaDescription: string | null;
  h1s: string[];
  h2s: string[];
  h3s: string[];
  images: { src: string; alt: string | null }[];
  canonicalUrl: string | null;
  robotsMeta: string | null;
  /** HTTP status code of the page */
  statusCode: number;
  /** Page fetch error, if any */
  fetchError?: string;
}
