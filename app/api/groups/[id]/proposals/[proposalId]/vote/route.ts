import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { id: groupId, proposalId } = await params

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })

  if (!membership) {
    return NextResponse.json({ error: 'このグループへのアクセス権限がありません' }, { status: 403 })
  }

  try {
    const { vote } = await request.json()

    if (!['accept', 'decline', 'maybe'].includes(vote)) {
      return NextResponse.json({ error: '無効な投票です' }, { status: 400 })
    }

    const proposal = await prisma.meetingProposal.findUnique({
      where: { id: proposalId },
      include: { votes: true },
    })

    if (!proposal || proposal.groupId !== groupId) {
      return NextResponse.json({ error: '提案が見つかりません' }, { status: 404 })
    }

    // Upsert vote
    await prisma.meetingVote.upsert({
      where: { proposalId_userId: { proposalId, userId } },
      update: { vote },
      create: { proposalId, userId, vote },
    })

    // Check if all members voted accept
    const groupMembers = await prisma.groupMember.findMany({ where: { groupId } })
    const memberCount = groupMembers.length

    const acceptVotes = await prisma.meetingVote.count({
      where: { proposalId, vote: 'accept' },
    })

    if (acceptVotes >= memberCount && proposal.status === 'pending') {
      await prisma.meetingProposal.update({
        where: { id: proposalId },
        data: { status: 'confirmed' },
      })
    }

    const updatedProposal = await prisma.meetingProposal.findUnique({
      where: { id: proposalId },
      include: {
        votes: {
          include: { user: { select: { id: true, name: true } } },
        },
        createdBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ proposal: updatedProposal })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
