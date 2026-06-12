'use client'

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

const statusStyles: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: '#F07050', bg: '#FFF0EC', label: '投票中' },
  confirmed: { color: '#5BAF7A', bg: '#F0FAF2', label: '確定' },
  cancelled: { color: '#C8B8A8', bg: '#F5F0EB', label: 'キャンセル' },
}

const voteConfig = {
  accept:  { label: '参加する', icon: '○', active: { bg: '#5BAF7A', color: '#fff' } },
  maybe:   { label: '未定',     icon: '△', active: { bg: '#F0C050', color: '#fff' } },
  decline: { label: '欠席',     icon: '✕', active: { bg: '#F07050', color: '#fff' } },
}

export default function ProposalCard({ proposal, currentUserId, memberCount, myRole, onVote, onCancel, loading }: ProposalCardProps) {
  const myVote = proposal.votes.find((v) => v.userId === currentUserId)
  const acceptCount = proposal.votes.filter((v) => v.vote === 'accept').length
  const declineCount = proposal.votes.filter((v) => v.vote === 'decline').length
  const maybeCount = proposal.votes.filter((v) => v.vote === 'maybe').length

  const dateObj = new Date(proposal.proposedDate + 'T00:00:00')
  const dateLabel = dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  const st = statusStyles[proposal.status] || statusStyles.cancelled
  const borderColor = proposal.status === 'confirmed' ? '#D4EDD8'
    : proposal.status === 'cancelled' ? '#EDE8E3'
    : '#F5C4B0'

  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: `1.5px solid ${borderColor}` }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="inline-flex text-[11px] px-2.5 py-1 rounded-full font-black mb-2"
            style={{ color: st.color, background: st.bg }}>
            {st.label}
          </span>
          <div className="text-base font-black" style={{ color: '#2D1B0E' }}>{dateLabel}</div>
          <div className="text-sm mt-0.5" style={{ color: '#9B8B7E' }}>{proposal.proposedTime}〜</div>
        </div>
        <div className="text-xs font-bold" style={{ color: '#C8B8A8' }}>{proposal.createdBy.name}が提案</div>
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
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
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

      {proposal.status === 'pending' && (
        <>
          <div className="flex gap-2">
            {(['accept', 'maybe', 'decline'] as const).map((v) => {
              const cfg = voteConfig[v]
              const isActive = myVote?.vote === v
              return (
                <button
                  key={v}
                  onClick={() => onVote(proposal.id, v)}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95"
                  style={isActive
                    ? { background: cfg.active.bg, color: cfg.active.color, border: `1.5px solid ${cfg.active.bg}` }
                    : { background: '#FAFAF8', color: '#6B5B4E', border: '1.5px solid #EDE8E3', opacity: loading ? 0.5 : 1 }
                  }
                >
                  <span className="mr-1">{cfg.icon}</span>{cfg.label}
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
