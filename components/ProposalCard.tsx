'use client'

import { useState } from 'react'
import BearMascot from './BearMascot'
import ShareCard from './ShareCard'
import { useToast } from './Toast'

interface Vote {
  id: string
  userId: string
  vote: string
  user: { id: string; name: string }
}

interface ProposalCardProps {
  proposal: {
    id: string
    proposedDate: string
    proposedTime: string
    restaurantName: string
    restaurantArea: string
    restaurantGenre: string
    estimatedCost: string
    status: string
    createdBy: { id: string; name: string }
    votes: Vote[]
  }
  currentUserId: string
  memberCount: number
  myRole?: string
  onVote: (proposalId: string, vote: 'accept' | 'decline' | 'maybe') => void
  onCancel?: (proposalId: string) => void
  loading?: boolean
}

const statusStyles: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  pending:   { color: '#F07050', bg: '#FFF0EC', label: '投票中', icon: '🗳️' },
  confirmed: { color: '#5BAF7A', bg: '#F0FAF2', label: '確定！', icon: '✅' },
  cancelled: { color: '#C8B8A8', bg: '#F5F0EB', label: 'キャンセル', icon: '✕' },
}

const voteConfig = {
  accept:  { label: '参加する', icon: '○', active: { bg: '#5BAF7A', color: '#fff' } },
  maybe:   { label: '未定',     icon: '△', active: { bg: '#F0C050', color: '#fff' } },
  decline: { label: '欠席',     icon: '✕', active: { bg: '#F07050', color: '#fff' } },
}

function SharePlanButton({ date, restaurant, area }: { date: string; restaurant: string; area: string }) {
  const { showToast } = useToast()
  const text = `🍽️ ${date} に ${area}の「${restaurant}」に行くことになった！友達と tomomeet で計画したよ✨\nhttps://tomomeet.vercel.app`
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`

  function copyText() {
    navigator.clipboard.writeText(text).then(() => {
      showToast('コピーしました！', 'success')
    }).catch(() => {
      showToast('コピーに失敗しました', 'error')
    })
  }

  return (
    <div className="flex gap-2 mb-4">
      <a href={lineUrl} target="_blank" rel="noopener noreferrer"
        className="flex-1 py-2.5 rounded-2xl text-white text-sm font-black text-center flex items-center justify-center gap-1.5"
        style={{ background: '#06C755' }}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.627.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
        </svg>
        LINEでシェア
      </a>
      <button onClick={copyText}
        className="px-4 py-2.5 rounded-2xl text-sm font-black"
        style={{ border: '1.5px solid #EDE8E3', color: '#9B8B7E', background: '#FAFAF8' }}>
        コピー
      </button>
    </div>
  )
}

export default function ProposalCard({ proposal, currentUserId, memberCount, myRole, onVote, onCancel, loading }: ProposalCardProps) {
  const [poppingVote, setPoppingVote] = useState<string | null>(null)
  const myVote = proposal.votes.find((v) => v.userId === currentUserId)

  function handleVoteClick(v: 'accept' | 'decline' | 'maybe') {
    setPoppingVote(v)
    setTimeout(() => setPoppingVote(null), 380)
    onVote(proposal.id, v)
  }
  const acceptCount = proposal.votes.filter((v) => v.vote === 'accept').length
  const declineCount = proposal.votes.filter((v) => v.vote === 'decline').length
  const maybeCount = proposal.votes.filter((v) => v.vote === 'maybe').length

  const dateObj = new Date(proposal.proposedDate + 'T00:00:00')
  const dateLabel = dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const daysUntil = Math.round((dateObj.getTime() - today.getTime()) / 86400000)
  const daysLabel = daysUntil === 0 ? '今日！' : daysUntil === 1 ? '明日！' : daysUntil > 0 ? `あと${daysUntil}日` : null

  const st = statusStyles[proposal.status] || statusStyles.cancelled
  const borderColor = proposal.status === 'confirmed' ? '#D4EDD8'
    : proposal.status === 'cancelled' ? '#EDE8E3'
    : '#F5C4B0'

  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: `1.5px solid ${borderColor}` }}>
      {proposal.status === 'confirmed' && (
        <>
          <div className="mb-4 rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #F0FAF2, #E8F7EC)', border: '1.5px solid #BBF7D0' }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <BearMascot size={44} mood="celebrate" animate animationType="float" />
              <div>
                <p className="font-black text-sm" style={{ color: '#3B8A5A' }}>全員参加確定！</p>
                <p className="text-xs font-bold" style={{ color: '#5BAF7A' }}>楽しんできてね 🎉</p>
              </div>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-xs font-black mb-2" style={{ color: '#9B8B7E' }}>シェア画像を生成</p>
            <ShareCard
              date={proposal.proposedDate}
              time={proposal.proposedTime}
              restaurant={proposal.restaurantName}
              area={proposal.restaurantArea}
              genre={proposal.restaurantGenre}
              members={proposal.votes.filter(v => v.vote === 'accept').map(v => v.user.name)}
              cost={proposal.estimatedCost}
            />
          </div>
          <SharePlanButton
            date={proposal.proposedDate}
            restaurant={proposal.restaurantName}
            area={proposal.restaurantArea}
          />
        </>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-black mb-2"
            style={{ color: st.color, background: st.bg }}>
            <span>{st.icon}</span>
            <span>{st.label}</span>
          </span>
          <div className="text-base font-black" style={{ color: '#2D1B0E' }}>{dateLabel}</div>
          <div className="text-sm mt-0.5" style={{ color: '#9B8B7E' }}>{proposal.proposedTime}〜</div>
        </div>
        <div className="text-right">
          {daysLabel && proposal.status !== 'cancelled' && (
            <div className={`text-base font-black mb-1 ${daysUntil <= 1 ? 'gentle-pulse' : ''}`}
              style={{ color: daysUntil === 0 ? '#F07050' : daysUntil === 1 ? '#C8A020' : '#3B8A5A' }}>
              {daysLabel}
            </div>
          )}
          <div className="text-xs font-bold" style={{ color: '#C8B8A8' }}>{proposal.createdBy.name}が提案</div>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-4" style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: '#FFF0EC' }}>
            🍽️
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm truncate" style={{ color: '#2D1B0E' }}>{proposal.restaurantName}</div>
            <div className="text-xs mt-0.5 font-bold" style={{ color: '#9B8B7E' }}>
              {proposal.restaurantArea} · {proposal.restaurantGenre}
            </div>
            <div className="text-xs mt-1 font-black" style={{ color: '#F07050' }}>{proposal.estimatedCost}</div>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <a href={`https://www.google.com/maps/search/${encodeURIComponent(proposal.restaurantName + ' ' + proposal.restaurantArea)}`}
              target="_blank" rel="noopener noreferrer"
              className="text-[11px] font-black px-2.5 py-1.5 rounded-xl text-center"
              style={{ background: '#EEF3FC', color: '#4285F4' }}>
              地図
            </a>
            <a href={`https://tabelog.com/rstLst/?vs=1&sa=${encodeURIComponent(proposal.restaurantArea)}&keyword=${encodeURIComponent(proposal.restaurantName)}`}
              target="_blank" rel="noopener noreferrer"
              className="text-[11px] font-black px-2.5 py-1.5 rounded-xl text-center"
              style={{ background: '#FFF0EC', color: '#F07050' }}>
              食べログ
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { count: acceptCount,  label: '参加', color: '#5BAF7A', bg: '#F0FAF2' },
          { count: maybeCount,   label: '未定', color: '#C8A020', bg: '#FFFBEB' },
          { count: declineCount, label: '欠席', color: '#F07050', bg: '#FFF0EC' },
          { count: memberCount - proposal.votes.length, label: '未投票', color: '#C8B8A8', bg: '#F5F0EB' },
        ].map(({ count, label, color, bg }) => (
          <div key={label} className="text-center py-2 rounded-2xl" style={{ background: bg }}>
            <div className="text-lg font-black" style={{ color }}>{count}</div>
            <div className="text-[10px] font-bold" style={{ color }}>{label}</div>
          </div>
        ))}
      </div>
      {memberCount > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden mb-4" style={{ background: '#F5F0EB' }}>
          {acceptCount > 0 && (
            <div style={{ width: `${(acceptCount / memberCount) * 100}%`, background: '#5BAF7A', transition: 'width 0.5s ease' }} />
          )}
          {maybeCount > 0 && (
            <div style={{ width: `${(maybeCount / memberCount) * 100}%`, background: '#F0C050', transition: 'width 0.5s ease' }} />
          )}
          {declineCount > 0 && (
            <div style={{ width: `${(declineCount / memberCount) * 100}%`, background: '#F07050', transition: 'width 0.5s ease' }} />
          )}
        </div>
      )}

      {proposal.status === 'pending' && (() => {
        const remaining = memberCount - acceptCount - declineCount - maybeCount
        const isClose = remaining === 1 && declineCount === 0
        const allVoted = remaining === 0
        return isClose || allVoted ? (
          <div className="mb-3 px-3 py-2 rounded-2xl text-xs font-black text-center"
            style={{
              background: isClose ? '#FFF8E1' : allVoted && declineCount === 0 ? '#F0FAF2' : '#FFF0EC',
              color: isClose ? '#C8A020' : allVoted && declineCount === 0 ? '#3B8A5A' : '#F07050',
              border: `1px solid ${isClose ? '#FDE68A' : allVoted && declineCount === 0 ? '#BBF7D0' : '#F5C4B0'}`,
            }}>
            {isClose ? '🔥 あと1人！' : allVoted && declineCount === 0 ? '✅ 全員投票完了！' : '📊 全員投票済み'}
          </div>
        ) : null
      })()}

      {proposal.status === 'pending' && (
        <>
          <div className="flex gap-2 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl z-10"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(2px)' }}>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: '#F07050' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
            {(['accept', 'maybe', 'decline'] as const).map((v) => {
              const cfg = voteConfig[v]
              const isActive = myVote?.vote === v
              const isPopping = poppingVote === v
              return (
                <button
                  key={v}
                  onClick={() => handleVoteClick(v)}
                  disabled={loading}
                  className={`flex-1 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-[0.97] ${isPopping ? 'vote-pop' : ''}`}
                  style={isActive
                    ? { background: cfg.active.bg, color: cfg.active.color, border: `1.5px solid ${cfg.active.bg}`, boxShadow: `0 3px 12px ${cfg.active.bg}44` }
                    : { background: '#FAFAF8', color: '#6B5B4E', border: '1.5px solid #EDE8E3' }
                  }
                >
                  <span className="mr-1.5">{cfg.icon}</span>{cfg.label}
                </button>
              )
            })}
          </div>
          {onCancel && (proposal.createdBy.id === currentUserId || myRole === 'owner') && (
            <button
              onClick={() => onCancel(proposal.id)}
              disabled={loading}
              className="w-full mt-2 py-2 rounded-2xl text-xs font-black transition-all"
              style={{ color: '#C8B8A8', border: '1.5px solid #EDE8E3', background: '#FAFAF8' }}
            >
              提案をキャンセル
            </button>
          )}
        </>
      )}

      {proposal.votes.length > 0 && (
        <div className="mt-3 pt-3 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid #F5F0EB' }}>
          {proposal.votes.map((vote) => {
            const cfg = voteConfig[vote.vote as keyof typeof voteConfig]
            return (
              <span key={vote.id} className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: cfg?.active.bg + '22', color: cfg?.active.bg }}>
                {cfg?.icon} {vote.user.name}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
