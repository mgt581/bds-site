/**
 * Image alt text checks.
 *
 * SEO / accessibility best-practice rules:
 *  - All meaningful images should have a non-empty alt attribute
 *  - Decorative images may have alt="" intentionally (we flag empty string separately)
 */

import type { AuditFinding, PageData } from '@/types/audit';

export function checkImages(page: PageData): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const { images } = page;

  if (images.length === 0) {
    findings.push({
      id: 'images-none',
      category: 'Images',
      label: 'No images found on the page',
      status: 'pass',
      priority: 'low',
      explanation: 'No images were detected on this page, so there are no alt text issues.',
      pointsDeducted: 0,
    });
    return findings;
  }

  const missing = images.filter((img) => img.alt === null);
  const empty = images.filter((img) => img.alt !== null && img.alt.trim() === '');
  const withAlt = images.filter((img) => img.alt !== null && img.alt.trim() !== '');

  // ── 1. Images with no alt attribute at all ──────────────────────────────────
  if (missing.length > 0) {
    const pct = Math.round((missing.length / images.length) * 100);
    findings.push({
      id: 'images-missing-alt',
      category: 'Images',
      label: `${missing.length} image${missing.length > 1 ? 's' : ''} missing alt text`,
      status: missing.length > images.length / 2 ? 'fail' : 'warning',
      priority: missing.length > 2 ? 'high' : 'medium',
      explanation: `${missing.length} of your ${images.length} images (${pct}%) have no alt attribute. Alt text helps search engines understand your images and is essential for screen reader accessibility. Add a brief, descriptive alt to every meaningful image.`,
      value: missing.slice(0, 3).map((i) => i.src).join(', ') + (missing.length > 3 ? '…' : ''),
      pointsDeducted: Math.min(missing.length * 3, 15),
    });
  }

  // ── 2. Images with intentionally empty alt ─────────────────────────────────
  if (empty.length > 0) {
    findings.push({
      id: 'images-empty-alt',
      category: 'Images',
      label: `${empty.length} image${empty.length > 1 ? 's' : ''} with empty alt=""`,
      status: 'pass',
      priority: 'low',
      explanation: `${empty.length} image${empty.length > 1 ? 's have' : ' has'} an empty alt attribute (alt=""). This is correct for purely decorative images, but double-check that none of these carry meaningful information for visitors.`,
      pointsDeducted: 0,
    });
  }

  // ── 3. Images with alt text ─────────────────────────────────────────────────
  if (withAlt.length > 0 && missing.length === 0) {
    findings.push({
      id: 'images-alt-ok',
      category: 'Images',
      label: `All ${withAlt.length} image${withAlt.length > 1 ? 's' : ''} have alt text`,
      status: 'pass',
      priority: 'low',
      explanation: `All images on this page include descriptive alt text. Great job — this helps both SEO and accessibility.`,
      pointsDeducted: 0,
    });
  }

  return findings;
}
