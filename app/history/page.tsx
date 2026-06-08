'use client'

import { useState, useEffect } from 'react'
import DiaryCard from '@/components/DiaryCard'
import { getAllEntries, deleteEntry, updateEntry, getEntriesByDate } from '@/lib/storage'
import { DiaryEntry } from '@/lib/types'

function getYearMonth(dateStr: string) {
  const [y, m] = dateStr.split('-')
  return { year: parseInt(y), month: parseInt(m) }
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay()
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [entryDates, setEntryDates] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedEntries, setSelectedEntries] = useState<DiaryEntry[]>([])
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    const all = await getAllEntries()
    setEntries(all)
    setEntryDates(new Set(all.map((e) => e.date)))
  }

  async function handleSelectDate(dateStr: string) {
    if (selected === dateStr) {
      setSelected(null)
      setSelectedEntries([])
      return
    }
    setSelected(dateStr)
    const dayEntries = await getEntriesByDate(dateStr)
    dayEntries.sort((a, b) => b.createdAt - a.createdAt)
    setSelectedEntries(dayEntries)
  }

  async function handleDelete(id: string) {
    await deleteEntry(id)
    await loadEntries()
    if (selected) {
      const updated = await getEntriesByDate(selected)
      setSelectedEntries(updated.sort((a, b) => b.createdAt - a.createdAt))
    }
  }

  async function handleShare(entry: DiaryEntry) {
    const usr = localStorage.getItem('ikki-username') || ''
    if (!usr || usr === 'ゲスト') {
      alert('設定からニックネームを設定してシェアしよう！')
      return
    }
    if (entry.isPublic) {
      if (entry.publicId) {
        await fetch('/api/diary', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: entry.publicId }),
        })
      }
      await updateEntry({ ...entry, isPublic: false, publicId: undefined })
    } else {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usr, content: entry.content.slice(0, 500), mood: entry.mood, date: entry.date }),
      })
      const data = await res.json()
      if (data.entry) {
        await updateEntry({ ...entry, isPublic: true, publicId: data.entry.id })
      }
    }
    await loadEntries()
    if (selected) {
      const updated = await getEntriesByDate(selected)
      setSelectedEntries(updated.sort((a, b) => b.createdAt - a.createdAt))
    }
  }

  const days = daysInMonth(viewYear, viewMonth)
  const firstDay = firstDayOfMonth(viewYear, viewMonth)
  const today = new Date().toISOString().split('T')[0]

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
    setSelected(null)
    setSelectedEntries([])
  }

  function nextMonth() {
    const n = new Date()
    if (viewYear === n.getFullYear() && viewMonth === n.getMonth() + 1) return
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
    setSelected(null)
    setSelectedEntries([])
  }

  // Monthly stats
  const monthStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}`
  const monthEntries = entries.filter((e) => e.date.startsWith(monthStr))
  const monthDays = new Set(monthEntries.map((e) => e.date)).size

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: 'linear-gradient(160deg, #0D0B1E 0%, #1A0540 50%, #0D1520 100%)' }}
    >
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black gradient-text">📅 振り返り</h1>
        <p className="text-xs text-[#9D8EBF] mt-1">過去の日記を見てみよう</p>
      </div>

      {/* Calendar */}
      <div className="mx-4 glass-card p-4 mb-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#9D8EBF] hover:text-white hover:bg-white/10 transition-all"
          >
            ‹
          </button>
          <div className="text-center">
            <div className="font-black text-[#F0E6FF]">{viewYear}年{viewMonth}月</div>
            <div className="text-xs text-[#9D8EBF]">{monthDays}日間記録</div>
          </div>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#9D8EBF] hover:text-white hover:bg-white/10 transition-all"
          >
            ›
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1">
          {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs py-1 font-bold ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#9D8EBF]'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1
            const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const hasEntry = entryDates.has(dateStr)
            const isToday = dateStr === today
            const isSelected = selected === dateStr
            const dayOfWeek = (firstDay + i) % 7

            return (
              <button
                key={day}
                onClick={() => handleSelectDate(dateStr)}
                className="aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all relative"
                style={{
                  background: isSelected
                    ? 'rgba(255,78,205,0.4)'
                    : isToday
                    ? 'rgba(123,47,255,0.3)'
                    : hasEntry
                    ? 'rgba(255,78,205,0.12)'
                    : 'transparent',
                  border: isSelected
                    ? '1px solid #FF4ECD'
                    : isToday
                    ? '1px solid rgba(123,47,255,0.5)'
                    : 'none',
                  color: dayOfWeek === 0 ? '#F87171' : dayOfWeek === 6 ? '#93C5FD' : '#F0E6FF',
                }}
              >
                {day}
                {hasEntry && (
                  <div
                    className="w-1 h-1 rounded-full absolute bottom-1"
                    style={{ background: '#FF4ECD' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Monthly stats */}
      <div className="mx-4 mb-4 grid grid-cols-2 gap-3">
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-black gradient-text">{monthDays}</div>
          <div className="text-xs text-[#9D8EBF] mt-1">記録した日</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-black gradient-text">{monthEntries.length}</div>
          <div className="text-xs text-[#9D8EBF] mt-1">日記の総数</div>
        </div>
      </div>

      {/* Selected day entries */}
      {selected && (
        <div className="px-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-black text-[#F0E6FF]">
              {new Date(selected + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          {selectedEntries.length === 0 ? (
            <div className="glass-card p-8 text-center text-[#9D8EBF] text-sm">
              この日の記録はありません
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEntries.map((entry) => (
                <DiaryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDelete}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="mx-4 glass-card p-10 text-center">
          <div className="text-4xl mb-3">📖</div>
          <p className="text-[#9D8EBF] text-sm">まだ日記がありません。</p>
          <p className="text-[#9D8EBF] text-xs mt-1">トップページから書いてみよう！</p>
        </div>
      )}
    </div>
  )
}
