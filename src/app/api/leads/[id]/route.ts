import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { leadUpdateSchema } from '@/lib/validations/audit'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { auditReports: { orderBy: { createdAt: 'desc' } } },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ lead })
  } catch (err) {
    console.error('[api/leads/:id] Failed to fetch lead:', err)
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await request.json()
    const parsed = leadUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json({ lead })
  } catch (err) {
    console.error('[api/leads/:id] Failed to update lead:', err)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}
