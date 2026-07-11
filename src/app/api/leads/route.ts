import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const status = searchParams.get('status')
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')

    const where: Prisma.LeadWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { website: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status && ['NEW', 'CONTACTED', 'WON', 'LOST'].includes(status)) {
      where.status = status as Prisma.LeadWhereInput['status']
    }

    if (minScore || maxScore) {
      where.auditReports = {
        some: {
          overallScore: {
            gte: minScore ? Number(minScore) : undefined,
            lte: maxScore ? Number(maxScore) : undefined,
          },
        },
      }
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        auditReports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, overallScore: true, createdAt: true },
        },
      },
      take: 200,
    })

    return NextResponse.json({ leads })
  } catch (err) {
    console.error('[api/leads] Failed to fetch leads:', err)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}
