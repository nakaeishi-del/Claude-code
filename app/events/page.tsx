'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import BearMascot from '@/components/BearMascot'

const GENRES = [
  { value: 'all',      label: '全て' },
  { value: 'music',    label: '音楽' },
  { value: 'food',     label: 'グルメ' },
  { value: 'sports',   label: 'スポーツ' },
  { value: 'art',      label: 'アート' },
  { value: 'theater',  label: '演劇' },
  { value: 'festival', label: 'フェス' },
]

const genreEmoji: Record<string, string> = {
  music: '🎵', food: '🍜', sports: '⚽', art: '🎨', theater: '🎭', festival: '🎉',
}

const genreStyle: Record<string, { color: string; bg: string }> = {
  music:    { color: '#A87FD0', bg: '#F5EEFA' },
  food:     { color: '#F07050', bg: '#FFF0EC' },
  sports:   { color: '#6B8FD4', bg: '#EEF3FC' },
  art:      { color: '#E06090', bg: '#FDE8F2' },
  theater:  { color: '#3BAA98', bg: '#E6F6F4' },
  festival: { color: '#C8A020', bg: '#FFFBEB' },
}

const genreLabels: Record<string, string> = {
  music: '音楽', food: 'グルメ', sports: 'スポーツ', art: 'アート', theater: '演劇', festival: 'フェス',
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
    const params = new URLSearchParams({ month: `${year}-${String(month).padStart(2, '0')}` })
    if (activeGenre !== 'all') params.set('genre', activeGenre)
    const res = await fetch(`/api/events?${params}`)
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setEvents(data.events || [])
    setLoading(false)
  }, [year, month, activeGenre, router])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  async function toggleLike(event: Event) {
    const res = await fetch(`/api/events/${event.id}/like`, { method: 'POST' })
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setEvents((prev) => prev.map((e) =>
      e.id === event.id ? { ...e, liked: data.liked, likeCount: e.likeCount + (data.liked ? 1 : -1) } : e
    ))
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
    const res = await fetch(`/api/events/${inviteEvent.id}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    })
    setInviting(false)
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || '提案の作成に失敗しました')
      return
    }
    setInviteSent(true)
    setTimeout(() => { setInviteEvent(null); router.push(`/groups/${groupId}`) }, 1000)
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
    return `${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`
  }

  function dateColor(dateStr: string) {
    const day = new Date(dateStr + 'T00:00:00').getDay()
    if (day === 0) return '#EF4444'
    if (day === 6) return '#3B82F6'
    return '#2D1B0E'
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF9' }}>
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-7 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: '#2D1B0E' }}>イベントカレンダー</h1>
          <p className="text-sm mt-1 font-bold" style={{ color: '#9B8B7E' }}>行きたいイベントに♡して友達を誘おう</p>
        </div>

        <div className="flex items-center justify-between mb-4 bg-white rounded-2xl px-4 py-3"
          style={{ border: '1.5px solid #EDE8E3' }}>
          <button onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="p-1.5 rounded-xl transition-colors" style={{ color: '#9B8B7E' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-black" style={{ color: '#2D1B0E' }}>{year}年{month}月</span>
          <button onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="p-1.5 rounded-xl transition-colors" style={{ color: '#9B8B7E' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: 'none' }}>
          {GENRES.map((g) => (
            <button key={g.value} onClick={() => setActiveGenre(g.value)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-black transition-all"
              style={activeGenre === g.value
                ? { background: '#F07050', color: 'white' }
                : { background: 'white', color: '#9B8B7E', border: '1.5px solid #EDE8E3' }}>
              {g.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <BearMascot size={70} mood="sleep" animate />
            <p className="text-sm font-bold" style={{ color: '#9B8B7E' }}>よみこみ中...</p>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <BearMascot size={80} mood="wink" />
            <p className="font-bold" style={{ color: '#2D1B0E' }}>この月のイベントはありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                <div className="text-sm font-black mb-2 px-1" style={{ color: dateColor(date) }}>
                  {formatDate(date)}
                </div>
                <div className="space-y-2">
                  {eventsByDate[date].map((event) => {
                    const gs = genreStyle[event.genre] || { color: '#9B8B7E', bg: '#F5F0EB' }
                    return (
                      <div key={event.id} className="bg-white rounded-2xl p-4"
                        style={{ border: '1.5px solid #EDE8E3' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: gs.bg }}>
                            {genreEmoji[event.genre] || '🎪'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-black text-sm leading-snug" style={{ color: '#2D1B0E' }}>{event.title}</div>
                                <div className="text-xs mt-0.5 font-bold" style={{ color: '#9B8B7E' }}>
                                  {event.venue}（{event.area}）
                                </div>
                                {event.description && (
                                  <p className="text-xs mt-1 line-clamp-1 font-bold" style={{ color: '#C8B8A8' }}>{event.description}</p>
                                )}
                              </div>
                              <button onClick={() => toggleLike(event)}
                                className="flex-shrink-0 flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all active:scale-90"
                                style={{ color: event.liked ? '#F07050' : '#C8B8A8' }}>
                                <svg className="w-5 h-5" fill={event.liked ? 'currentColor' : 'none'}
                                  stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {event.likeCount > 0 && (
                                  <span className="text-[10px] font-black leading-none">{event.likeCount}</span>
                                )}
                              </button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[11px] px-2 py-0.5 rounded-full font-black"
                                style={{ color: gs.color, background: gs.bg }}>
                                {genreLabels[event.genre] || event.genre}
                              </span>
                              {event.liked && (
                                <button onClick={() => openInvite(event)}
                                  className="text-xs font-black flex items-center gap-1"
                                  style={{ color: '#7AC8A0' }}>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  友達を誘う
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {inviteEvent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setInviteEvent(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-t-3xl p-6 pb-10"
            style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.12)' }}>
            {inviteSent ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <div className="font-black" style={{ color: '#2D1B0E' }}>グループに提案しました！</div>
                <div className="text-sm font-bold mt-1" style={{ color: '#9B8B7E' }}>グループページに移動します</div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-black" style={{ color: '#2D1B0E' }}>どのグループに誘う？</h3>
                    <p className="text-xs font-bold mt-0.5 line-clamp-1" style={{ color: '#9B8B7E' }}>📍 {inviteEvent.title}</p>
                  </div>
                  <button onClick={() => setInviteEvent(null)} className="p-1" style={{ color: '#C8B8A8' }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {groups.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm font-bold" style={{ color: '#9B8B7E' }}>グループがありません</p>
                    <button onClick={() => router.push('/dashboard')}
                      className="mt-3 text-sm font-black" style={{ color: '#F07050' }}>
                      グループを作成する →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <button key={group.id} onClick={() => inviteGroup(group.id)} disabled={inviting}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                        style={{ border: '1.5px solid #EDE8E3' }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-black text-white flex-shrink-0"
                          style={{ background: '#F07050' }}>
                          {group.name[0]}
                        </div>
                        <span className="text-sm font-black" style={{ color: '#2D1B0E' }}>{group.name}</span>
                        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color: '#C8B8A8' }}>
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
