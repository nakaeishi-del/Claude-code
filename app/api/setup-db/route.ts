import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-setup-secret')
  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    if (!process.env.POSTGRES_PRISMA_URL && process.env.DATABASE_URL) {
      process.env.POSTGRES_PRISMA_URL = process.env.DATABASE_URL
    }
    if (!process.env.POSTGRES_URL_NON_POOLING) {
      process.env.POSTGRES_URL_NON_POOLING =
        process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? ''
    }

    const output = execSync(
      'node_modules/.bin/prisma db push --skip-generate --accept-data-loss',
      { encoding: 'utf8', timeout: 60000 }
    )
    return NextResponse.json({ success: true, output })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
