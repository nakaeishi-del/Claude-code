import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, priceRange: true, avatarUrl: true, googleCalendarConnected: true, createdAt: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
  }

  return NextResponse.json({ user })
}

export async function PUT(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const body = await request.json()
  const updateData: { name?: string; priceRange?: string; avatarUrl?: string | null } = {}

  if (body.name && typeof body.name === 'string' && body.name.trim()) {
    updateData.name = body.name.trim()
  }
  if (body.priceRange && ['budget', 'mid', 'high'].includes(body.priceRange)) {
    updateData.priceRange = body.priceRange
  }
  if ('avatarUrl' in body) {
    const a = body.avatarUrl
    if (a === null || a === '') {
      updateData.avatarUrl = null
    } else if (typeof a === 'string' && a.startsWith('data:image/') && a.length <= 700_000) {
      updateData.avatarUrl = a
    } else {
      return NextResponse.json({ error: '画像の形式またはサイズが無効です' }, { status: 400 })
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: '更新するデータがありません' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, priceRange: true, avatarUrl: true, googleCalendarConnected: true },
  })

  return NextResponse.json({ user })
}
