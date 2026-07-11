import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const report = await prisma.auditReport.findUnique({
      where: { id },
      include: { lead: true },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({ report })
  } catch (err) {
    console.error('[api/reports/:id] Failed to fetch report:', err)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
