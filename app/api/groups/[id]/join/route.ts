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

  const { id: groupId } = await params

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  })

  if (!group) {
    return NextResponse.json({ error: 'グループが見つかりません' }, { status: 404 })
  }

  const alreadyMember = group.members.some((m) => m.userId === userId)
  if (alreadyMember) {
    return NextResponse.json({ error: 'すでにメンバーです' }, { status: 400 })
  }

  if (group.members.length >= 4) {
    return NextResponse.json({ error: 'グループは最大4人です' }, { status: 400 })
  }

  const member = await prisma.groupMember.create({
    data: { groupId, userId, role: 'member' },
    include: { user: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ member })
}
