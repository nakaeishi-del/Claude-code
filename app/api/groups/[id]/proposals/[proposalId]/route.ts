import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
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

  const proposal = await prisma.meetingProposal.findUnique({ where: { id: proposalId } })
  if (!proposal || proposal.groupId !== groupId) {
    return NextResponse.json({ error: '提案が見つかりません' }, { status: 404 })
  }

  if (proposal.status !== 'pending') {
    return NextResponse.json({ error: 'この提案はすでに確定またはキャンセル済みです' }, { status: 400 })
  }

  // Only the proposal creator or group owner can cancel
  if (proposal.createdById !== userId && membership.role !== 'owner') {
    return NextResponse.json({ error: 'キャンセル権限がありません' }, { status: 403 })
  }

  const updated = await prisma.meetingProposal.update({
    where: { id: proposalId },
    data: { status: 'cancelled' },
    include: {
      votes: { include: { user: { select: { id: true, name: true } } } },
      createdBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ proposal: updated })
}
