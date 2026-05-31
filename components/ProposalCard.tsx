'use client'

import { clsx } from 'clsx'

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
  onVote: (proposalId: string, vote: 'accept' | 'decline' | 'maybe') => void
  loading?: boolean
}

const statusColors: Record<string, string> = {
  pending: 'text-orange-600 bg-orange-50 border-orange-200',
  confirmed: 'text-green-600 bg-green-50 border-green-200',
  cancelled: 'text-gray-500 bg-gray-50 border-gray-200',
}

const statusLabels: Record<string, string> = {
  pending: '投票中',
  confirmed: '確定',
  cancelled: 'キャンセル',
}

const voteLabels: Record<string, string> = {
  accept: '参加する',
  decline: '欠席',
  maybe: '未定',
}

const voteIcons: Record<string, string> = {
  accept: '○',
  decline: '✕',
  maybe: '△',
}

export default function ProposalCard({
  proposal,
  currentUserId,
  memberCount,
  onVote,
  loading,
}: ProposalCardProps) {
  const myVote = proposal.votes.find((v) => v.userId === currentUserId)
  const acceptCount = proposal.votes.filter((v) => v.vote === 'accept').length
  const declineCount = proposal.votes.filter((v) => v.vote === 'decline').length
  const maybeCount = proposal.votes.filter((v) => v.vote === 'maybe').length

  const dateObj = new Date(proposal.proposedDate + 'T00:00:00')
  const dateLabel = dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <div className={clsx(
      'bg-white rounded-xl border-2 p-5',
      proposal.status === 'confirmed'
        ? 'border-green-200'
        : proposal.status === 'cancelled'
        ? 'border-gray-200'
        : 'border-[#FF6B6B]/30'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={clsx(
            'inline-flex text-xs px-2.5 py-1 rounded-full font-semibold border mb-2',
            statusColors[proposal.status]
          )}>
            {statusLabels[proposal.status]}
          </span>
          <div className="text-base font-bold text-gray-800">{dateLabel}</div>
          <div className="text-sm text-gray-500">{proposal.proposedTime}〜</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">{proposal.createdBy.name}が提案</div>
        </div>
      </div>

      {/* Restaurant info */}
      <div className="bg-[#FAFAFA] rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#FF6B6B]/10 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
            🍽️
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 text-sm truncate">{proposal.restaurantName}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {proposal.restaurantArea} · {proposal.restaurantGenre}
            </div>
            <div className="text-xs text-[#FF6B6B] font-medium mt-1">{proposal.estimatedCost}</div>
          </div>
        </div>
      </div>

      {/* Vote counts */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 text-center py-2 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">{acceptCount}</div>
          <div className="text-xs text-green-600">参加</div>
        </div>
        <div className="flex-1 text-center py-2 bg-yellow-50 rounded-lg">
          <div className="text-lg font-bold text-yellow-600">{maybeCount}</div>
          <div className="text-xs text-yellow-600">未定</div>
        </div>
        <div className="flex-1 text-center py-2 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-500">{declineCount}</div>
          <div className="text-xs text-red-500">欠席</div>
        </div>
        <div className="flex-1 text-center py-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-400">{memberCount - proposal.votes.length}</div>
          <div className="text-xs text-gray-400">未投票</div>
        </div>
      </div>

      {/* Vote buttons */}
      {proposal.status === 'pending' && (
        <div className="flex gap-2">
          {(['accept', 'maybe', 'decline'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onVote(proposal.id, v)}
              disabled={loading}
              className={clsx(
                'flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all border-2 active:scale-95',
                myVote?.vote === v
                  ? v === 'accept'
                    ? 'bg-green-500 text-white border-green-500'
                    : v === 'decline'
                    ? 'bg-red-400 text-white border-red-400'
                    : 'bg-yellow-400 text-white border-yellow-400'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="mr-1">{voteIcons[v]}</span>
              {voteLabels[v]}
            </button>
          ))}
        </div>
      )}

      {/* Voter list */}
      {proposal.votes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {proposal.votes.map((vote) => (
              <span
                key={vote.id}
                className={clsx(
                  'text-xs px-2 py-0.5 rounded-full',
                  vote.vote === 'accept'
                    ? 'bg-green-50 text-green-600'
                    : vote.vote === 'decline'
                    ? 'bg-red-50 text-red-500'
                    : 'bg-yellow-50 text-yellow-600'
                )}
              >
                {voteIcons[vote.vote]} {vote.user.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
