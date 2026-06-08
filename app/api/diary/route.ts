import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const entries = await (prisma as any).sharedDiaryEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ entries })
  } catch {
    return NextResponse.json({ entries: [] })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { username, content, mood, date } = body

  if (!username || !content || !date) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: '文章が長すぎます' }, { status: 400 })
  }

  try {
    const entry = await (prisma as any).sharedDiaryEntry.create({
      data: {
        username: username.slice(0, 20),
        content: content.slice(0, 2000),
        mood: mood || '😊',
        date,
      },
    })
    return NextResponse.json({ entry })
  } catch {
    return NextResponse.json({ error: 'シェアに失敗しました' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'IDが必要です' }, { status: 400 })

  try {
    await (prisma as any).sharedDiaryEntry.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 })
  }
}
