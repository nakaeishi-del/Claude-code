'use client'

import { useState, useEffect } from 'react'
import { SharedDiaryEntry } from '@/lib/types'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })
}

function timeAgo(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'たった今'
  if (mins < 60) return `${mins}分前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}時間前`
  const days = Math.floor(hours / 24)
  return `${days}日前`
}

export default function CommunityPage() {
  const [entries, setEntries] = useState<SharedDiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sharingEnabled, setSharingEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const enabled = localStorage.getItem('ikki-sharing') === 'true'
    setSharingEnabled(enabled)
    loadEntries()
  }, [])

  async function loadEntries() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/diary')
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setEntries(data.entries || [])
    } catch {
      setError('みんなの日記を読み込めませんでした。\nデータベースの設定を確認してください。')
    } finally {
      setLoading(false)
    }
  }

  function toggleSharing() {
    const username = localStorage.getItem('ikki-username') || ''
    if (!username || username === 'ゲスト') {
      alert('設定からニックネームを設定してから共有をオンにしてね！')
      return
    }
    const next = !sharingEnabled
    setSharingEnabled(next)
    localStorage.setItem('ikki-sharing', next ? 'true' : 'false')
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: 'linear-gradient(160deg, #0D0B1E 0%, #1A0540 50%, #0D1520 100%)' }}
    >
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black gradient-text">👥 みんなの日記</h1>
        <p className="text-xs text-[#9D8EBF] mt-1">世界中のイッキーの日記を見てみよう</p>
      </div>

      {/* Sharing toggle */}
      <div
        className="mx-4 mb-4 glass-card p-4 flex items-center justify-between"
        style={{ border: sharingEnabled ? '1px solid rgba(0,255,159,0.3)' : '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <div className="font-bold text-sm text-[#F0E6FF]">
            {sharingEnabled ? '🌐 シェア中' : '🔒 シェアしない'}
          </div>
          <div className="text-xs text-[#9D8EBF] mt-0.5">
            {sharingEnabled
              ? '保存した日記が自動でシェアされます'
              : 'オンにするとみんなに日記を公開できます'}
          </div>
        </div>
        <button
          onClick={toggleSharing}
          className="relative w-12 h-6 rounded-full transition-all duration-300"
          style={{
            background: sharingEnabled
              ? 'linear-gradient(90deg, #00FF9F, #00CC80)'
              : 'rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300"
            style={{ left: sharingEnabled ? 'calc(100% - 22px)' : '2px' }}
          />
        </button>
      </div>

      {/* Diary feed */}
      <div className="px-4">
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 border-[#FF4ECD] border-t-transparent animate-spin"
            />
            <p className="text-[#9D8EBF] text-sm">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-3">🔌</div>
            <p className="text-[#9D8EBF] text-sm whitespace-pre-line">{error}</p>
            <button
              onClick={loadEntries}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-[#FF4ECD]"
              style={{ background: 'rgba(255,78,205,0.15)', border: '1px solid rgba(255,78,205,0.3)' }}
            >
              再読み込み
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="text-5xl mb-4">🌟</div>
            <p className="text-[#F0E6FF] font-bold">まだ誰も書いていないよ</p>
            <p className="text-[#9D8EBF] text-sm mt-2">最初のイッキーになろう！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="glass-card p-4 relative overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ background: 'linear-gradient(to bottom, #7B2FFF, #FF4ECD)' }}
                />
                <div className="pl-3">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black"
                      style={{ background: 'linear-gradient(135deg, #FF4ECD, #7B2FFF)' }}
                    >
                      {entry.username.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F0E6FF]">{entry.username}</div>
                      <div className="text-[10px] text-[#9D8EBF]">
                        {formatDate(entry.date)} · {timeAgo(entry.createdAt)}
                      </div>
                    </div>
                    <span className="ml-auto text-xl">{entry.mood}</span>
                  </div>

                  {/* Content */}
                  <p className="text-sm leading-relaxed text-[#E0D4FF] line-clamp-4">
                    {entry.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh button */}
      {!loading && !error && (
        <div className="px-4 mt-4">
          <button
            onClick={loadEntries}
            className="w-full py-3 rounded-2xl text-sm font-bold text-[#9D8EBF] transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            ⟳ 更新する
          </button>
        </div>
      )}
    </div>
  )
}
