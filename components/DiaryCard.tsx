'use client'

import { DiaryEntry } from '@/lib/types'
import { useState } from 'react'

interface Props {
  entry: DiaryEntry
  onDelete?: (id: string) => void
  onShare?: (entry: DiaryEntry) => void
  compact?: boolean
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default function DiaryCard({ entry, onDelete, onShare, compact }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const preview = entry.content.slice(0, compact ? 60 : 120)
  const needsExpand = entry.content.length > (compact ? 60 : 120)

  return (
    <div
      className="glass-card p-4 relative overflow-hidden transition-all duration-200"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ background: 'linear-gradient(to bottom, #FF4ECD, #7B2FFF)' }}
      />

      <div className="pl-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{entry.mood}</span>
            <span className="text-xs text-[#9D8EBF] font-medium">{formatDate(entry.date)}</span>
            {entry.isPublic && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(0,255,159,0.15)', color: '#00FF9F' }}>
                公開中
              </span>
            )}
          </div>

          {(onDelete || onShare) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-[#9D8EBF] hover:text-white w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ background: showMenu ? 'rgba(255,255,255,0.08)' : 'transparent' }}
              >
                ···
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-8 w-36 rounded-xl shadow-xl z-10 py-1"
                  style={{ background: '#1A1438', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {onShare && (
                    <button
                      onClick={() => { onShare(entry); setShowMenu(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#F0E6FF] hover:bg-white/5 transition-colors"
                    >
                      {entry.isPublic ? '🔒 非公開にする' : '🌐 シェアする'}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { onDelete(entry.id); setShowMenu(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      🗑️ 削除する
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed text-[#E0D4FF] whitespace-pre-wrap">
          {expanded ? entry.content : preview}
          {!expanded && needsExpand && '...'}
        </p>
        {needsExpand && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#FF4ECD] mt-1 hover:opacity-80 transition-opacity"
          >
            {expanded ? '折りたたむ ▲' : 'もっと見る ▼'}
          </button>
        )}

        {/* Photos */}
        {entry.photos.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {entry.photos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt=""
                className="w-20 h-20 object-cover rounded-xl"
                style={{ border: '2px solid rgba(255,78,205,0.3)' }}
              />
            ))}
          </div>
        )}

        {/* Time */}
        <div className="mt-2 text-right text-[10px] text-[#9D8EBF]">
          {new Date(entry.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
