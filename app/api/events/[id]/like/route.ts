import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { id: eventId } = await params

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 })
  }

  const existing = await prisma.eventLike.findUnique({
    where: { eventId_userId: { eventId, userId } },
  })

  if (existing) {
    await prisma.eventLike.delete({ where: { id: existing.id } })
    return NextResponse.json({ liked: false })
  } else {
    await prisma.eventLike.create({ data: { eventId, userId } })
    return NextResponse.json({ liked: true })
  }
}
