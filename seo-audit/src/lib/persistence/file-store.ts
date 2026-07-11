/**
 * File-based audit store — temporary implementation.
 *
 * Stores audit results as JSON files in `data/audits/` relative to the project
 * root. This is intentionally simple so the app works without any external
 * service in development or early production.
 *
 * ⚠️ Replace this with a real database store before scaling beyond a few
 *    hundred audits per day.
 */

import fs from 'fs/promises';
import path from 'path';
import type { AuditStore } from './index';
import type { AuditResult } from '@/types/audit';

const DATA_DIR = path.join(process.cwd(), 'data', 'audits');

export class FileAuditStore implements AuditStore {
  private async ensureDir(): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  async save(result: AuditResult): Promise<void> {
    await this.ensureDir();
    const filePath = path.join(DATA_DIR, `${result.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');
  }

  async findById(id: string): Promise<AuditResult | null> {
    try {
      const filePath = path.join(DATA_DIR, `${id}.json`);
      const raw = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(raw) as AuditResult;
    } catch {
      return null;
    }
  }

  async findAll(): Promise<AuditResult[]> {
    try {
      await this.ensureDir();
      const files = await fs.readdir(DATA_DIR);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));
      const results = await Promise.all(
        jsonFiles.map(async (file) => {
          const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
          return JSON.parse(raw) as AuditResult;
        }),
      );
      // Most recent first
      return results.sort(
        (a, b) =>
          new Date(b.auditedAt).getTime() - new Date(a.auditedAt).getTime(),
      );
    } catch {
      return [];
    }
  }
}
