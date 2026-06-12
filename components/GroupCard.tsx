import Link from 'next/link'

interface Member {
  id: string
  name: string
  email: string
}

interface Proposal {
  id: string
  status: string
  proposedDate: string
  restaurantName: string
  votes: { vote: string }[]
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
  }
}

const priceLabels: Record<string, { label: string; color: string; bg: string }> = {
  budget: { label: 'リーズナブル', color: '#5BAF7A', bg: '#F0FAF2' },
  mid:    { label: 'スタンダード', color: '#6B8FD4', bg: '#EEF3FC' },
  high:   { label: 'プレミアム',   color: '#A87FD0', bg: '#F5EEFA' },
}

const avatarPalette = ['#F07050', '#7AC8A0', '#F0B050', '#A87FD0']

function getInitials(name: string) {
  return name.charAt(0)
}

<<<<<<< Updated upstream
const avatarColors = [
  'bg-[#FF6B6B]',
  'bg-[#4ECDC4]',
  'bg-yellow-400',
  'bg-purple-400',
]

=======
>>>>>>> Stashed changes
export default function GroupCard({ group }: GroupCardProps) {
  const members = group.members || []
  const proposal = group.latestProposal
  const price = priceLabels[group.priceRange] || { label: group.priceRange, color: '#9B8B7E', bg: '#F5F0EB' }

  const statusLabel = proposal?.status === 'confirmed' ? '確定済み' : proposal?.status === 'pending' ? '投票中' : null
  const statusStyle = proposal?.status === 'confirmed'
    ? { color: '#5BAF7A', background: '#F0FAF2' }
    : { color: '#F07050', background: '#FFF0EC' }

  return (
    <Link href={`/groups/${group.id}`}>
<<<<<<< Updated upstream
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
=======
      <div className="bg-white rounded-2xl p-5 transition-all hover:-translate-y-0.5 cursor-pointer"
        style={{ border: '1.5px solid #EDE8E3', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
>>>>>>> Stashed changes
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="font-black text-base truncate" style={{ color: '#2D1B0E' }}>{group.name}</h3>
            {group.description && (
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#9B8B7E' }}>{group.description}</p>
            )}
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0"
            style={{ color: price.color, background: price.bg }}>
            {price.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          {members.slice(0, 4).map((m, i) => (
            <div key={m.user.id}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black"
              style={{ background: avatarPalette[i % avatarPalette.length] }}
              title={m.user.name}>
              {getInitials(m.user.name)}
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

        {proposal ? (
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F5F0EB' }}>
            <div className="text-xs truncate flex-1 mr-2 font-bold" style={{ color: '#6B5B4E' }}>
              {proposal.proposedDate.slice(5).replace('-', '/')} · {proposal.restaurantName}
            </div>
            {statusLabel && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold flex-shrink-0" style={statusStyle}>
                {statusLabel}
              </span>
            )}
          </div>
        ) : (
          <div className="pt-3" style={{ borderTop: '1px solid #F5F0EB' }}>
            <p className="text-xs font-bold" style={{ color: '#C8B8A8' }}>提案はまだありません</p>
          </div>
        )}
      </div>
    </Link>
  )
}
