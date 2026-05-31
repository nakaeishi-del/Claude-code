import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          proposals: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { votes: true },
          },
        },
      },
    },
  })

  const groups = memberships.map((m) => ({
    ...m.group,
    memberCount: m.group.members.length,
    myRole: m.role,
    latestProposal: m.group.proposals[0] || null,
  }))

  return NextResponse.json({ groups })
}

export async function POST(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  try {
    const { name, description, priceRange } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'グループ名を入力してください' }, { status: 400 })
    }

    const group = await prisma.group.create({
      data: {
        name,
        description: description || null,
        priceRange: priceRange || 'mid',
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
