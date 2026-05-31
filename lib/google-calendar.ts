import { google } from 'googleapis'
import { prisma } from './db'

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
  )
}

export function getAuthUrl(): string {
  const client = getOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })
}

export async function exchangeCodeForTokens(code: string) {
  const client = getOAuthClient()
  const { tokens } = await client.getToken(code)
  return tokens
}

export interface BusySlot {
  start: string
  end: string
}

// Returns busy time slots for a user over a date range.
// Falls back to [] if the token is missing or the API call fails.
export async function getFreeBusyForUser(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<BusySlot[]> {
  const tokenRecord = await prisma.googleToken.findUnique({ where: { userId } })
  if (!tokenRecord) return []

  const client = getOAuthClient()
  client.setCredentials({
    access_token: tokenRecord.accessToken,
    refresh_token: tokenRecord.refreshToken ?? undefined,
    expiry_date: tokenRecord.expiresAt?.getTime(),
  })

  // Persist refreshed tokens automatically
  client.on('tokens', async (tokens) => {
    await prisma.googleToken.update({
      where: { userId },
      data: {
        accessToken: tokens.access_token ?? tokenRecord.accessToken,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    })
  })

  try {
    const calendar = google.calendar({ version: 'v3', auth: client })
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: 'primary' }],
      },
    })

    return (res.data.calendars?.primary?.busy ?? []).filter(
      (s): s is { start: string; end: string } =>
        typeof s.start === 'string' && typeof s.end === 'string'
    )
  } catch {
    // Token may be revoked or expired — mark as disconnected
    await prisma.user.update({
      where: { id: userId },
      data: { googleCalendarConnected: false },
    })
    await prisma.googleToken.delete({ where: { userId } }).catch(() => {})
    return []
  }
}

// Returns true if any Google Calendar event overlaps the evening window (JST 17:00–23:00).
export function isEveningBusy(dateStr: string, busySlots: BusySlot[]): boolean {
  const windowStart = new Date(`${dateStr}T17:00:00+09:00`).getTime()
  const windowEnd = new Date(`${dateStr}T23:00:00+09:00`).getTime()

  return busySlots.some(
    (slot) =>
      new Date(slot.start).getTime() < windowEnd &&
      new Date(slot.end).getTime() > windowStart
  )
}
