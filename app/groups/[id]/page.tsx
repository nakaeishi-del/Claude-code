'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProposalCard from '@/components/ProposalCard'
import AvailabilityHeatmap from '@/components/AvailabilityHeatmap'
import GroupChat from '@/components/GroupChat'
import BearMascot from '@/components/BearMascot'
import Avatar from '@/components/Avatar'
import Link from 'next/link'

interface Member {
  id: string
  name: string
  email: string
  priceRange: string
  avatarUrl?: string | null
  hasAvailability?: boolean
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

interface RestaurantSuggestion {
  name: string
  area: string
  genre: string
  priceRange: string
  rating: number
  description: string
  featured?: boolean
  sponsorTag?: string
}

interface LikedEvent {
  event: { id: string; date: string; title: string; genre: string; venue: string; area: string }
  likedBy: { id: string; name: string }[]
}

const avatarPalette = ['#F07050', '#7AC8A0', '#F0B050', '#A87FD0']

const priceLabels: Record<string, string> = {
  budget: 'リーズナブル (〜¥3,000)',
  mid:    'スタンダード (¥3,000〜¥8,000)',
  high:   'プレミアム (¥8,000〜)',
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-black" style={{ color: '#9B8B7E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</h2>
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
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [proposeError, setProposeError] = useState('')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [actioning, setActioning] = useState(false)
  const [restaurantSuggestions, setRestaurantSuggestions] = useState<RestaurantSuggestion[]>([])
  const [showRestaurantPicker, setShowRestaurantPicker] = useState(false)
  const [likedEvents, setLikedEvents] = useState<LikedEvent[]>([])

  const fetchData = useCallback(async () => {
    const [meRes, groupRes] = await Promise.all([fetch('/api/auth/me'), fetch(`/api/groups/${groupId}`)])
    if (!meRes.ok) { router.push('/'); return }
    if (!groupRes.ok) { router.push('/dashboard'); return }
    const meData = await meRes.json()
    const groupData = await groupRes.json()
    setCurrentUserId(meData.user.id)
    setGroup(groupData.group)
    setMyRole(groupData.myRole || 'member')
    setLoading(false)
  }, [groupId, router])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!groupId) return
    fetch(`/api/groups/${groupId}/liked-events`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setLikedEvents(d.events || []) })
      .catch(() => {})
  }, [groupId])

  async function handlePropose() {
    setProposing(true)
    setProposeError('')
    try {
      const res = await fetch(`/api/groups/${groupId}/restaurant-suggestions`)
      if (res.ok) {
        const d = await res.json()
        setRestaurantSuggestions(d.suggestions || [])
        setShowRestaurantPicker(true)
      } else {
        await handleProposeWithRestaurant(null)
      }
    } catch {
      await handleProposeWithRestaurant(null)
    }
    setProposing(false)
  }

  async function handleProposeWithRestaurant(restaurant: RestaurantSuggestion | null) {
    setShowRestaurantPicker(false)
    setProposing(true)
    setProposeError('')
    const body: Record<string, unknown> = {}
    if (selectedDate) body.date = selectedDate
    if (restaurant) body.restaurant = restaurant
    const res = await fetch(`/api/groups/${groupId}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (res.ok) {
      await fetchData()
    } else {
      setProposeError(data.error || 'エラーが発生しました')
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
    if (res.ok) await fetchData()
    setVotingId(null)
  }

  async function handleCancelProposal(proposalId: string) {
    setCancellingId(proposalId)
    const res = await fetch(`/api/groups/${groupId}/proposals/${proposalId}`, { method: 'PATCH' })
    if (res.ok) await fetchData()
    setCancellingId(null)
  }

  async function handleLeaveGroup() {
    setActioning(true)
    const res = await fetch(`/api/groups/${groupId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'leave' }),
    })
    if (res.ok) router.push('/dashboard')
    else setActioning(false)
  }

  async function handleDeleteGroup() {
    setActioning(true)
    const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' })
    if (res.ok) router.push('/dashboard')
    else setActioning(false)
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
    navigator.clipboard.writeText(`${window.location.origin}/join/${groupId}`).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  function shareInviteLink() {
    const url = `${window.location.origin}/join/${groupId}`
    const text = `${group?.name}のグループに招待されました！tomomeetで一緒に予定を立てよう🗓️`
    if (navigator.share) {
      navigator.share({ title: 'tomomeet', text, url })
    } else {
      const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text + '\n' + url)}`
      window.open(lineUrl, '_blank')
    }
  }

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

  if (!group) return null

  const activeProposals = group.proposals.filter((p) => p.status === 'pending')
  const pastProposals = group.proposals.filter((p) => p.status !== 'pending')
  const me = group.members.find((m) => m.user.id === currentUserId)

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF9' }}>
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-24 sm:pb-10">
        {/* Back */}
        <button onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-sm font-bold mb-6 transition-colors"
          style={{ color: '#9B8B7E' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          ダッシュボードへ
        </button>

        {/* Group header */}
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ border: '1.5px solid #EDE8E3' }}>
          <h1 className="text-xl font-black" style={{ color: '#2D1B0E' }}>{group.name}</h1>
          {group.description && (
            <p className="text-sm mt-1" style={{ color: '#9B8B7E' }}>{group.description}</p>
          )}
          <p className="text-xs mt-1 font-bold" style={{ color: '#C8B8A8' }}>{priceLabels[group.priceRange]}</p>

          {/* Members */}
          <div className="mt-5">
            <p className="text-xs font-black mb-3" style={{ color: '#9B8B7E' }}>メンバー ({group.members.length}人)</p>
            <div className="flex flex-wrap gap-3">
              {group.members.map((m, i) => (
                <div key={m.id} className="flex items-center gap-2">
                  <Avatar name={m.user.name} avatarUrl={m.user.avatarUrl} size={36}
                    color={avatarPalette[i % avatarPalette.length]} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold" style={{ color: '#2D1B0E' }}>{m.user.name}</span>
                      {m.user.id === currentUserId && (
                        <span className="text-xs font-bold" style={{ color: '#C8B8A8' }}>(あなた)</span>
                      )}
                      {m.user.hasAvailability === false && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black"
                          style={{ background: '#FFF0EC', color: '#F07050' }}>未設定</span>
                      )}
                    </div>
                    <div className="text-xs font-bold" style={{ color: '#C8B8A8' }}>
                      {m.role === 'owner' ? 'オーナー' : 'メンバー'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite */}
          {group.members.length < 8 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #F5F0EB' }}>
              {!showInvite ? (
                <div className="space-y-2">
                  <button onClick={shareInviteLink}
                    className="w-full py-3 rounded-2xl text-white text-sm font-black flex items-center justify-center gap-2"
                    style={{ background: '#06C755' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.627.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    LINEで友達を招待する
                  </button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowInvite(true)}
                      className="text-sm font-black flex items-center gap-1"
                      style={{ color: '#7AC8A0' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      メールで招待
                    </button>
                    <span style={{ color: '#EDE8E3' }}>|</span>
                    <button onClick={copyInviteLink} className="text-sm font-black flex items-center gap-1"
                      style={{ color: '#7AC8A0' }}>
                      {linkCopied ? (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>コピー済み</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>招待リンクをコピー</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInvite} className="space-y-2">
                  <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="メールアドレスで招待" required
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none font-bold"
                    style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3', color: '#2D1B0E' }}
                    onFocus={(e) => { e.target.style.borderColor = '#F07050' }}
                    onBlur={(e) => { e.target.style.borderColor = '#EDE8E3' }}
                  />
                  {inviteError && <p className="text-xs font-bold" style={{ color: '#F07050' }}>{inviteError}</p>}
                  {inviteSuccess && <p className="text-xs font-bold" style={{ color: '#5BAF7A' }}>{inviteSuccess}</p>}
                  <div className="flex gap-2">
                    <button type="submit" disabled={inviting}
                      className="flex-1 py-3 rounded-2xl text-white text-sm font-black disabled:opacity-60"
                      style={{ background: '#7AC8A0' }}>
                      {inviting ? '招待中...' : '招待する'}
                    </button>
                    <button type="button"
                      onClick={() => { setShowInvite(false); setInviteError(''); setInviteSuccess('') }}
                      className="px-4 py-3 rounded-2xl text-sm font-bold"
                      style={{ border: '1.5px solid #EDE8E3', color: '#9B8B7E' }}>
                      キャンセル
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Leave / Delete */}
          <div className="mt-4 pt-4 flex justify-end" style={{ borderTop: '1px solid #F5F0EB' }}>
            {myRole === 'owner' ? (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-black px-3 py-1.5 rounded-xl"
                style={{ color: '#C8B8A8', border: '1.5px solid #EDE8E3' }}>
                グループを削除
              </button>
            ) : (
              <button onClick={() => setShowLeaveConfirm(true)}
                className="text-xs font-black px-3 py-1.5 rounded-xl"
                style={{ color: '#C8B8A8', border: '1.5px solid #EDE8E3' }}>
                グループを退出
              </button>
            )}
          </div>
        </div>

        {/* Availability nudge */}
        {me && me.user.hasAvailability === false && (
          <div className="mb-5 p-4 rounded-2xl flex items-center gap-3" style={{ background: '#FFF0EC', border: '1.5px solid #F5C4B0' }}>
            <BearMascot size={40} mood="wink" />
            <div className="flex-1">
              <p className="text-sm font-black" style={{ color: '#C85030' }}>空き時間を設定しよう！</p>
              <p className="text-xs mt-0.5 font-bold" style={{ color: '#D4845A' }}>設定するとマッチング精度が上がります</p>
            </div>
            <Link href="/settings"
              className="text-xs font-black px-3 py-2 rounded-xl text-white shrink-0"
              style={{ background: '#F07050' }}>
              設定する
            </Link>
          </div>
        )}

        {/* Solo group invite nudge */}
        {group.members.length === 1 && (
          <div className="mb-5 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #EEF3FC 0%, #F0F8FF 100%)', border: '1.5px solid #BDD3F8' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">👥</div>
              <div>
                <p className="font-black text-sm" style={{ color: '#2D4080' }}>友達を招待して一緒に計画しよう！</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: '#6B8FD4' }}>2人以上になるとマッチングが始まります</p>
              </div>
            </div>
            <button onClick={shareInviteLink}
              className="w-full py-3 rounded-2xl text-white text-sm font-black flex items-center justify-center gap-2"
              style={{ background: '#06C755' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.627.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              LINEで友達を招待する
            </button>
          </div>
        )}

        {/* Availability heatmap */}
        <div className="bg-white rounded-2xl p-5 mb-5" style={{ border: '1.5px solid #EDE8E3' }}>
          <SLabel>みんなの空き時間（次の4週間）</SLabel>
          <div className="mt-4">
            <AvailabilityHeatmap groupId={groupId} memberCount={group.members.length} onSelectDate={setSelectedDate} />
          </div>
        </div>

        {/* Propose button */}
        <div className="mb-6">
          <button onClick={handlePropose} disabled={proposing}
            className="w-full py-4 text-white rounded-2xl font-black text-base transition-opacity disabled:opacity-60"
            style={{ background: '#F07050', boxShadow: '0 4px 16px rgba(240,112,80,0.28)' }}>
            {proposing
              ? '最適な日程を計算中...'
              : selectedDate
                ? `📅 ${selectedDate.slice(5).replace('-', '/')} で提案する`
                : '✨ 自動で最適な日程を提案する'}
          </button>
          {proposeError && (
            <div className="mt-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-center"
              style={{ background: '#FFF0EC', color: '#C85030', border: '1px solid #F5C4B0' }}>
              {proposeError}
            </div>
          )}
          {selectedDate ? (
            <button onClick={() => setSelectedDate(null)}
              className="w-full text-center text-xs font-bold mt-2"
              style={{ color: '#C8B8A8' }}>
              日付の選択を解除して自動計算にする
            </button>
          ) : (
            <p className="text-center text-xs font-bold mt-2" style={{ color: '#C8B8A8' }}>
              上のカレンダーで日付を選ぶか、自動計算もできます
            </p>
          )}
        </div>

        {/* Active proposals */}
        {activeProposals.length > 0 && (
          <section className="mb-6">
            <SLabel>現在の提案</SLabel>
            <div className="mt-3 space-y-4">
              {activeProposals.map((p) => (
                <ProposalCard key={p.id} proposal={p} currentUserId={currentUserId}
                  memberCount={group.members.length} myRole={myRole}
                  onVote={handleVote} onCancel={handleCancelProposal}
                  loading={votingId === p.id || cancellingId === p.id} />
              ))}
            </div>
          </section>
        )}

        {/* Past proposals */}
        {pastProposals.length > 0 && (
          <section className="mb-6">
            <SLabel>過去の提案</SLabel>
            <div className="mt-3 space-y-4">
              {pastProposals.map((p) => (
                <ProposalCard key={p.id} proposal={p} currentUserId={currentUserId}
                  memberCount={group.members.length} myRole={myRole}
                  onVote={handleVote} loading={votingId === p.id} />
              ))}
            </div>
          </section>
        )}

        {group.proposals.length === 0 && (
          <div className="mb-6 rounded-2xl p-6 text-center" style={{ background: '#FAFAF8', border: '1.5px dashed #EDE8E3' }}>
            <div className="text-3xl mb-3">🍽️</div>
            <div className="font-black text-sm mb-1" style={{ color: '#2D1B0E' }}>まだ提案がありません</div>
            <div className="text-xs font-bold mb-4" style={{ color: '#C8B8A8' }}>
              上の「自動提案する」ボタンを押すと<br/>AIがお店と日程を自動で提案してくれます
            </div>
            <div className="flex gap-2 justify-center text-xs font-black" style={{ color: '#9B8B7E' }}>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ background: '#F07050' }}>1</span>
                空き時間を登録
              </span>
              <span style={{ color: '#EDE8E3' }}>›</span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ background: '#F07050' }}>2</span>
                自動提案する
              </span>
              <span style={{ color: '#EDE8E3' }}>›</span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ background: '#F07050' }}>3</span>
                みんなで投票
              </span>
            </div>
          </div>
        )}

        {/* Liked events by members */}
        {likedEvents.length > 0 && (
          <section className="mb-6">
            <SLabel>みんなが気になっているイベント ♡</SLabel>
            <div className="mt-3 space-y-2">
              {likedEvents.map(({ event, likedBy }) => {
                const genreEmoji: Record<string, string> = { music: '🎵', food: '🍜', sports: '⚽', art: '🎨', theater: '🎭', festival: '🎉' }
                const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(event.venue + ' ' + event.area)}`
                return (
                  <div key={event.id} className="bg-white rounded-2xl p-4" style={{ border: '1.5px solid #EDE8E3' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#FFF5F2' }}>
                        {genreEmoji[event.genre] || '🎪'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-sm leading-snug" style={{ color: '#2D1B0E' }}>{event.title}</div>
                        <div className="text-xs mt-0.5 font-bold" style={{ color: '#9B8B7E' }}>{event.date} · {event.venue}（{event.area}）</div>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {likedBy.map((u) => (
                            <span key={u.id} className="text-[11px] px-2 py-0.5 rounded-full font-black"
                              style={{ background: '#FFF0EC', color: '#F07050' }}>
                              ♡ {u.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 text-xs font-black px-3 py-2 rounded-xl"
                        style={{ background: '#F5F0EB', color: '#6B5B4E' }}>
                        地図
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Group chat */}
        <section>
          <SLabel>グループトーク</SLabel>
          <div className="mt-3 bg-white rounded-2xl p-5" style={{ border: '1.5px solid #EDE8E3' }}>
            <GroupChat groupId={groupId} currentUserId={currentUserId} />
          </div>
        </section>
      </main>

      {/* Restaurant picker modal */}
      {showRestaurantPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center sm:p-4 z-50"
          onClick={() => { setShowRestaurantPicker(false); setProposing(false) }}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md"
            style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: '#EDE8E3' }} />
            </div>
            <div className="p-6 pt-4">
              <h3 className="text-lg font-black mb-1" style={{ color: '#2D1B0E' }}>お店を選んで提案する</h3>
              <p className="text-xs font-bold mb-5" style={{ color: '#C8B8A8' }}>3つの候補から選ぼう。グループの価格帯に合わせて絞り込んでいます</p>
              <div className="space-y-3">
                {restaurantSuggestions.map((r, i) => (
                  <button key={i} onClick={() => handleProposeWithRestaurant(r)}
                    className="w-full text-left p-4 rounded-2xl transition-all active:scale-[0.98]"
                    style={{ border: '1.5px solid #EDE8E3', background: '#FAFAF8' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#FFF0EC' }}>
                        🍽️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="font-black text-sm" style={{ color: '#2D1B0E' }}>{r.name}</div>
                          {r.sponsorTag && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                              style={{ background: '#FFF0EC', color: '#F07050' }}>{r.sponsorTag}</span>
                          )}
                        </div>
                        <div className="text-xs mt-0.5 font-bold" style={{ color: '#9B8B7E' }}>{r.area} · {r.genre}</div>
                        <div className="text-xs mt-1 line-clamp-1" style={{ color: '#C8B8A8' }}>{r.description}</div>
                      </div>
                      <div className="text-xs font-black shrink-0" style={{ color: '#F0C050' }}>★ {r.rating}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => handleProposeWithRestaurant(null)}
                className="w-full mt-3 py-3 rounded-2xl text-sm font-black"
                style={{ color: '#C8B8A8', border: '1.5px solid #EDE8E3' }}>
                ランダムで決める
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave confirm modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setShowLeaveConfirm(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black mb-2" style={{ color: '#2D1B0E' }}>グループを退出しますか？</h3>
            <p className="text-sm font-bold mb-6" style={{ color: '#9B8B7E' }}>退出するとこのグループの提案やチャットにアクセスできなくなります。</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-black"
                style={{ border: '1.5px solid #EDE8E3', color: '#9B8B7E' }}>
                キャンセル
              </button>
              <button onClick={handleLeaveGroup} disabled={actioning}
                className="flex-1 py-3 rounded-2xl text-white text-sm font-black disabled:opacity-60"
                style={{ background: '#F07050' }}>
                {actioning ? '退出中...' : '退出する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black mb-2" style={{ color: '#2D1B0E' }}>グループを削除しますか？</h3>
            <p className="text-sm font-bold mb-6" style={{ color: '#9B8B7E' }}>この操作は取り消せません。メンバー全員のデータが削除されます。</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-black"
                style={{ border: '1.5px solid #EDE8E3', color: '#9B8B7E' }}>
                キャンセル
              </button>
              <button onClick={handleDeleteGroup} disabled={actioning}
                className="flex-1 py-3 rounded-2xl text-white text-sm font-black disabled:opacity-60"
                style={{ background: '#F07050' }}>
                {actioning ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
