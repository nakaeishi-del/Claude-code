import { prisma } from './db'

// Find best meeting dates for a group
// 1. Get all members' availability for next 60 days
// 2. Score each day: +2 if all free, +1 if majority free, -2 if anyone busy
// 3. Prefer weekends (Fri/Sat/Sun) and next 2-4 weeks
// 4. Return top 3 candidate dates
export async function findBestMeetingDates(groupId: string): Promise<string[]> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: {
            include: {
              availability: true,
            },
          },
        },
      },
    },
  })

  if (!group || group.members.length === 0) return []

  const members = group.members.map((m) => m.user)
  const memberCount = members.length

  const candidates: { date: string; score: number }[] = []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 7; i <= 60; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay() // 0=Sun, 6=Sat

    let score = 0

    // Prefer weekends
    if (dayOfWeek === 5) score += 1 // Friday
    if (dayOfWeek === 6) score += 2 // Saturday
    if (dayOfWeek === 0) score += 1 // Sunday

    // Prefer 2-4 weeks out (sweet spot)
    if (i >= 14 && i <= 28) score += 2

    let freeCount = 0
    let busyCount = 0

    for (const member of members) {
      const availability = member.availability

      // Check specific date overrides first
      const specificEntry = availability.find((a) => a.date === dateStr)
      if (specificEntry) {
        if (specificEntry.type === 'free') freeCount++
        else busyCount++
        continue
      }

      // Check recurring weekly availability
      const weeklyEntry = availability.find((a) => a.dayOfWeek === dayOfWeek)
      if (weeklyEntry) {
        if (weeklyEntry.type === 'free') freeCount++
        else busyCount++
        continue
      }

      // Default: assume somewhat free
      freeCount += 0.5
    }

    // Score based on member availability
    if (busyCount === 0 && freeCount >= memberCount) {
      score += 4 // Everyone free
    } else if (busyCount === 0 && freeCount >= memberCount * 0.7) {
      score += 2 // Most people free
    } else if (busyCount >= 1) {
      score -= 2 * busyCount // Penalty for busy members
    }

    if (score > 0) {
      candidates.push({ date: dateStr, score })
    }
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score)

  // Return top 3 unique dates
  return candidates.slice(0, 3).map((c) => c.date)
}
