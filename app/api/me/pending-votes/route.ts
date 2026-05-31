import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) return NextResponse.json({ count: 0 })

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true },
  })
  const groupIds = memberships.map((m) => m.groupId)

  const count = await prisma.meetingProposal.count({
    where: {
      groupId: { in: groupIds },
      status: 'pending',
      votes: { none: { userId } },
    },
  })

  return NextResponse.json({ count })
}
