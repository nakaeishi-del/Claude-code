import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Returns per-day availability scores for all group members over the next 28 days.
// score = fraction of members who are free (0–1), null = unknown
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

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { include: { availability: true } } },
      },
    },
  })
  if (!group) return NextResponse.json({ error: 'グループが見つかりません' }, { status: 404 })

  const members = group.members.map((m) => m.user)
  const memberCount = members.length

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days: { date: string; dayOfWeek: number; freeCount: number; busyCount: number; memberCount: number }[] = []

  for (let i = 1; i <= 28; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dow = d.getDay()

    let freeCount = 0
    let busyCount = 0

    for (const member of members) {
      const avail = member.availability
      const specificEntry = avail.find((a) => a.date === dateStr)
      if (specificEntry) {
        specificEntry.type === 'free' ? freeCount++ : busyCount++
        continue
      }
      const weeklyEntry = avail.find((a) => a.dayOfWeek === dow)
      if (weeklyEntry) {
        weeklyEntry.type === 'free' ? freeCount++ : busyCount++
      }
      // no entry = unknown, don't count
    }

    days.push({ date: dateStr, dayOfWeek: dow, freeCount, busyCount, memberCount })
  }

  return NextResponse.json({ days, memberCount })
}
