import Link from 'next/link'
import Avatar from './Avatar'

interface Member {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

interface Proposal {
  id: string
  status: string
  proposedDate: string
  restaurantName: string
  votes: { userId?: string }[]
}

interface GroupCardProps {
  group: {
    id: string
    name: string
    description?: string | null
    priceRange: string
    members: { user: Member }[]
    memberCount?: number
    latestProposal?: Proposal | null
    pendingVoteCount?: number
    lastMessage?: { content: string; user: { name: string }; createdAt: string } | null
  }
}

const priceLabels: Record<string, { label: string; color: string; bg: string }> = {
  budget: { label: 'リーズナブル', color: '#5BAF7A', bg: '#F0FAF2' },
  mid:    { label: 'スタンダード', color: '#6B8FD4', bg: '#EEF3FC' },
  high:   { label: 'プレミアム',   color: '#A87FD0', bg: '#F5EEFA' },
}

const avatarPalette = ['#F07050', '#7AC8A0', '#F0B050', '#A87FD0']

export default function GroupCard({ group }: GroupCardProps) {
  const members = group.members || []
  const proposal = group.latestProposal
  const price = priceLabels[group.priceRange] || { label: group.priceRange, color: '#9B8B7E', bg: '#F5F0EB' }
  const pendingVotes = group.pendingVoteCount || 0

  const statusLabel = proposal?.status === 'confirmed' ? '確定済み' : proposal?.status === 'pending' ? '投票中' : null
  const statusStyle = proposal?.status === 'confirmed'
    ? { color: '#5BAF7A', background: '#F0FAF2' }
    : { color: '#F07050', background: '#FFF0EC' }

  const isConfirmed = proposal?.status === 'confirmed'

  return (
    <Link href={`/groups/${group.id}`}>
      <div className="bg-white rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer relative group"
        style={{
          border: pendingVotes > 0 ? '1.5px solid #F5C4B0' : isConfirmed ? '1.5px solid #BBF7D0' : '1.5px solid #EDE8E3',
          boxShadow: pendingVotes > 0 ? '0 2px 16px rgba(240,112,80,0.12)' : isConfirmed ? '0 2px 16px rgba(91,175,122,0.10)' : '0 2px 12px rgba(0,0,0,0.04)',
        }}>

        {/* Top accent stripe */}
        {(pendingVotes > 0 || isConfirmed) && (
          <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full"
            style={{ background: pendingVotes > 0 ? '#F07050' : '#5BAF7A' }} />
        )}

        {/* Pending vote badge */}
        {pendingVotes > 0 && (
          <div className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full text-white text-[11px] font-black flex items-center justify-center"
            style={{ background: '#F07050', boxShadow: '0 2px 6px rgba(240,112,80,0.4)' }}>
            {pendingVotes}
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="font-black text-base truncate" style={{ color: '#2D1B0E' }}>{group.name}</h3>
            {group.description && (
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#9B8B7E' }}>{group.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"
              style={{ color: price.color, background: price.bg }}>
              {price.label}
            </span>
            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#C8B8A8' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          {members.slice(0, 4).map((m, i) => (
            <div key={m.user.id} title={m.user.name}>
              <Avatar name={m.user.name} avatarUrl={m.user.avatarUrl} size={28}
                color={avatarPalette[i % avatarPalette.length]} />
            </div>
          ))}
          {members.length > 4 && (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#F5F0EB', color: '#9B8B7E' }}>
              +{members.length - 4}
            </div>
          )}
          <span className="text-xs ml-1 font-bold" style={{ color: '#C8B8A8' }}>{members.length}人</span>
        </div>

        <div className="pt-3" style={{ borderTop: '1px solid #F5F0EB' }}>
          {pendingVotes > 0 && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: '#FFF0EC', color: '#F07050' }}>
                🗳️ あなたの投票を待っています
              </span>
            </div>
          )}
          {members.length === 1 && !proposal ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                style={{ background: '#EEF3FC', color: '#4285F4' }}>
                👥 友達を招待しよう！
              </span>
            </div>
          ) : proposal ? (
            <div className="flex items-center justify-between">
              <div className="text-xs truncate flex-1 mr-2 font-bold" style={{ color: '#6B5B4E' }}>
                {proposal.proposedDate.slice(5).replace('-', '/')} · {proposal.restaurantName}
              </div>
              {statusLabel && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold flex-shrink-0" style={statusStyle}>
                  {statusLabel}
                </span>
              )}
            </div>
          ) : group.lastMessage ? (
            <div className="text-xs font-bold truncate" style={{ color: '#9B8B7E' }}>
              💬 {group.lastMessage.user.name}: {group.lastMessage.content}
            </div>
          ) : (
            <p className="text-xs font-bold" style={{ color: '#C8B8A8' }}>提案はまだありません</p>
          )}
        </div>
      </div>
    </Link>
  )
}
