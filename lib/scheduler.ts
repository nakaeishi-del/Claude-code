import { prisma } from './db'
import { getFreeBusyForUser, isEveningBusy, BusySlot } from './google-calendar'

// Find best meeting dates for a group over the next 60 days.
// Members with Google Calendar connected use real calendar data;
// others use manual weekly availability from the DB.
export async function findBestMeetingDates(groupId: string): Promise<string[]> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: {
            include: { availability: true },
          },
        },
      },
    },
  })

  if (!group || group.members.length === 0) return []

  const members = group.members.map((m) => m.user)
  const memberCount = members.length

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 61)

  // Pre-fetch Google Calendar busy slots for connected members
  const googleBusy = new Map<string, BusySlot[]>()
  await Promise.all(
    members
      .filter((u) => u.googleCalendarConnected)
      .map(async (u) => {
        const slots = await getFreeBusyForUser(u.id, today, endDate)
        googleBusy.set(u.id, slots)
      })
  )

  const candidates: { date: string; score: number }[] = []

  for (let i = 7; i <= 60; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay() // 0=Sun … 6=Sat

    let score = 0

    // Weekend/evening preference
    if (dayOfWeek === 5) score += 1 // Friday
    if (dayOfWeek === 6) score += 2 // Saturday
    if (dayOfWeek === 0) score += 1 // Sunday

    // Sweet spot: 2–4 weeks out
    if (i >= 14 && i <= 28) score += 2

    let freeCount = 0
    let busyCount = 0

    for (const member of members) {
      if (member.googleCalendarConnected) {
        const slots = googleBusy.get(member.id) ?? []
        if (isEveningBusy(dateStr, slots)) {
          busyCount++
        } else {
          freeCount++
        }
      } else {
        // Manual availability
        const avail = member.availability
        const specificEntry = avail.find((a) => a.date === dateStr)
        if (specificEntry) {
          specificEntry.type === 'free' ? freeCount++ : busyCount++
          continue
        }
        const weeklyEntry = avail.find((a) => a.dayOfWeek === dayOfWeek)
        if (weeklyEntry) {
          weeklyEntry.type === 'free' ? freeCount++ : busyCount++
        } else {
          freeCount += 0.5 // unknown → slightly optimistic
        }
      }
    }

    if (busyCount === 0 && freeCount >= memberCount) {
      score += 4
    } else if (busyCount === 0 && freeCount >= memberCount * 0.7) {
      score += 2
    } else {
      score -= 2 * busyCount
    }

    if (score > 0) candidates.push({ date: dateStr, score })
  }

  candidates.sort((a, b) => b.score - a.score)
  return candidates.slice(0, 3).map((c) => c.date)
}
