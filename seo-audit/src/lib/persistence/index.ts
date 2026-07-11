/**
 * Persistence abstraction layer.
 *
 * The `AuditStore` interface defines the contract that any persistence
 * implementation must satisfy. Currently a file-based store is used so the
 * app works without a database. Swap `createStore()` to return a real
 * database-backed implementation when ready.
 *
 * Planned future implementations:
 *  - PostgreSQL / Supabase (replace FileAuditStore with SupabaseAuditStore)
 *  - PlanetScale / MySQL
 *  - MongoDB
 */

import type { AuditResult } from '@/types/audit';

/** Contract for any audit persistence backend. */
export interface AuditStore {
  save(result: AuditResult): Promise<void>;
  findById(id: string): Promise<AuditResult | null>;
  findAll(): Promise<AuditResult[]>;
}

/**
 * Returns the active store implementation.
 * Swap this function's return value to change persistence backends.
 */
export async function createStore(): Promise<AuditStore> {
  // TODO: Replace with a real DB-backed store in a future iteration.
  // e.g. return new SupabaseAuditStore(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { FileAuditStore } = await import('./file-store');
  return new FileAuditStore();
}
