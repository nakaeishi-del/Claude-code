'use client'

import { useEffect, useState } from 'react'

interface DayData {
  date: string
  dayOfWeek: number
  freeCount: number
  busyCount: number
  memberCount: number
}

interface Props {
  groupId: string
  memberCount: number
  onSelectDate?: (date: string) => void
}

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function scoreColor(freeCount: number, busyCount: number, memberCount: number): string {
  if (memberCount === 0 || busyCount > 0 || freeCount === 0) return '#F0ECE8'
  const ratio = freeCount / memberCount
  if (ratio >= 1)   return '#4ADE80'
  if (ratio >= 0.7) return '#86EFAC'
  if (ratio >= 0.5) return '#FCD34D'
  return '#F0ECE8'
}

function isGood(freeCount: number, busyCount: number, memberCount: number): boolean {
  return busyCount === 0 && freeCount >= memberCount * 0.7
}

export default function AvailabilityHeatmap({ groupId, memberCount, onSelectDate }: Props) {
  const [days, setDays] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/groups/${groupId}/availability`)
      .then((r) => r.json())
      .then((d) => { setDays(d.days || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [groupId])

  if (loading) {
    return (
      <div className="animate-pulse flex gap-1.5 flex-wrap">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="w-9 h-9 rounded-xl" style={{ background: '#EDE8E3' }} />
        ))}
      </div>
    )
  }

  const goodDays = days.filter((d) => isGood(d.freeCount, d.busyCount, memberCount))

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-xs font-bold" style={{ color: '#B8A898' }}>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#4ADE80' }} />
          全員空き
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#86EFAC' }} />
          ほぼ空き
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#F0ECE8' }} />
          情報なし
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DOW_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[10px] font-black pb-1"
            style={{ color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : '#B8A898' }}>
            {label}
          </div>
        ))}

        {days.length > 0 && Array.from({ length: days[0].dayOfWeek }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((d) => {
          const color = scoreColor(d.freeCount, d.busyCount, memberCount)
          const good = isGood(d.freeCount, d.busyCount, memberCount)
          const isSelected = selected === d.date
          const dayNum = parseInt(d.date.split('-')[2])
          const todayStr = new Date().toISOString().split('T')[0]
          const isToday = d.date === todayStr
          const dayOfWeek = new Date(d.date + 'T00:00:00').getDay()

          return (
            <button
              key={d.date}
              onClick={() => {
                if (!good) return
                setSelected(d.date)
                onSelectDate?.(d.date)
              }}
              disabled={!good}
              title={`${d.date}（空き${d.freeCount}/${memberCount}人）`}
              className="aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all relative"
              style={{
                background: isSelected ? '#F07050' : color,
                color: isSelected ? 'white' : good ? '#166534' : dayOfWeek === 0 ? '#EF4444' : dayOfWeek === 6 ? '#3B82F6' : '#C4B8AE',
                border: isToday ? '2px solid #F07050' : isSelected ? '2px solid #F07050' : '2px solid transparent',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                cursor: good ? 'pointer' : 'default',
                boxShadow: isSelected ? '0 2px 8px rgba(240,112,80,0.35)' : 'none',
              }}
            >
              {dayNum}
              {good && !isSelected && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ background: '#4ADE80' }} />
              )}
            </button>
          )
        })}
      </div>

      {goodDays.length > 0 ? (
        <div className="mt-4 p-3 rounded-2xl" style={{ background: '#F0FAF2', border: '1px solid #BBF7D0' }}>
          <p className="text-xs font-black mb-2 flex items-center gap-1.5" style={{ color: '#3B8A5A' }}>
            <span>🎉</span>
            <span>みんな空いてる日 ({goodDays.length}日)</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {goodDays.slice(0, 6).map((d) => {
              const isActive = selected === d.date
              return (
                <button
                  key={d.date}
                  onClick={() => { setSelected(d.date); onSelectDate?.(d.date) }}
                  className="text-xs px-2.5 py-1 rounded-xl font-black transition-all active:scale-95"
                  style={{
                    background: isActive ? '#F07050' : 'white',
                    color: isActive ? 'white' : '#3B8A5A',
                    border: `1.5px solid ${isActive ? '#F07050' : '#86EFAC'}`,
                    boxShadow: isActive ? '0 2px 6px rgba(240,112,80,0.3)' : 'none',
                  }}
                >
                  {d.date.slice(5).replace('-', '/')}（{DOW_LABELS[d.dayOfWeek]}）
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4 p-3 rounded-2xl text-xs font-bold text-center"
          style={{ background: '#FAFAF8', border: '1.5px dashed #EDE8E3', color: '#B8A898' }}>
          設定で空き時間を登録すると、みんなが空いてる日が見つかります
        </div>
      )}
    </div>
  )
}
