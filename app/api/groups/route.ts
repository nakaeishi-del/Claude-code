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
            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
          },
          proposals: {
            orderBy: { createdAt: 'desc' },
            include: { votes: { select: { userId: true } } },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true, content: true, user: { select: { name: true } } },
          },
        },
      },
    },
  })

  const groups = memberships.map((m) => {
    const allProposals = m.group.proposals
    const pendingVoteCount = allProposals.filter(
      (p) => p.status === 'pending' && !p.votes.some((v) => v.userId === userId)
    ).length
    const latestProposal = allProposals[0] || null
    const lastMessage = m.group.messages[0] || null
    return {
      ...m.group,
      proposals: undefined,
      messages: undefined,
      memberCount: m.group.members.length,
      myRole: m.role,
      latestProposal,
      pendingVoteCount,
      lastMessage,
    }
  })

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
