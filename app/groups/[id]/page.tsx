'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProposalCard from '@/components/ProposalCard'
import { clsx } from 'clsx'

interface Member {
  id: string
  name: string
  email: string
  priceRange: string
}

interface Vote {
  id: string
  userId: string
  vote: string
  user: { id: string; name: string }
}

interface Proposal {
  id: string
  proposedDate: string
  proposedTime: string
  restaurantName: string
  restaurantArea: string
  restaurantGenre: string
  estimatedCost: string
  status: string
  createdAt: string
  createdBy: { id: string; name: string }
  votes: Vote[]
}

interface Group {
  id: string
  name: string
  description?: string | null
  priceRange: string
  createdAt: string
  members: { id: string; role: string; user: Member }[]
  proposals: Proposal[]
}

const avatarColors = [
  'bg-[#FF6B6B]',
  'bg-[#4ECDC4]',
  'bg-yellow-400',
  'bg-purple-400',
]

const priceLabels: Record<string, string> = {
  budget: 'リーズナブル (〜¥3,000)',
  mid: 'スタンダード (¥3,000〜¥8,000)',
  high: 'プレミアム (¥8,000〜)',
}

export default function GroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [myRole, setMyRole] = useState<string>('member')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [proposing, setProposing] = useState(false)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const fetchData = useCallback(async () => {
    const [meRes, groupRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch(`/api/groups/${groupId}`),
    ])

    if (!meRes.ok) {
      router.push('/')
      return
    }

    if (!groupRes.ok) {
      router.push('/dashboard')
      return
    }

    const meData = await meRes.json()
    const groupData = await groupRes.json()

    setCurrentUserId(meData.user.id)
    setGroup(groupData.group)
    setMyRole(groupData.myRole)
    setLoading(false)
  }, [groupId, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handlePropose() {
    setProposing(true)
    const res = await fetch(`/api/groups/${groupId}/proposals`, {
      method: 'POST',
    })
    const data = await res.json()
    if (res.ok) {
      await fetchData()
    } else {
      alert(data.error || 'エラーが発生しました')
    }
    setProposing(false)
  }

  async function handleVote(proposalId: string, vote: 'accept' | 'decline' | 'maybe') {
    setVotingId(proposalId)
    const res = await fetch(`/api/groups/${groupId}/proposals/${proposalId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote }),
    })
    if (res.ok) {
      await fetchData()
    }
    setVotingId(null)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    setInviteSuccess('')

    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })

    const data = await res.json()
    if (!res.ok) {
      setInviteError(data.error || 'エラーが発生しました')
    } else {
      setInviteSuccess(`${data.member.user.name}さんをグループに追加しました`)
      setInviteEmail('')
      await fetchData()
    }
    setInviting(false)
  }

  function copyInviteLink() {
    const url = `${window.location.origin}/join/${groupId}`
    navigator.clipboard.writeText(url)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    )
  }

  if (!group) return null

  const activeProposals = group.proposals.filter((p) => p.status === 'pending')
  const pastProposals = group.proposals.filter((p) => p.status !== 'pending')

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-8">
        {/* Back */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ダッシュボードへ
        </button>

        {/* Group header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{group.name}</h1>
              {group.description && (
                <p className="text-sm text-gray-500 mt-1">{group.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">{priceLabels[group.priceRange]}</p>
            </div>
          </div>

          {/* Members */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">メンバー ({group.members.length}人)</h3>
            <div className="flex flex-wrap gap-3">
              {group.members.map((m, i) => (
                <div key={m.id} className="flex items-center gap-2">
                  <div
                    className={clsx(
                      'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold',
                      avatarColors[i % avatarColors.length]
                    )}
                  >
                    {m.user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      {m.user.name}
                      {m.user.id === currentUserId && <span className="text-xs text-gray-400 ml-1">(あなた)</span>}
                    </div>
                    <div className="text-xs text-gray-400">{m.role === 'owner' ? 'オーナー' : 'メンバー'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite section */}
          {group.members.length < 4 && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <button
                onClick={copyInviteLink}
                className={clsx(
                  'flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors',
                  linkCopied
                    ? 'bg-green-50 text-green-600'
                    : 'bg-[#4ECDC4]/10 text-[#4ECDC4] hover:bg-[#4ECDC4]/20'
                )}
              >
                {linkCopied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    コピーしました！
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    招待リンクをコピー
                  </>
                )}
              </button>
              {!showInvite ? (
                <button
                  onClick={() => setShowInvite(true)}
                  className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  メールアドレスで招待
                </button>
              ) : (
                <form onSubmit={handleInvite} className="space-y-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="メールアドレスで招待"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-sm"
                    required
                  />
                  {inviteError && <p className="text-xs text-red-500">{inviteError}</p>}
                  {inviteSuccess && <p className="text-xs text-green-500">{inviteSuccess}</p>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={inviting}
                      className="flex-1 py-3 bg-[#4ECDC4] text-white rounded-xl text-sm font-semibold hover:bg-[#3ba89e] disabled:opacity-60 transition-colors"
                    >
                      {inviting ? '招待中...' : '招待する'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowInvite(false); setInviteError(''); setInviteSuccess('') }}
                      className="px-4 py-3 text-gray-400 hover:text-gray-600 rounded-xl border border-gray-200"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Propose button */}
        <div className="mb-6">
          <button
            onClick={handlePropose}
            disabled={proposing}
            className="w-full py-4 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-xl font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-60 shadow-md"
          >
            {proposing ? '最適な日程を計算中...' : '✨ 次の集まりを提案する'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            メンバーの空き状況を分析して自動でおすすめの日程を提案します
          </p>
        </div>

        {/* Active proposals */}
        {activeProposals.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full inline-block animate-pulse"></span>
              現在の提案
            </h2>
            <div className="space-y-4">
              {activeProposals.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  currentUserId={currentUserId}
                  memberCount={group.members.length}
                  onVote={handleVote}
                  loading={votingId === p.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Past proposals */}
        {pastProposals.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-700 mb-3">過去の提案</h2>
            <div className="space-y-4">
              {pastProposals.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  currentUserId={currentUserId}
                  memberCount={group.members.length}
                  onVote={handleVote}
                  loading={votingId === p.id}
                />
              ))}
            </div>
          </section>
        )}

        {group.proposals.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            まだ提案がありません。上のボタンで自動提案を試してみましょう！
          </div>
        )}
      </main>
    </div>
  )
}
