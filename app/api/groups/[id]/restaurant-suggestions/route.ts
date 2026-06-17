import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getRestaurantSuggestions } from '@/lib/restaurants'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession(request)
  if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { id: groupId } = await params

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!membership) return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 })

  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { priceRange: true } })
  if (!group) return NextResponse.json({ error: 'グループが見つかりません' }, { status: 404 })

  const suggestions = getRestaurantSuggestions(group.priceRange, 3)
  return NextResponse.json({ suggestions })
}
