import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { id: groupId } = await params

  // Check if requester is a member
  const myMembership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })

  if (!myMembership) {
    return NextResponse.json({ error: 'このグループへのアクセス権限がありません' }, { status: 403 })
  }

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'メールアドレスを入力してください' }, { status: 400 })
    }

    const invitee = await prisma.user.findUnique({ where: { email } })
    if (!invitee) {
      return NextResponse.json({ error: 'このメールアドレスのユーザーが見つかりません' }, { status: 404 })
    }

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: invitee.id } },
    })

    if (existing) {
      return NextResponse.json({ error: 'このユーザーは既にグループのメンバーです' }, { status: 400 })
    }

    // Check member limit (max 4)
    const memberCount = await prisma.groupMember.count({ where: { groupId } })
    if (memberCount >= 4) {
      return NextResponse.json({ error: 'グループのメンバーは最大4人までです' }, { status: 400 })
    }

    const member = await prisma.groupMember.create({
      data: { groupId, userId: invitee.id, role: 'member' },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
