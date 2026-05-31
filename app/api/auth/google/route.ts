import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getAuthUrl } from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Google OAuth の設定が不完全です。環境変数を確認してください。' },
      { status: 500 }
    )
  }

  const url = getAuthUrl()
  return NextResponse.redirect(url)
}
