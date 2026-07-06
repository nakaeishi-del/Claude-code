import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ensureDbReady } from '@/lib/init-db'
import { findRestaurant } from '@/lib/restaurants'

const VALID_ACTIONS = new Set(['impression', 'detail', 'outbound', 'propose'])

// Records a sponsored-restaurant engagement event. Fire-and-forget from the
// client; failures never affect UX. Only sponsored restaurants are recorded —
// organic listings generate no billing events.
export async function POST(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 })

  try {
    await ensureDbReady()
    const { restaurantName, action, groupId } = await request.json()
    if (typeof restaurantName !== 'string' || !VALID_ACTIONS.has(action)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const restaurant = findRestaurant(restaurantName)
    if (!restaurant?.sponsorPlan) return NextResponse.json({ ok: true, skipped: true })

    await prisma.sponsorEvent.create({
      data: {
        restaurantName,
        action,
        userId,
        groupId: typeof groupId === 'string' ? groupId : null,
      },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
