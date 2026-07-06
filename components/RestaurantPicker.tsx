'use client'

import { useEffect, useRef, useState } from 'react'
import BearMascot from './BearMascot'
import type { Restaurant } from '@/lib/restaurants'

interface Props {
  suggestions: Restaurant[]
  groupId: string
  onSelect: (r: Restaurant | null) => void
  onClose: () => void
}

// Fire-and-forget engagement tracking (sponsored listings only; the API
// silently ignores organic restaurants).
function track(restaurantName: string, action: string, groupId: string) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restaurantName, action, groupId }),
  }).catch(() => {})
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="w-3 h-3" viewBox="0 0 20 20"
          fill={rating >= i - 0.25 ? '#F5A623' : '#E8E0D8'}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
      <span className="text-xs font-black ml-0.5" style={{ color: '#F5A623' }}>{rating.toFixed(1)}</span>
    </span>
  )
}

export default function RestaurantPicker({ suggestions, groupId, onSelect, onClose }: Props) {
  const [detail, setDetail] = useState<Restaurant | null>(null)
  const trackedRef = useRef(false)

  // One impression per sponsored restaurant per open
  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    suggestions.filter((r) => r.sponsorPlan).forEach((r) => track(r.name, 'impression', groupId))
  }, [suggestions, groupId])

  function openDetail(r: Restaurant) {
    setDetail(r)
    if (r.sponsorPlan) track(r.name, 'detail', groupId)
  }

  function propose(r: Restaurant) {
    if (r.sponsorPlan) track(r.name, 'propose', groupId)
    onSelect(r)
  }

  function outbound(r: Restaurant) {
    if (r.sponsorPlan) track(r.name, 'outbound', groupId)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center sm:p-4 z-50 slide-up"
      onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[88vh] flex flex-col"
        style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1.5 rounded-full" style={{ background: '#EDE8E3' }} />
        </div>

        {detail ? (
          /* ===== Detail sheet ===== */
          <div className="p-6 pt-4 pb-8 overflow-y-auto">
            <button onClick={() => setDetail(null)}
              className="flex items-center gap-1 text-sm font-black mb-4" style={{ color: '#9B8B7E' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              一覧に戻る
            </button>

            {/* Hero */}
            <div className="rounded-3xl h-36 flex items-center justify-center text-7xl mb-4 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #FFF5F0, #FFEDE4)' }}>
              {detail.emoji ?? '🍽️'}
              {detail.sponsorPlan && (
                <span className="absolute top-3 left-3 text-[10px] font-black px-2 py-0.5 rounded-md text-white"
                  style={{ background: 'rgba(45,27,14,0.55)', backdropFilter: 'blur(4px)' }}>
                  PR
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black leading-tight" style={{ color: '#2D1B0E' }}>{detail.name}</h3>
                <p className="text-xs font-bold mt-1" style={{ color: '#9B8B7E' }}>{detail.area} · {detail.genre}</p>
              </div>
              <Stars rating={detail.rating} />
            </div>

            <p className="text-sm font-bold mt-3 leading-relaxed" style={{ color: '#6B5B4E' }}>
              {detail.description}
            </p>

            <div className="flex gap-2 mt-4">
              <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3' }}>
                <p className="text-[10px] font-black" style={{ color: '#C8B8A8' }}>予算目安</p>
                <p className="text-sm font-black mt-0.5" style={{ color: '#2D1B0E' }}>{detail.budgetLabel ?? '—'}</p>
              </div>
              <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3' }}>
                <p className="text-[10px] font-black" style={{ color: '#C8B8A8' }}>エリア</p>
                <p className="text-sm font-black mt-0.5" style={{ color: '#2D1B0E' }}>{detail.area}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(detail.name + ' ' + detail.area)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 py-3 rounded-2xl text-sm font-black text-center transition-all active:scale-[0.98]"
                style={{ background: '#F5F0EB', color: '#6B5B4E' }}>
                📍 地図で見る
              </a>
              {detail.externalUrl && (
                <a href={detail.externalUrl} target="_blank" rel="noopener noreferrer sponsored"
                  onClick={() => outbound(detail)}
                  className="flex-1 py-3 rounded-2xl text-sm font-black text-center transition-all active:scale-[0.98]"
                  style={{ background: '#FFF0EC', color: '#F07050' }}>
                  お店のページ ↗
                </a>
              )}
            </div>

            <button onClick={() => propose(detail)}
              className="w-full mt-3 py-4 rounded-2xl text-white font-black text-base transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #F07050, #F09070)', boxShadow: '0 4px 20px rgba(240,112,80,0.35)' }}>
              このお店で提案する 🎉
            </button>
          </div>
        ) : (
          /* ===== List ===== */
          <div className="p-6 pt-4 pb-8 overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <BearMascot size={40} mood="excited" animate animationType="bounce" />
              <div>
                <h3 className="text-base font-black" style={{ color: '#2D1B0E' }}>お店を選んで提案する</h3>
                <p className="text-[11px] font-bold" style={{ color: '#C8B8A8' }}>グループの価格帯でおすすめを絞り込みました</p>
              </div>
            </div>

            <div className="space-y-2.5 stagger-children">
              {suggestions.map((r, i) => {
                const isPremium = r.sponsorPlan === 'premium'
                return (
                  <button key={i} onClick={() => openDetail(r)}
                    className="w-full text-left p-4 rounded-2xl transition-all active:scale-[0.98] relative"
                    style={{
                      border: isPremium ? '2px solid #F5C4B0' : '1.5px solid #EDE8E3',
                      background: isPremium ? 'linear-gradient(135deg, #FFFDF9, #FFF3ED)' : '#FAFAF8',
                      boxShadow: isPremium ? '0 2px 14px rgba(240,112,80,0.12)' : 'none',
                    }}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: isPremium ? '#FFF0EC' : '#F5F0EB' }}>
                        {r.emoji ?? '🍽️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="font-black text-sm" style={{ color: '#2D1B0E' }}>{r.name}</div>
                          {r.sponsorPlan && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                              style={{ background: '#EDE8E3', color: '#9B8B7E' }}>PR</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Stars rating={r.rating} />
                        </div>
                        <div className="text-xs mt-1 font-bold" style={{ color: '#9B8B7E' }}>
                          {r.area} · {r.genre}{r.budgetLabel ? ` · ${r.budgetLabel}` : ''}
                        </div>
                      </div>
                      <svg className="w-4 h-4 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#C8B8A8' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>

            <button onClick={() => onSelect(null)}
              className="w-full mt-3 py-3 rounded-2xl text-sm font-black transition-all active:scale-[0.98]"
              style={{ color: '#C8B8A8', border: '1.5px solid #EDE8E3', background: '#FAFAF8' }}>
              🎲 ランダムで決める
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
