import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const availability = await prisma.availability.findMany({
    where: { userId },
    orderBy: [{ dayOfWeek: 'asc' }, { date: 'asc' }],
  })

  return NextResponse.json({ availability })
}

export async function PUT(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  try {
    const { availability } = await request.json()

    if (!Array.isArray(availability)) {
      return NextResponse.json({ error: '無効なデータ形式です' }, { status: 400 })
    }

    // Delete existing and replace
    await prisma.availability.deleteMany({ where: { userId } })

    if (availability.length > 0) {
      await prisma.availability.createMany({
        data: availability.map((a: { dayOfWeek?: number; date?: string; type: string }) => ({
          userId,
          dayOfWeek: a.dayOfWeek ?? null,
          date: a.date ?? null,
          type: a.type,
        })),
      })
    }

    const updated = await prisma.availability.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { date: 'asc' }],
    })

    return NextResponse.json({ availability: updated })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
