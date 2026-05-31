'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import GroupCard from '@/components/GroupCard'
import { clsx } from 'clsx'

interface User {
  id: string
  name: string
  email: string
  priceRange: string
}

interface Group {
  id: string
  name: string
  description?: string | null
  priceRange: string
  members: { user: { id: string; name: string; email: string } }[]
  memberCount?: number
  latestProposal?: {
    id: string
    status: string
    proposedDate: string
    restaurantName: string
    votes: { vote: string }[]
  } | null
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
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    priceRange: 'mid',
  })

  const fetchData = useCallback(async () => {
    const [meRes, groupsRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/groups'),
    ])

    if (!meRes.ok) {
      router.push('/')
      return
    }

    const meData = await meRes.json()
    const groupsData = await groupsRes.json()

    setUser(meData.user)
    setGroups(groupsData.groups || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setFormError('')

    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setFormError(data.error || 'エラーが発生しました')
      setCreating(false)
      return
    }

    setShowModal(false)
    setForm({ name: '', description: '', priceRange: 'mid' })
    await fetchData()
    setCreating(false)
  }

  const confirmedProposals = groups
    .flatMap((g) =>
      g.latestProposal?.status === 'confirmed'
        ? [{ ...g.latestProposal, groupName: g.name, groupId: g.id }]
        : []
    )
    .sort((a, b) => a.proposedDate.localeCompare(b.proposedDate))

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar userName={user?.name} />

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            こんにちは、{user?.name}さん 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            今日も友達との時間を作りましょう
          </p>
        </div>

        {/* Upcoming confirmed */}
        {confirmedProposals.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#4ECDC4] rounded-full inline-block"></span>
              今後の予定
            </h2>
            <div className="grid gap-3">
              {confirmedProposals.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl p-4 border border-green-100 shadow-sm flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    🍽️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm">{p.restaurantName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.groupName}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-green-600">{p.proposedDate}</div>
                    <div className="text-xs text-green-500">確定済み</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Groups */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#FF6B6B] rounded-full inline-block"></span>
              あなたのグループ
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-[#FF6B6B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#e55a5a] transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              グループを作成
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
              <div className="text-4xl mb-3">👥</div>
              <div className="text-gray-500 text-sm">グループがありません</div>
              <div className="text-gray-400 text-xs mt-1 mb-4">友達とグループを作って自動スケジューリングを始めましょう</div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#FF6B6B] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#e55a5a] transition-colors"
              >
                最初のグループを作成
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Group Modal — bottom sheet on mobile, centered on desktop */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center sm:p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle — mobile only */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="p-6 pt-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">グループを作成</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>
              )}

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">グループ名 *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] text-sm"
                    placeholder="渋谷グルメ部"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] text-sm resize-none"
                    rows={2}
                    placeholder="グループの説明を入力..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">価格帯</label>
                  <div className="grid grid-cols-3 gap-2">
                    {priceRangeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, priceRange: opt.value })}
                        className={clsx(
                          'p-3 rounded-xl border-2 text-center transition-all',
                          form.priceRange === opt.value
                            ? 'border-[#FF6B6B] bg-[#FF6B6B]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className={clsx('text-xs font-semibold', form.priceRange === opt.value ? 'text-[#FF6B6B]' : 'text-gray-700')}>
                          {opt.label}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 bg-[#FF6B6B] text-white rounded-xl font-semibold hover:bg-[#e55a5a] transition-colors disabled:opacity-60 mt-2"
                >
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
