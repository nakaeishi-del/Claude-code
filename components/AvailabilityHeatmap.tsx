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
                background: color,
                color: good ? '#166534' : '#C4B8AE',
                border: isSelected ? '2px solid #F07050' : '2px solid transparent',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                cursor: good ? 'pointer' : 'default',
              }}
            >
              {dayNum}
              {good && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ background: '#F07050' }} />
              )}
            </button>
          )
        })}
      </div>

      {goodDays.length > 0 ? (
        <div className="mt-4 p-3 rounded-2xl" style={{ background: '#F0FAF2', border: '1px solid #BBF7D0' }}>
          <p className="text-xs font-black mb-2" style={{ color: '#3B8A5A' }}>
            🎉 みんな空いてる日 ({goodDays.length}日)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {goodDays.slice(0, 6).map((d) => (
              <button
                key={d.date}
                onClick={() => { setSelected(d.date); onSelectDate?.(d.date) }}
                className="text-xs px-2.5 py-1 rounded-xl font-black transition-all"
                style={{
                  background: selected === d.date ? '#F07050' : 'white',
                  color: selected === d.date ? 'white' : '#3B8A5A',
                  border: `1.5px solid ${selected === d.date ? '#F07050' : '#86EFAC'}`,
                }}
              >
                {d.date.slice(5).replace('-', '/')}（{DOW_LABELS[d.dayOfWeek]}）
              </button>
            ))}
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
