import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { exchangeCodeForTokens } from '@/lib/google-calendar'
import { prisma } from '@/lib/db'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.redirect(`${APP_URL}/?error=auth_required`)
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/settings?error=google_denied`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)

    if (!tokens.access_token) {
      throw new Error('アクセストークンが取得できませんでした')
    }

    await prisma.googleToken.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      update: {
        accessToken: tokens.access_token,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { googleCalendarConnected: true },
    })

    return NextResponse.redirect(`${APP_URL}/settings?connected=google`)
  } catch {
    return NextResponse.redirect(`${APP_URL}/settings?error=google_failed`)
  }
}
