import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { id } = await params

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  })

  if (!membership) {
    return NextResponse.json({ error: 'このグループへのアクセス権限がありません' }, { status: 403 })
  }

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, priceRange: true } },
        },
        orderBy: { joinedAt: 'asc' },
      },
      proposals: {
        include: {
          votes: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!group) {
    return NextResponse.json({ error: 'グループが見つかりません' }, { status: 404 })
  }

  return NextResponse.json({ group, myRole: membership.role })
}
