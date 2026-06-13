import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
    POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
    DATABASE_URL_UNPOOLED: !!process.env.DATABASE_URL_UNPOOLED,
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    NODE_ENV: process.env.NODE_ENV,
  }

  // Try a live DB connection + query so we can see the real failure.
  const db: {
    canConnect: boolean
    userTableExists: boolean
    userCount: number | null
    error: string | null
  } = { canConnect: false, userTableExists: false, userCount: null, error: null }

  try {
    await prisma.$queryRaw`SELECT 1`
    db.canConnect = true
    try {
      db.userCount = await prisma.user.count()
      db.userTableExists = true
    } catch (e) {
      db.error = `User table query failed: ${e instanceof Error ? e.message : String(e)}`
    }
  } catch (e) {
    db.error = `Connection failed: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json({ env, db })
}
