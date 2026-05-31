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
  const { groupId } = await request.json()

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!membership) {
    return NextResponse.json({ error: 'グループのメンバーではありません' }, { status: 403 })
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 })
  }

  const proposal = await prisma.meetingProposal.create({
    data: {
      groupId,
      createdById: userId,
      proposedDate: event.date,
      proposedTime: '18:00',
      restaurantName: event.title,
      restaurantArea: event.area,
      restaurantGenre: event.genre,
      estimatedCost: '要確認',
    },
  })

  return NextResponse.json({ proposalId: proposal.id })
}
