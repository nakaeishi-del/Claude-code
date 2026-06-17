import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession(request)
  if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { id: groupId } = await params

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!membership) return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 })

  // Get all member userIds
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true, user: { select: { id: true, name: true } } },
  })
  const memberIds = members.map((m) => m.userId)
  const memberMap: Record<string, string> = {}
  members.forEach((m) => { memberMap[m.userId] = m.user.name })

  // Get event likes by group members
  const likes = await prisma.eventLike.findMany({
    where: { userId: { in: memberIds } },
    include: { event: true },
    orderBy: { event: { date: 'asc' } },
  })

  // Group by event
  const byEvent: Record<string, { event: typeof likes[0]['event']; likedBy: { id: string; name: string }[] }> = {}
  for (const like of likes) {
    if (!byEvent[like.eventId]) {
      byEvent[like.eventId] = { event: like.event, likedBy: [] }
    }
    byEvent[like.eventId].likedBy.push({ id: like.userId, name: memberMap[like.userId] || '?' })
  }

  const events = Object.values(byEvent)
    .sort((a, b) => b.likedBy.length - a.likedBy.length || a.event.date.localeCompare(b.event.date))
    .slice(0, 6)

  return NextResponse.json({ events })
}
