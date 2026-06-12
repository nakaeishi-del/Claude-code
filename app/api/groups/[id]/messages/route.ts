import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession(request)
  if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { id } = await params

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  })
  if (!membership) return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 })

  const messages = await prisma.groupMessage.findMany({
    where: { groupId: id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })

  return NextResponse.json({ messages })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession(request)
  if (!userId) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { id } = await params

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  })
  if (!membership) return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 })

  const body = await request.json()
  const content = (body.content || '').trim()
  if (!content || content.length > 500) {
    return NextResponse.json({ error: 'メッセージは1〜500文字です' }, { status: 400 })
  }

  const message = await prisma.groupMessage.create({
    data: { groupId: id, userId, content },
    include: { user: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ message })
}
