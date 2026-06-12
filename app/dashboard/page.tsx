'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import GroupCard from '@/components/GroupCard'
import BearMascot from '@/components/BearMascot'

interface User { id: string; name: string; email: string; priceRange: string; avatarUrl?: string | null }
interface Group {
  id: string; name: string; description?: string | null; priceRange: string
  members: { user: { id: string; name: string; email: string } }[]
  latestProposal?: { id: string; status: string; proposedDate: string; restaurantName: string; votes: { vote: string }[] } | null
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDF9' }}>
        <div className="flex flex-col items-center gap-3">
          <BearMascot size={80} mood="sleep" animate />
          <p className="text-sm font-bold" style={{ color: '#9B8B7E' }}>よみこみ中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF9' }}>
      <Navbar userName={user?.name} avatarUrl={user?.avatarUrl} />

      <main className="max-w-5xl mx-auto px-4 pt-7 pb-24 sm:pb-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-black" style={{ color: '#2D1B0E' }}>
            おかえり、{user?.name}さん 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#9B8B7E' }}>今日も友達との時間を作ろう</p>
        </div>

        {/* Confirmed upcoming */}
        {confirmedProposals.length > 0 && (
          <section className="mb-8">
            <SLabel>今後の予定</SLabel>
            <div className="mt-3 grid gap-3">
              {confirmedProposals.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ border: '1.5px solid #D4EDD8' }}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#F0FAF2' }}>🍽️</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: '#2D1B0E' }}>{p.restaurantName}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9B8B7E' }}>{p.groupName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#5BAF7A' }}>{p.proposedDate}</p>
                    <p className="text-xs" style={{ color: '#7AC8A0' }}>確定済み</p>
                  </div>
                </div>
              ))}
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
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                      style={{ background: a.type === 'proposal' ? '#FFF0EC' : a.type === 'vote' ? '#F0FAF2' : a.type === 'message' ? '#EEF3FC' : '#F5EEFA' }}>
                      {a.type === 'proposal' ? '✨' : a.type === 'vote' ? '🗳️' : a.type === 'message' ? '💬' : '👋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-relaxed" style={{ color: '#2D1B0E' }}>{a.text}</p>
                      <p className="text-[10px] font-bold mt-0.5" style={{ color: '#C8B8A8' }}>{a.groupName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {groups.length === 0 ? (
            <div className="flex flex-col items-center py-14 rounded-3xl" style={{ background: '#FFFFFF', border: '1.5px dashed #EDE8E3' }}>
              <BearMascot size={90} mood="wink" />
              <p className="mt-3 font-bold" style={{ color: '#2D1B0E' }}>グループを作って始めよう</p>
              <p className="mt-1 text-xs mb-5" style={{ color: '#9B8B7E' }}>友達を招待して空き時間を自動でマッチング</p>
              <button onClick={() => setShowModal(true)}
                className="text-white px-6 py-3 rounded-2xl text-sm font-bold"
                style={{ background: '#F07050', boxShadow: '0 3px 12px rgba(240,112,80,0.25)' }}>
                最初のグループを作る
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black" style={{ color: '#2D1B0E' }}>グループを作成</h3>
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
