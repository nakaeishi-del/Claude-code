import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const genre = searchParams.get('genre')

  const where: Record<string, string> = {}
  if (date) where.date = date
  if (genre && genre !== 'all') where.genre = genre

  const events = await prisma.event.findMany({
    where,
    include: {
      likes: userId ? { where: { userId } } : false,
    },
    orderBy: { date: 'asc' },
  })

  const eventsWithLike = events.map((event) => ({
    ...event,
    liked: userId ? event.likes.length > 0 : false,
    likeCount: event.likes.length,
  }))

  return NextResponse.json({ events: eventsWithLike })
}
