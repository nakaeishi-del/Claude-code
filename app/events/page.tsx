'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { clsx } from 'clsx'

const GENRES = [
  { value: 'all', label: '全て' },
  { value: 'music', label: '音楽' },
  { value: 'food', label: 'グルメ' },
  { value: 'sports', label: 'スポーツ' },
  { value: 'art', label: 'アート' },
  { value: 'theater', label: '演劇' },
  { value: 'festival', label: 'フェス' },
]

const genreEmoji: Record<string, string> = {
  music: '🎵',
  food: '🍜',
  sports: '⚽',
  art: '🎨',
  theater: '🎭',
  festival: '🎉',
}

const genreColors: Record<string, string> = {
  music: 'bg-purple-100 text-purple-700',
  food: 'bg-orange-100 text-orange-700',
  sports: 'bg-blue-100 text-blue-700',
  art: 'bg-pink-100 text-pink-700',
  theater: 'bg-teal-100 text-teal-700',
  festival: 'bg-yellow-100 text-yellow-700',
}

const genreLabels: Record<string, string> = {
  music: '音楽',
  food: 'グルメ',
  sports: 'スポーツ',
  art: 'アート',
  theater: '演劇',
  festival: 'フェス',
}

type Event = {
  id: string
  date: string
  title: string
  genre: string
  venue: string
  area: string
  description?: string
  liked: boolean
  likeCount: number
}

type Group = {
  id: string
  name: string
}

export default function EventsPage() {
  const router = useRouter()
  const [activeGenre, setActiveGenre] = useState('all')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [inviteEvent, setInviteEvent] = useState<Event | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [inviting, setInviting] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      month: `${year}-${String(month).padStart(2, '0')}`,
    })
    if (activeGenre !== 'all') params.set('genre', activeGenre)

    const res = await fetch(`/api/events?${params}`)
    if (res.status === 401) {
      router.push('/login')
      return
    }
    const data = await res.json()
    setEvents(data.events || [])
    setLoading(false)
  }, [year, month, activeGenre, router])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  async function toggleLike(event: Event) {
    const res = await fetch(`/api/events/${event.id}/like`, { method: 'POST' })
    if (res.status === 401) {
      router.push('/login')
      return
    }
    const data = await res.json()
    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id
          ? { ...e, liked: data.liked, likeCount: e.likeCount + (data.liked ? 1 : -1) }
          : e
      )
    )
  }

  async function openInvite(event: Event) {
    setInviteEvent(event)
    setInviteSent(false)
    const res = await fetch('/api/groups')
    const data = await res.json()
    setGroups(data.groups || [])
  }

  async function inviteGroup(groupId: string) {
    if (!inviteEvent) return
    setInviting(true)
    await fetch(`/api/events/${inviteEvent.id}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    })
    setInviting(false)
    setInviteSent(true)
    setTimeout(() => {
      setInviteEvent(null)
      router.push(`/groups/${groupId}`)
    }, 1000)
  }

  function prevMonth() {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  const eventsByDate = events.reduce<Record<string, Event[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = []
    acc[event.date].push(event)
    return acc
  }, {})

  const sortedDates = Object.keys(eventsByDate).sort()

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00')
    const days = ['日', '月', '火', '水', '木', '金', '土']
    const day = days[date.getDay()]
    return `${date.getMonth() + 1}月${date.getDate()}日（${day}）`
  }

  function dayColor(dateStr: string) {
    const day = new Date(dateStr + 'T00:00:00').getDay()
    if (day === 0) return 'text-red-500'
    if (day === 6) return 'text-blue-500'
    return 'text-gray-700'
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800">イベントカレンダー</h1>
          <p className="text-sm text-gray-500 mt-0.5">行きたいイベントに♡して友達を誘おう</p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-50 active:bg-gray-100">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-bold text-gray-800">{year}年{month}月</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-50 active:bg-gray-100">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Genre tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: 'none' }}>
          {GENRES.map((g) => (
            <button
              key={g.value}
              onClick={() => setActiveGenre(g.value)}
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeGenre === g.value
                  ? 'bg-[#4ECDC4] text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              )}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Event list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#4ECDC4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📅</div>
            <div className="text-sm">この月のイベントはありません</div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                <div className={clsx('text-sm font-bold mb-2 px-1', dayColor(date))}>
                  {formatDate(date)}
                </div>
                <div className="space-y-2">
                  {eventsByDate[date].map((event) => (
                    <div key={event.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                          {genreEmoji[event.genre] || '🎪'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-800 text-sm leading-snug">{event.title}</div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {event.venue}（{event.area}）
                              </div>
                              {event.description && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{event.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => toggleLike(event)}
                              className={clsx(
                                'flex-shrink-0 flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all active:scale-90',
                                event.liked ? 'text-[#FF6B6B]' : 'text-gray-300 hover:text-gray-400'
                              )}
                            >
                              <svg
                                className="w-5 h-5"
                                fill={event.liked ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {event.likeCount > 0 && (
                                <span className="text-[10px] leading-none">{event.likeCount}</span>
                              )}
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', genreColors[event.genre] || 'bg-gray-100 text-gray-600')}>
                              {genreLabels[event.genre] || event.genre}
                            </span>
                            {event.liked && (
                              <button
                                onClick={() => openInvite(event)}
                                className="text-xs text-[#4ECDC4] font-medium flex items-center gap-1 hover:text-[#3bb8b0]"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                友達を誘う
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Invite bottom sheet */}
      {inviteEvent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setInviteEvent(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-t-2xl p-6 pb-10 shadow-xl">
            {inviteSent ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <div className="font-bold text-gray-800">グループに提案しました！</div>
                <div className="text-sm text-gray-500 mt-1">グループページに移動します</div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-800">どのグループに誘う？</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">📍 {inviteEvent.title}</p>
                  </div>
                  <button onClick={() => setInviteEvent(null)} className="text-gray-400 hover:text-gray-600 p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {groups.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">グループがありません</p>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="mt-3 text-sm text-[#4ECDC4] font-medium"
                    >
                      グループを作成する →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => inviteGroup(group.id)}
                        disabled={inviting}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 active:bg-gray-100 text-left transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/15 flex items-center justify-center text-base font-bold text-[#4ECDC4] flex-shrink-0">
                          {group.name[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{group.name}</span>
                        <svg className="w-4 h-4 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
