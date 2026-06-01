import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown',
    deployedAt: process.env.VERCEL_GIT_COMMIT_SHA
      ? new Date().toISOString()
      : null,
    env: process.env.NODE_ENV,
  })
}
