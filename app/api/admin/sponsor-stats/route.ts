import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ensureDbReady } from '@/lib/init-db'

// Advertiser-facing report: impressions / detail views / outbound clicks /
// proposals per sponsored restaurant. This is the data used to sell and
// renew placement slots (食べログ型のPR枠レポート).
//
// Protected by ADMIN_SECRET env var: /api/admin/sponsor-stats?secret=...
export async function GET(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET
  if (!secret || request.nextUrl.searchParams.get('secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  await ensureDbReady()

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const events = await prisma.sponsorEvent.groupBy({
    by: ['restaurantName', 'action'],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  })

  interface Counts { impression: number; detail: number; outbound: number; propose: number }
  const report: Record<string, Counts> = {}
  for (const e of events) {
    report[e.restaurantName] ??= { impression: 0, detail: 0, outbound: 0, propose: 0 }
    report[e.restaurantName][e.action as keyof Counts] = e._count._all
  }

  // Funnel rates advertisers care about: 表示→詳細→送客/提案
  const rows = Object.entries(report).map(([name, counts]) => ({
    restaurantName: name,
    ...counts,
    detailRate: counts.impression ? +(counts.detail / counts.impression * 100).toFixed(1) : 0,
    conversionRate: counts.impression ? +((counts.outbound + counts.propose) / counts.impression * 100).toFixed(1) : 0,
  })).sort((a, b) => b.impression - a.impression)

  return NextResponse.json({ periodDays: 30, rows })
}
