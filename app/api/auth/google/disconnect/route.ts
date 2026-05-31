import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  await prisma.googleToken.deleteMany({ where: { userId } })
  await prisma.user.update({
    where: { id: userId },
    data: { googleCalendarConnected: false },
  })

  return NextResponse.json({ ok: true })
}
