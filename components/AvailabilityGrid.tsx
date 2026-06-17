'use client'

const WEEKDAYS = [
  { label: '月', dow: 1 },
  { label: '火', dow: 2 },
  { label: '水', dow: 3 },
  { label: '木', dow: 4 },
  { label: '金', dow: 5 },
]

const WEEKEND = [
  { label: '土', dow: 6 },
  { label: '日', dow: 0 },
]

interface AvailabilityEntry {
  dayOfWeek?: number | null
  date?: string | null
  type: string
}

interface AvailabilityGridProps {
  availability: AvailabilityEntry[]
  onChange: (newAvailability: AvailabilityEntry[]) => void
}

function getDayLabelColor(dow: number, type: 'free' | 'busy' | null): string {
  if (type !== null) return '#FFFFFF'
  if (dow === 0) return '#EF4444'
  if (dow === 6) return '#3B82F6'
  return '#9B8B7E'
}

function DayCard({
  label,
  dow,
  type,
  onToggle,
}: {
  label: string
  dow: number
  type: 'free' | 'busy' | null
  onToggle: () => void
}) {
  const bg = type === 'free' ? '#7AC8A0' : type === 'busy' ? '#F07050' : '#FAFAF8'
  const border = type === 'free' ? '#7AC8A0' : type === 'busy' ? '#F07050' : '#EDE8E3'
  const labelColor = getDayLabelColor(dow, type)
  const statusColor = type !== null ? '#FFFFFF' : '#C8B8A8'

  const icon = type === 'free' ? '✓' : type === 'busy' ? '✕' : '?'
  const statusLabel = type === 'free' ? '空き' : type === 'busy' ? 'NG' : '未設定'

  return (
    <button
      onClick={onToggle}
      className="flex flex-col items-center justify-between rounded-2xl transition-all active:scale-95 select-none"
      style={{
        background: bg,
        border: `1.5px solid ${border}`,
        padding: '10px 6px 8px',
        minHeight: '80px',
        width: '100%',
      }}
      title={`${label}曜日: タップして切り替え`}
    >
      {/* Day name */}
      <span className="text-sm font-black leading-none" style={{ color: labelColor }}>
        {label}
      </span>

      {/* State icon */}
      <span
        className="text-xl font-black leading-none"
        style={{ color: type !== null ? '#FFFFFF' : '#C8B8A8' }}
      >
        {icon}
      </span>

      {/* Status label */}
      <span
        className="text-xs font-black leading-none"
        style={{ color: statusColor }}
      >
        {statusLabel}
      </span>
    </button>
  )
}

export default function AvailabilityGrid({ availability, onChange }: AvailabilityGridProps) {
  function getTypeForDay(dow: number): 'free' | 'busy' | null {
    const entry = availability.find((a) => a.dayOfWeek === dow && a.date == null)
    return entry ? (entry.type as 'free' | 'busy') : null
  }

  function toggleDay(dow: number) {
    const current = getTypeForDay(dow)
    // 3-state cycle: null → free → busy → null
    const next = current === null ? 'free' : current === 'free' ? 'busy' : null
    const filtered = availability.filter((a) => !(a.dayOfWeek === dow && a.date == null))
    if (next !== null) {
      onChange([...filtered, { dayOfWeek: dow, date: null, type: next }])
    } else {
      onChange(filtered)
    }
  }

  function setAll(type: 'free' | 'busy') {
    const allDows = [...WEEKDAYS, ...WEEKEND].map((d) => d.dow)
    const dateOnly = availability.filter((a) => a.date != null)
    const dowEntries = allDows.map((dow) => ({ dayOfWeek: dow, date: null, type }))
    onChange([...dateOnly, ...dowEntries])
  }

  function setWeekdaysOnly() {
    const dateOnly = availability.filter((a) => a.date != null)
    const weekdayEntries = WEEKDAYS.map((d) => ({ dayOfWeek: d.dow, date: null, type: 'free' }))
    const weekendEntries = WEEKEND.map((d) => ({ dayOfWeek: d.dow, date: null, type: 'busy' }))
    onChange([...dateOnly, ...weekdayEntries, ...weekendEntries])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs" style={{ color: '#B8A898' }}>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-md inline-block" style={{ background: '#7AC8A0' }} />
          いつも空き
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-md inline-block" style={{ background: '#F07050' }} />
          基本NG
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-md inline-block" style={{ background: '#EDE8E3' }} />
          未設定
        </span>
      </div>

      {/* Weekday row: 月火水木金 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {WEEKDAYS.map(({ label, dow }) => (
          <DayCard
            key={dow}
            label={label}
            dow={dow}
            type={getTypeForDay(dow)}
            onToggle={() => toggleDay(dow)}
          />
        ))}
      </div>

      {/* Weekend row: 土日 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
        {WEEKEND.map(({ label, dow }) => (
          <DayCard
            key={dow}
            label={label}
            dow={dow}
            type={getTypeForDay(dow)}
            onToggle={() => toggleDay(dow)}
          />
        ))}
      </div>

      {/* Hint text */}
      <p className="text-xs font-bold" style={{ color: '#C8B8A8', marginTop: '2px' }}>
        タップ: 🟢 空き → 🔴 NG → ⬜ 未設定
      </p>

      {/* Quick-set buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={() => setAll('free')}
          className="flex-1 rounded-2xl font-black text-sm transition-all active:scale-95"
          style={{
            background: '#7AC8A0',
            color: '#FFFFFF',
            padding: '10px 0',
            border: 'none',
          }}
        >
          全部空き
        </button>
        <button
          onClick={setWeekdaysOnly}
          className="flex-1 rounded-2xl font-black text-sm transition-all active:scale-95"
          style={{
            background: '#FAFAF8',
            color: '#9B8B7E',
            padding: '10px 0',
            border: '1.5px solid #EDE8E3',
          }}
        >
          平日のみ
        </button>
      </div>
    </div>
  )
}
