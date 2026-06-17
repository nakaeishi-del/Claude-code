'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import GroupCard from '@/components/GroupCard'
import BearMascot from '@/components/BearMascot'

interface User { id: string; name: string; email: string; priceRange: string; avatarUrl?: string | null }
interface Group {
  id: string; name: string; description?: string | null; priceRange: string
  members: { user: { id: string; name: string; email: string; avatarUrl?: string | null } }[]
  latestProposal?: { id: string; status: string; proposedDate: string; restaurantName: string; votes: { userId?: string }[] } | null
  pendingVoteCount?: number
  lastMessage?: { content: string; user: { name: string }; createdAt: string } | null
}
interface Activity {
  id: string; type: string; groupId: string; groupName: string; text: string; createdAt: string
}
const priceRangeOptions = [
  { value: 'budget', label: 'リーズナブル', sub: '〜¥3,000' },
  { value: 'mid', label: 'スタンダード', sub: '¥3,000〜¥8,000' },
  { value: 'high', label: 'プレミアム', sub: '¥8,000〜' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', priceRange: 'mid' })

  const fetchData = useCallback(async () => {
    const [meRes, groupsRes, activityRes] = await Promise.all([
      fetch('/api/auth/me'), fetch('/api/groups'), fetch('/api/me/activity')
    ])
    if (!meRes.ok) { router.push('/'); return }
    setUser((await meRes.json()).user)
    setGroups((await groupsRes.json()).groups || [])
    if (activityRes.ok) setActivities((await activityRes.json()).activities || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault(); setCreating(true); setFormError('')
    const res = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (!res.ok) { setFormError(data.error || 'エラー'); setCreating(false); return }
    setShowModal(false); setForm({ name: '', description: '', priceRange: 'mid' }); await fetchData(); setCreating(false)
  }

  const confirmedProposals = groups
    .flatMap((g) => g.latestProposal?.status === 'confirmed' ? [{ ...g.latestProposal, groupName: g.name, groupId: g.id }] : [])
    .sort((a, b) => a.proposedDate.localeCompare(b.proposedDate))

  const totalPendingVotes = groups.reduce((sum, g) => sum + (g.pendingVoteCount ?? 0), 0)
  const groupsNeedingInvite = groups.filter((g) => g.members.length === 1)

  const heroBearMood = totalPendingVotes > 0 ? 'thinking' : confirmedProposals.length > 0 ? 'celebrate' : groups.length === 0 ? 'wink' : 'happy'

  function formatProposalDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    const days = ['日', '月', '火', '水', '木', '金', '土']
    return `${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`
  }

  function daysUntil(dateStr: string): number {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr + 'T00:00:00')
    return Math.round((target.getTime() - today.getTime()) / 86400000)
  }

  function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 5) return 'こんばんは'
    if (hour < 10) return 'おはよう'
    if (hour < 17) return 'こんにちは'
    return 'こんばんは'
  }

  function relativeTime(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60) return 'たった今'
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`
    if (diff < 86400 * 2) return '昨日'
    return `${Math.floor(diff / 86400)}日前`
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#FFFDF9' }}>
        <div className="max-w-5xl mx-auto px-4 pt-0 pb-24">
          {/* Hero skeleton */}
          <div className="rounded-3xl h-28 mb-6 shimmer" />
          {/* Group cards skeleton */}
          <div className="h-4 w-24 rounded-full shimmer mb-4 mt-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5" style={{ border: '1.5px solid #EDE8E3' }}>
                <div className="h-5 w-3/4 rounded-full shimmer mb-3" />
                <div className="flex gap-2 mb-4">
                  {[1, 2].map((j) => <div key={j} className="w-8 h-8 rounded-full shimmer" />)}
                </div>
                <div className="h-3 w-full rounded-full shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF9' }}>
      <Navbar userName={user?.name} avatarUrl={user?.avatarUrl} />

      <main className="max-w-5xl mx-auto px-4 pt-0 pb-24 sm:pb-10 page-enter">
        {/* Hero welcome card */}
        <div className="rounded-3xl px-6 py-6 mb-6 relative overflow-hidden hero-gradient">
          <style>{`
            @keyframes gradientShift {
              0%   { background-position: 0% 50%; }
              50%  { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .hero-gradient {
              background: linear-gradient(135deg, #F07050, #F09070, #F0B090, #F07864);
              background-size: 300% 300%;
              animation: gradientShift 8s ease infinite;
            }
          `}</style>
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex-shrink-0">
              <BearMascot size={72} mood={heroBearMood} animate animationType={heroBearMood === 'celebrate' ? 'float' : 'breathe'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-0.5">tomomeet</p>
              <h1 className="text-xl font-black text-white leading-tight">
                {getGreeting()}、{user?.name} 👋
              </h1>
              {totalPendingVotes > 0 ? (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-white/25 px-3 py-1.5 rounded-2xl">
                  <span className="text-xs">🗳️</span>
                  <span className="text-xs font-black text-white">{totalPendingVotes}件の投票待ち</span>
                </div>
              ) : confirmedProposals.length > 0 ? (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-white/25 px-3 py-1.5 rounded-2xl">
                  <span className="text-xs">🎉</span>
                  <span className="text-xs font-black text-white">確定した予定があります</span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-white/80 font-bold">友達との次の約束、一緒に作ろう</p>
              )}
            </div>
          </div>
          {/* decorative circles */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15" style={{ background: 'white' }} />
          <div className="absolute -right-4 -bottom-10 w-20 h-20 rounded-full opacity-10" style={{ background: 'white' }} />
        </div>

        {/* Quick stats strip */}
        {groups.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'グループ', value: groups.length, icon: '👥', color: '#F07050', bg: '#FFF0EC' },
              { label: '投票待ち', value: totalPendingVotes, icon: '🗳️', color: '#C8A020', bg: '#FFFBEB' },
              { label: '確定予定', value: confirmedProposals.length, icon: '✅', color: '#5BAF7A', bg: '#F0FAF2' },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="rounded-2xl py-3 px-2 text-center" style={{ background: bg }}>
                <div className="text-base mb-0.5">{icon}</div>
                <div className="text-xl font-black" style={{ color }}><CountUp target={value} /></div>
                <div className="text-[10px] font-bold" style={{ color }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Confirmed upcoming */}
        {confirmedProposals.length > 0 && (
          <section className="mb-6">
            <SLabel>今後の確定予定 🎉</SLabel>
            <div className="mt-3 grid gap-3">
              {confirmedProposals.map((p) => {
                const days = daysUntil(p.proposedDate)
                const isToday = days === 0
                const isTomorrow = days === 1
                const countdownLabel = isToday ? '🎉 今日！' : isTomorrow ? '明日！' : `あと${days}日`
                const countdownColor = isToday ? '#F07050' : isTomorrow ? '#C8A020' : '#3B8A5A'
                return (
                  <div key={p.id} className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => router.push(`/groups/${p.groupId}`)}
                    style={{ background: isToday ? 'linear-gradient(135deg, #FFF0EC, #FFE8E0)' : 'linear-gradient(135deg, #F0FAF2, #E8F7EC)', border: `1.5px solid ${isToday ? '#F5C4B0' : '#BBF7D0'}`, transition: 'opacity 0.2s' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'white' }}>
                      {isToday ? '🎊' : '🍽️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm" style={{ color: '#2D1B0E' }}>{p.restaurantName}</p>
                      <p className="text-xs mt-0.5 font-bold" style={{ color: '#9B8B7E' }}>{p.groupName} · {formatProposalDate(p.proposedDate)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-black" style={{ color: countdownColor }}>{countdownLabel}</p>
                      <p className="text-[11px] font-bold" style={{ color: '#7AC8A0' }}>確定済み</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Groups */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <SLabel>グループ</SLabel>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-white px-4 py-2.5 rounded-2xl text-sm font-bold transition-transform active:scale-95"
              style={{ background: '#F07050', boxShadow: '0 3px 12px rgba(240,112,80,0.25)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              グループを作る
            </button>
          </div>

          {/* Activity feed — shown only when groups exist */}
          {groups.length > 0 && activities.length > 0 && (
            <div className="mb-6 bg-white rounded-2xl p-5" style={{ border: '1.5px solid #EDE8E3' }}>
              <SLabel>最近のアクティビティ</SLabel>
              <div className="mt-3 space-y-3">
                {activities.slice(0, 5).map((a) => (
                  <div key={a.id}
                    className="flex items-start gap-3 cursor-pointer rounded-xl p-1.5 -mx-1.5 transition-colors"
                    onClick={() => router.push(`/groups/${a.groupId}`)}
                    style={{ '--tw-bg-opacity': 1 } as React.CSSProperties}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FAFAF8' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                      style={{ background: a.type === 'proposal' ? '#FFF0EC' : a.type === 'vote' ? '#F0FAF2' : a.type === 'message' ? '#EEF3FC' : '#F5EEFA' }}>
                      {a.type === 'proposal' ? '✨' : a.type === 'vote' ? '🗳️' : a.type === 'message' ? '💬' : '👋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-relaxed" style={{ color: '#2D1B0E' }}>{a.text}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[10px] font-bold" style={{ color: '#C8B8A8' }}>{a.groupName}</p>
                        <span style={{ color: '#EDE8E3' }}>·</span>
                        <p className="text-[10px] font-bold" style={{ color: '#C8B8A8' }}>{relativeTime(a.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {groups.length === 0 ? (
            <div className="flex flex-col items-center py-12 px-6 rounded-3xl text-center" style={{ background: '#FFFFFF', border: '1.5px dashed #EDE8E3' }}>
              <BearMascot size={90} mood="wave" animate animationType="float" />
              <p className="mt-4 text-lg font-black" style={{ color: '#2D1B0E' }}>グループを作って始めよう！</p>
              <p className="mt-1.5 text-sm mb-6 font-bold" style={{ color: '#9B8B7E' }}>友達を招待して空き時間を自動でマッチング</p>
              <div className="flex flex-col gap-2 w-full max-w-xs mb-6">
                {[
                  { num: 1, text: 'グループを作る' },
                  { num: 2, text: '友達を招待する' },
                  { num: 3, text: 'AIが最適な日程を提案' },
                ].map(({ num, text }) => (
                  <div key={num} className="flex items-center gap-3 text-sm font-bold" style={{ color: '#9B8B7E' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                      style={{ background: '#F07050' }}>{num}</span>
                    {text}
                  </div>
                ))}
              </div>
              <button onClick={() => setShowModal(true)}
                className="text-white px-8 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95"
                style={{ background: '#F07050', boxShadow: '0 4px 16px rgba(240,112,80,0.30)' }}>
                最初のグループを作る 🎉
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {groups.map((group) => <GroupCard key={group.id} group={group} />)}
            </div>
          )}
        </section>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center sm:p-4 z-50"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md" style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.12)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: '#EDE8E3' }} />
            </div>
            <div className="p-6 pt-4">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <BearMascot size={40} mood="excited" animate animationType="bounce" />
                  <h3 className="text-lg font-black" style={{ color: '#2D1B0E' }}>グループを作成</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1" style={{ color: '#C8B8A8' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {formError && <div className="mb-4 px-4 py-3 rounded-2xl text-sm" style={{ background: '#FFF0EC', color: '#C85030' }}>{formError}</div>}
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <ModalField label="グループ名" type="text" placeholder="渋谷グルメ部" required
                  value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#9B8B7E' }}>説明（任意）</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none transition-all"
                    style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3', color: '#2D1B0E' }}
                    onFocus={(e) => { e.target.style.borderColor = '#F07050'; e.target.style.background = '#FFF' }}
                    onBlur={(e) => { e.target.style.borderColor = '#EDE8E3'; e.target.style.background = '#FAFAF8' }}
                    rows={2} placeholder="グループの説明..." />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: '#9B8B7E' }}>価格帯</label>
                  <div className="grid grid-cols-3 gap-2">
                    {priceRangeOptions.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => setForm({ ...form, priceRange: opt.value })}
                        className="p-3 rounded-2xl text-center transition-all"
                        style={form.priceRange === opt.value
                          ? { border: '2px solid #F07050', background: '#FFF5F2' }
                          : { border: '1.5px solid #EDE8E3', background: '#FAFAF8' }}>
                        <p className="text-xs font-bold" style={{ color: form.priceRange === opt.value ? '#F07050' : '#6B5B4E' }}>{opt.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#B8A898' }}>{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={creating}
                  className="w-full py-4 rounded-2xl text-white font-bold text-sm mt-1 disabled:opacity-50"
                  style={{ background: '#F07050', boxShadow: '0 4px 14px rgba(240,112,80,0.28)' }}>
                  {creating ? '作成中...' : 'グループを作成'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-black" style={{ color: '#9B8B7E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</h2>
}

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = Date.now()
    const duration = 600
    function tick() {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target])
  return <>{count}</>
}

function ModalField({ label, type, placeholder, value, onChange, required }: {
  label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: '#9B8B7E' }}>{label}</label>
      <input type={type} required={required} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
        style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3', color: '#2D1B0E' }}
        onFocus={(e) => { e.target.style.borderColor = '#F07050'; e.target.style.background = '#FFF' }}
        onBlur={(e) => { e.target.style.borderColor = '#EDE8E3'; e.target.style.background = '#FAFAF8' }}
      />
    </div>
  )
}
