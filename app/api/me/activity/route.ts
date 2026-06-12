import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Returns recent activity across all groups the user belongs to
export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true, group: { select: { name: true } } },
  })

  const groupIds = memberships.map((m) => m.groupId)
  const groupNames: Record<string, string> = {}
  memberships.forEach((m) => { groupNames[m.groupId] = m.group.name })

  if (groupIds.length === 0) return NextResponse.json({ activities: [] })

  const [recentProposals, recentVotes, recentMessages, recentMembers] = await Promise.all([
    prisma.meetingProposal.findMany({
      where: { groupId: { in: groupIds } },
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.meetingVote.findMany({
      where: {
        proposal: { groupId: { in: groupIds } },
        userId: { not: userId },
      },
      include: {
        user: { select: { id: true, name: true } },
        proposal: { select: { id: true, groupId: true, restaurantName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.groupMessage.findMany({
      where: { groupId: { in: groupIds }, userId: { not: userId } },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.groupMember.findMany({
      where: { groupId: { in: groupIds }, userId: { not: userId } },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { joinedAt: 'desc' },
      take: 3,
    }),
  ])

  type Activity = {
    id: string
    type: string
    groupId: string
    groupName: string
    text: string
    createdAt: string
  }

  const activities: Activity[] = [
    ...recentProposals.map((p) => ({
      id: `proposal-${p.id}`,
      type: 'proposal',
      groupId: p.groupId,
      groupName: groupNames[p.groupId] || '',
      text: `${p.createdBy.name}さんが「${p.restaurantName}」を提案しました`,
      createdAt: p.createdAt.toISOString(),
    })),
    ...recentVotes.map((v) => ({
      id: `vote-${v.id}`,
      type: 'vote',
      groupId: v.proposal.groupId,
      groupName: groupNames[v.proposal.groupId] || '',
      text: `${v.user.name}さんが「${v.proposal.restaurantName}」に${v.vote === 'accept' ? '参加' : v.vote === 'decline' ? '欠席' : '未定'}と回答しました`,
      createdAt: (v as { createdAt: Date }).createdAt.toISOString(),
    })),
    ...recentMessages.map((m) => ({
      id: `msg-${m.id}`,
      type: 'message',
      groupId: m.groupId,
      groupName: groupNames[m.groupId] || '',
      text: `${m.user.name}さん: 「${m.content.length > 30 ? m.content.slice(0, 30) + '…' : m.content}」`,
      createdAt: m.createdAt.toISOString(),
    })),
    ...recentMembers.map((m) => ({
      id: `member-${m.id}`,
      type: 'member',
      groupId: m.groupId,
      groupName: groupNames[m.groupId] || '',
      text: `${m.user.name}さんがグループに参加しました`,
      createdAt: m.joinedAt.toISOString(),
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10)

  return NextResponse.json({ activities })
}
