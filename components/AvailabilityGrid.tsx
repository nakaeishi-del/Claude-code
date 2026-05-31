'use client'

import { clsx } from 'clsx'

const DAYS = ['月', '火', '水', '木', '金', '土', '日']
const DAY_OF_WEEK = [1, 2, 3, 4, 5, 6, 0] // Mon=1..Sat=6,Sun=0
const SLOTS = ['午前', '午後', '夜']

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
  // We use a simplified model: each day has one "type" (free/busy/unknown)
  // For this grid, we use dayOfWeek entries only (ignore date-specific)

  function getTypeForDay(dow: number): 'free' | 'busy' | null {
    const entry = availability.find((a) => a.dayOfWeek === dow && a.date == null)
    return entry ? (entry.type as 'free' | 'busy') : null
  }

  function toggleDay(dow: number) {
    const current = getTypeForDay(dow)
    // Cycle: null -> free -> busy -> null
    const next = current === null ? 'free' : current === 'free' ? 'busy' : null

    const filtered = availability.filter((a) => !(a.dayOfWeek === dow && a.date == null))

    if (next !== null) {
      onChange([...filtered, { dayOfWeek: dow, date: null, type: next }])
    } else {
      onChange(filtered)
    }
  }

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

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-[#4ECDC4] inline-block"></span>
          いつも空いている
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-[#FF6B6B] inline-block"></span>
          予定あり
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-200 inline-block"></span>
          未設定
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, i) => {
          const dow = DAY_OF_WEEK[i]
          const type = getTypeForDay(dow)
          return (
            <div key={day} className="flex flex-col gap-1.5">
              <div className={clsx('text-center text-xs font-semibold', dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-600')}>
                {day}
              </div>
              <button
                onClick={() => toggleDay(dow)}
                className={clsx(
                  'w-full aspect-square rounded-xl border-2 flex items-center justify-center text-xs font-medium transition-all hover:opacity-80',
                  getColor(type)
                )}
                title={`${day}曜日: クリックして切り替え`}
              >
                {getLabel(type)}
              </button>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        クリックして空き状況を切り替えます（空き → 予定あり → 未設定）
      </p>
    </div>
  )
}
