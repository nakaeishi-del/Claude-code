import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 思い出: past confirmed meetups across all of the user's groups,
// newest first. Powers the "これまでの集まり" section.
export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true },
  })
  const groupIds = memberships.map((m) => m.groupId)
  if (groupIds.length === 0) return NextResponse.json({ memories: [], totalCount: 0 })

  const today = new Date().toISOString().split('T')[0]

  const past = await prisma.meetingProposal.findMany({
    where: {
      groupId: { in: groupIds },
      status: 'confirmed',
      proposedDate: { lt: today },
    },
    include: {
      group: { select: { id: true, name: true, members: { select: { user: { select: { id: true, name: true, avatarUrl: true } } } } } },
    },
    orderBy: { proposedDate: 'desc' },
    take: 20,
  })

  const memories = past.map((p) => ({
    id: p.id,
    date: p.proposedDate,
    time: p.proposedTime,
    restaurantName: p.restaurantName,
    restaurantArea: p.restaurantArea,
    restaurantGenre: p.restaurantGenre,
    groupId: p.group.id,
    groupName: p.group.name,
    members: p.group.members.map((m) => m.user),
  }))

  return NextResponse.json({ memories, totalCount: memories.length })
}
