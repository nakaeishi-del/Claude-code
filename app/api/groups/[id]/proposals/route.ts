import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { findBestMeetingDates } from '@/lib/scheduler'
import { getRestaurantSuggestions } from '@/lib/restaurants'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { id: groupId } = await params

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })

  if (!membership) {
    return NextResponse.json({ error: 'このグループへのアクセス権限がありません' }, { status: 403 })
  }

  const proposals = await prisma.meetingProposal.findMany({
    where: { groupId },
    include: {
      votes: {
        include: { user: { select: { id: true, name: true } } },
      },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ proposals })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { id: groupId } = await params

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })

  if (!membership) {
    return NextResponse.json({ error: 'このグループへのアクセス権限がありません' }, { status: 403 })
  }

  try {
    const group = await prisma.group.findUnique({ where: { id: groupId } })
    if (!group) {
      return NextResponse.json({ error: 'グループが見つかりません' }, { status: 404 })
    }

    // Use manually selected date or auto-find
    let body: { date?: string } = {}
    try { body = await request.json() } catch { /* no body */ }

    let proposedDate: string
    if (body.date) {
      proposedDate = body.date
    } else {
      const bestDates = await findBestMeetingDates(groupId)
      if (bestDates.length === 0) {
        return NextResponse.json({ error: '適切な日程が見つかりませんでした' }, { status: 400 })
      }
      proposedDate = bestDates[0]
    }

    const proposedTime = '19:00'

    // Get restaurant suggestion
    const restaurants = getRestaurantSuggestions(group.priceRange, 1)
    const restaurant = restaurants[0]

    if (!restaurant) {
      return NextResponse.json({ error: 'レストランが見つかりませんでした' }, { status: 400 })
    }

    const priceLabels: Record<string, string> = {
      budget: '〜¥3,000',
      mid: '¥3,000〜¥8,000',
      high: '¥8,000〜',
    }

    const proposal = await prisma.meetingProposal.create({
      data: {
        groupId,
        createdById: userId,
        proposedDate,
        proposedTime,
        restaurantName: restaurant.name,
        restaurantArea: restaurant.area,
        restaurantGenre: restaurant.genre,
        estimatedCost: priceLabels[restaurant.priceRange] || '¥3,000〜¥8,000',
      },
      include: {
        votes: {
          include: { user: { select: { id: true, name: true } } },
        },
        createdBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ proposal }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
