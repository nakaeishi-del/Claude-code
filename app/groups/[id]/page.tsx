'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProposalCard from '@/components/ProposalCard'
import AvailabilityHeatmap from '@/components/AvailabilityHeatmap'
import GroupChat from '@/components/GroupChat'
import BearMascot from '@/components/BearMascot'
import Link from 'next/link'

interface Member {
  id: string
  name: string
  email: string
  priceRange: string
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

  async function handlePropose() {
    setProposing(true)
    setProposeError('')
    const body = selectedDate ? JSON.stringify({ date: selectedDate }) : undefined
    const res = await fetch(`/api/groups/${groupId}/proposals`, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body,
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
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black"
                    style={{ background: avatarPalette[i % avatarPalette.length] }}>
                    {m.user.name.charAt(0)}
                  </div>
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
          {group.members.length < 4 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #F5F0EB' }}>
              {!showInvite ? (
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
          <div className="text-center py-8 font-bold mb-6" style={{ color: '#C8B8A8', fontSize: '0.875rem' }}>
            まだ提案がありません。上のボタンで自動提案を試してみましょう！
          </div>
        )}

        {/* Group chat */}
        <section>
          <SLabel>グループトーク</SLabel>
          <div className="mt-3 bg-white rounded-2xl p-5" style={{ border: '1.5px solid #EDE8E3' }}>
            <GroupChat groupId={groupId} currentUserId={currentUserId} />
          </div>
        </section>
      </main>

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
