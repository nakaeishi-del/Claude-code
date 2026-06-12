'use client'

import { clsx } from 'clsx'

const DAYS = ['月', '火', '水', '木', '金', '土', '日']
const DAY_OF_WEEK = [1, 2, 3, 4, 5, 6, 0]

interface AvailabilityEntry {
  dayOfWeek?: number | null
  date?: string | null
  type: string
}

interface AvailabilityGridProps {
  availability: AvailabilityEntry[]
  onChange: (newAvailability: AvailabilityEntry[]) => void
}

export default function AvailabilityGrid({ availability, onChange }: AvailabilityGridProps) {
  function getTypeForDay(dow: number): 'free' | 'busy' | null {
    const entry = availability.find((a) => a.dayOfWeek === dow && a.date == null)
    return entry ? (entry.type as 'free' | 'busy') : null
  }

  function toggleDay(dow: number) {
    const current = getTypeForDay(dow)
    const next = current === null ? 'free' : current === 'free' ? 'busy' : null
    const filtered = availability.filter((a) => !(a.dayOfWeek === dow && a.date == null))
    if (next !== null) {
      onChange([...filtered, { dayOfWeek: dow, date: null, type: next }])
    } else {
      onChange(filtered)
    }
  }

<<<<<<< Updated upstream
  function getColor(type: 'free' | 'busy' | null): string {
    if (type === 'free') return 'bg-[#4ECDC4] text-white border-[#4ECDC4]'
    if (type === 'busy') return 'bg-[#FF6B6B] text-white border-[#FF6B6B]'
    return 'bg-gray-50 text-gray-400 border-gray-200'
  }

  function getLabel(type: 'free' | 'busy' | null): string {
    if (type === 'free') return '空き'
    if (type === 'busy') return '予定'
    return '―'
  }

=======
>>>>>>> Stashed changes
  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-xs" style={{ color: '#B8A898' }}>
        <span className="flex items-center gap-1">
<<<<<<< Updated upstream
          <span className="w-3 h-3 rounded bg-[#4ECDC4] inline-block"></span>
          いつも空いている
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-[#FF6B6B] inline-block"></span>
=======
          <span className="w-3 h-3 rounded-md inline-block" style={{ background: '#7AC8A0' }} />
          いつも空き
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-md inline-block" style={{ background: '#F07050' }} />
>>>>>>> Stashed changes
          予定あり
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-md inline-block" style={{ background: '#EDE8E3' }} />
          未設定
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((day, i) => {
          const dow = DAY_OF_WEEK[i]
          const type = getTypeForDay(dow)
          const isWeekend = dow === 0 || dow === 6

          const bg = type === 'free' ? '#7AC8A0' : type === 'busy' ? '#F07050' : '#FAFAF8'
          const color = type !== null ? '#FFFFFF' : isWeekend ? (dow === 0 ? '#EF4444' : '#3B82F6') : '#9B8B7E'
          const border = type === 'free' ? '#7AC8A0' : type === 'busy' ? '#F07050' : '#EDE8E3'

          return (
            <div key={day} className="flex flex-col gap-1.5">
              <div className="text-center text-xs font-black pb-0.5" style={{ color }}>
                {day}
              </div>
              <button
                onClick={() => toggleDay(dow)}
                className="w-full min-h-[52px] rounded-2xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: bg, border: `1.5px solid ${border}` }}
                title={`${day}曜日: タップして切り替え`}
              >
                <span className="text-xs font-black">
                  {type === 'free' ? '空き' : type === 'busy' ? '予定' : '―'}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-xs font-bold" style={{ color: '#C8B8A8' }}>
        タップして切り替え（空き → 予定あり → 未設定）
      </p>
    </div>
  )
}
