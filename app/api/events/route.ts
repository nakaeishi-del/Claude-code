import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') // "YYYY-MM"
  const genre = searchParams.get('genre')

  const where: {
    date?: { gte: string; lte: string }
    genre?: string
  } = {}

  if (month) {
    where.date = {
      gte: `${month}-01`,
      lte: `${month}-31`,
    }
  }
  if (genre && genre !== 'all') where.genre = genre

  const events = await prisma.event.findMany({
    where,
    include: { likes: true },
    orderBy: { date: 'asc' },
  })

  const eventsWithLike = events.map((event) => ({
    id: event.id,
    date: event.date,
    title: event.title,
    genre: event.genre,
    venue: event.venue,
    area: event.area,
    description: event.description,
    url: event.url,
    liked: userId ? event.likes.some((l) => l.userId === userId) : false,
    likeCount: event.likes.length,
  }))

  return NextResponse.json({ events: eventsWithLike })
}
