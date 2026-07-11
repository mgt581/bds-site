/**
 * POST /api/audit
 *
 * Accepts: { url, businessName, email }
 * Returns: AuditResult JSON
 *
 * Future additions:
 *  - Rate limiting (e.g. Upstash Redis)
 *  - Email delivery via Resend
 *  - PDF generation trigger
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAudit } from '@/lib/audit';
import { createStore } from '@/lib/persistence';
import type { AuditInput } from '@/types/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, businessName, email } = body as Partial<AuditInput>;

    // Basic validation
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'A valid URL is required.' },
        { status: 400 },
      );
    }
    if (!businessName || typeof businessName !== 'string') {
      return NextResponse.json(
        { error: 'Business name is required.' },
        { status: 400 },
      );
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 },
      );
    }

    const input: AuditInput = {
      url: url.trim(),
      businessName: businessName.trim(),
      email: email.trim().toLowerCase(),
    };

    const result = await runAudit(input);

    // Persist the result (fire-and-forget — don't block the response)
    const store = await createStore();
    store.save(result).catch((err: unknown) => {
      console.error('[audit] Failed to persist result:', err);
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error('[audit] Unexpected error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
