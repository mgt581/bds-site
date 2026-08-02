import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { corsHeaders } from '@/lib/http/cors'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const GOOGLE_PROFILE_URL =
  process.env.GOOGLE_REVIEWS_URL || 'https://share.google/CXVLfLhnIW2oIhY9i'

const reviewSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(5).max(500),
  website: z.string().max(0).optional().default(''),
}).strict()

type PublicReview = {
  id: string
  name: string
  description: string
  source: 'website' | 'google'
  rating: number | null
  createdAt: string
}

type GoogleReviewResponse = {
  reviews?: Array<{
    name?: string
    rating?: number
    publishTime?: string
    text?: { text?: string }
    originalText?: { text?: string }
    authorAttribution?: { displayName?: string }
  }>
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
}

let googleCache:
  | {
      expiresAt: number
      reviews: PublicReview[]
      rating: number | null
      total: number | null
      profileUrl: string
    }
  | undefined

function json(request: NextRequest, body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      ...corsHeaders(request, 'GET, POST, OPTIONS'),
      'Cache-Control': 'no-store',
    },
  })
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

async function getGoogleReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  if (!apiKey || !placeId) {
    return {
      connected: false,
      reviews: [] as PublicReview[],
      rating: null,
      total: null,
      profileUrl: GOOGLE_PROFILE_URL,
    }
  }

  if (googleCache && googleCache.expiresAt > Date.now()) {
    return { connected: true, ...googleCache }
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'rating,userRatingCount,reviews,googleMapsUri',
        },
        next: { revalidate: 900 },
      }
    )

    if (!response.ok) {
      console.error('[api/reviews] Google Places failed:', response.status)
      throw new Error('Google Places request failed')
    }

    const data = (await response.json()) as GoogleReviewResponse
    const reviews = (data.reviews || [])
      .filter((review) => review.text?.text || review.originalText?.text)
      .map((review, index): PublicReview => ({
        id: `google-${review.name || index}`,
        name: review.authorAttribution?.displayName || 'Google reviewer',
        description: review.text?.text || review.originalText?.text || '',
        source: 'google',
        rating: typeof review.rating === 'number' ? review.rating : null,
        createdAt: review.publishTime || new Date(0).toISOString(),
      }))

    googleCache = {
      expiresAt: Date.now() + 15 * 60 * 1000,
      reviews,
      rating: typeof data.rating === 'number' ? data.rating : null,
      total: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
      profileUrl: data.googleMapsUri || GOOGLE_PROFILE_URL,
    }

    return { connected: true, ...googleCache }
  } catch (error) {
    console.error('[api/reviews] Google review sync failed:', error)
    return {
      connected: false,
      reviews: [] as PublicReview[],
      rating: null,
      total: null,
      profileUrl: GOOGLE_PROFILE_URL,
    }
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request, 'GET, POST, OPTIONS'),
  })
}

export async function GET(request: NextRequest) {
  try {
    const [websiteReviews, google] = await Promise.all([
      prisma.review.findMany({
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      }),
      getGoogleReviews(),
    ])

    const reviews: PublicReview[] = [
      ...google.reviews,
      ...websiteReviews.map((review) => ({
        id: review.id,
        name: review.name,
        description: review.description,
        source: 'website' as const,
        rating: null,
        createdAt: review.createdAt.toISOString(),
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return json(request, {
      reviews,
      websiteReviewCount: websiteReviews.length,
      google: {
        connected: google.connected,
        displayedReviewCount: google.reviews.length,
        totalReviewCount: google.total,
        rating: google.rating,
        profileUrl: google.profileUrl,
      },
    })
  } catch (error) {
    console.error('[api/reviews] Failed to load reviews:', error)
    return json(request, { error: 'Reviews are temporarily unavailable.' }, 503)
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(`review:${getClientIp(request)}`)
    if (!rateLimit.allowed) {
      return json(
        request,
        { error: 'Too many reviews submitted. Please try again later.' },
        429
      )
    }

    const parsed = reviewSchema.safeParse(await request.json())
    if (!parsed.success) {
      return json(
        request,
        { error: 'Enter your name and a review between 5 and 500 characters.' },
        400
      )
    }

    const review = await prisma.review.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
    })

    return json(
      request,
      {
        success: true,
        review: {
          ...review,
          source: 'website',
          rating: null,
          createdAt: review.createdAt.toISOString(),
        },
      },
      201
    )
  } catch (error) {
    console.error('[api/reviews] Failed to save review:', error)
    return json(
      request,
      { error: 'Your review could not be saved. Please try again.' },
      500
    )
  }
}
