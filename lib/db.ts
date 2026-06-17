import { PrismaClient } from '@prisma/client'

// Vercel Postgres sets POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING.
// Plain DATABASE_URL deployments may omit DIRECT_URL.
// Set fallbacks before PrismaClient is instantiated so the schema env() calls succeed.
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL =
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL ??
    ''
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    ''
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
