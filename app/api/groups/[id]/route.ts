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
          user: {
            select: { id: true, name: true, email: true, priceRange: true },
            include: { availability: { select: { id: true }, take: 1 } },
          },
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

  // Attach hasAvailability flag to each member
  const groupWithFlags = {
    ...group,
    members: group.members.map((m) => ({
      ...m,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        priceRange: m.user.priceRange,
        hasAvailability: (m.user as typeof m.user & { availability: { id: string }[] }).availability.length > 0,
      },
    })),
  }

  return NextResponse.json({ group: groupWithFlags, myRole: membership.role })
}

export async function DELETE(
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

  const body = await request.json().catch(() => ({})) as { action?: string }

  if (body.action === 'leave') {
    if (membership.role === 'owner') {
      return NextResponse.json({ error: 'オーナーはグループを退出できません。グループを削除してください。' }, { status: 400 })
    }
    await prisma.groupMember.delete({ where: { groupId_userId: { groupId: id, userId } } })
    return NextResponse.json({ ok: true })
  }

  // Delete group — owner only
  if (membership.role !== 'owner') {
    return NextResponse.json({ error: 'グループを削除できるのはオーナーのみです' }, { status: 403 })
  }

  await prisma.group.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
