import { PrismaClient } from '@prisma/client'

// Support both Vercel Neon integration naming conventions
// Old: POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING
// New: DATABASE_URL / DATABASE_URL_UNPOOLED
if (!process.env.POSTGRES_PRISMA_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_PRISMA_URL = process.env.DATABASE_URL
}
if (!process.env.POSTGRES_URL_NON_POOLING) {
  process.env.POSTGRES_URL_NON_POOLING =
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? ''
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
