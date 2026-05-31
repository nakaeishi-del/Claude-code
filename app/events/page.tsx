'use client'

import { useState } from 'react'
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

const MOCK_EVENTS = [
  {
    id: '1',
    date: '2026-06-01',
    title: '渋谷ジャズナイト',
    genre: 'music',
    venue: 'Blue Note Tokyo',
    area: '渋谷',
    description: '一流ジャズミュージシャンによるライブパフォーマンス',
    liked: false,
  },
  {
    id: '2',
    date: '2026-06-02',
    title: '代官山フードフェスティバル',
    genre: 'food',
    venue: '代官山アドレス',
    area: '代官山',
    description: '全国各地の名物料理が集結するグルメイベント',
    liked: true,
  },
  {
    id: '3',
    date: '2026-06-03',
    title: '新宿アートギャラリー展',
    genre: 'art',
    venue: '新宿文化センター',
    area: '新宿',
    description: '現代アーティストたちの作品展示会',
    liked: false,
  },
  {
    id: '4',
    date: '2026-06-04',
    title: '恵比寿マラソン大会',
    genre: 'sports',
    venue: '恵比寿ガーデンプレイス',
    area: '恵比寿',
    description: '5km・10kmコースを選べる市民マラソン',
    liked: false,
  },
  {
    id: '5',
    date: '2026-06-05',
    title: '中目黒演劇フェスティバル',
    genre: 'theater',
    venue: '中目黒GTプラザ',
    area: '中目黒',
    description: '若手劇団による演劇フェスティバル',
    liked: false,
  },
  {
    id: '6',
    date: '2026-06-07',
    title: '渋谷ストリートミュージックフェス',
    genre: 'festival',
    venue: '渋谷公園通り',
    area: '渋谷',
    description: '渋谷の街を音楽で盛り上げるフェスティバル',
    liked: true,
  },
  {
    id: '7',
    date: '2026-06-07',
    title: '原宿ポップカルチャーマーケット',
    genre: 'art',
    venue: '明治神宮前',
    area: '原宿',
    description: '日本のポップカルチャーを体験できるマーケット',
    liked: false,
  },
  {
    id: '8',
    date: '2026-06-09',
    title: '六本木クラシックコンサート',
    genre: 'music',
    venue: '東京ミッドタウン',
    area: '六本木',
    description: 'オーケストラによるクラシックコンサート',
    liked: false,
  },
  {
    id: '9',
    date: '2026-06-10',
    title: '下北沢カレーフェス',
    genre: 'food',
    venue: '下北沢駅前広場',
    area: '下北沢',
    description: '30店舗以上が参加するカレーの祭典',
    liked: false,
  },
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

export default function EventsPage() {
  const [activeGenre, setActiveGenre] = useState('all')
  const [likedEvents, setLikedEvents] = useState<Set<string>>(
    new Set(MOCK_EVENTS.filter((e) => e.liked).map((e) => e.id))
  )

  function toggleLike(id: string) {
    setLikedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered =
    activeGenre === 'all'
      ? MOCK_EVENTS
      : MOCK_EVENTS.filter((e) => e.genre === activeGenre)

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-[#4ECDC4] to-[#45B7AA] rounded-2xl p-6 mb-8 text-center shadow-lg">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-3">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Coming Soon
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">イベント発見カレンダー</h1>
          <p className="text-white/80 text-sm mb-3">
            友達と行きたいイベントをハートして、一緒に参加しよう
          </p>
          <div className="bg-white/10 text-white/90 text-sm px-4 py-2 rounded-xl inline-block font-medium">
            2026年秋 リリース予定
          </div>
        </div>

        {/* Preview content (greyed out) */}
        <div className="opacity-60 pointer-events-none select-none">
          <div className="relative">
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-16">
              <div className="bg-gray-800/80 text-white px-6 py-3 rounded-xl text-sm font-bold backdrop-blur-sm">
                プレビュー（開発中）
              </div>
            </div>

            {/* Month navigation */}
            <div className="flex items-center justify-between mb-5">
              <button className="p-2 rounded-xl bg-white border border-gray-200">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-base font-bold text-gray-700">2026年6月</h2>
              <button className="p-2 rounded-xl bg-white border border-gray-200">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Genre tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
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
            <div className="space-y-3">
              {filtered.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {genreEmoji[event.genre]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 text-sm">{event.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {event.date} · {event.venue} ({event.area})
                          </div>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{event.description}</p>
                        </div>
                        <button
                          onClick={() => toggleLike(event.id)}
                          className={clsx(
                            'flex-shrink-0 p-1.5 rounded-lg transition-colors',
                            likedEvents.has(event.id) ? 'text-[#FF6B6B]' : 'text-gray-300'
                          )}
                        >
                          <svg
                            className="w-5 h-5"
                            fill={likedEvents.has(event.id) ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', genreColors[event.genre])}>
                          {genreLabels[event.genre]}
                        </span>
                        {likedEvents.has(event.id) && (
                          <button className="text-xs text-[#4ECDC4] font-medium flex items-center gap-1">
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
        </div>
      </main>
    </div>
  )
}
