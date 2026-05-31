import Link from 'next/link'
import { clsx } from 'clsx'

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

const priceLabels: Record<string, string> = {
  budget: 'リーズナブル',
  mid: 'スタンダード',
  high: 'プレミアム',
}

const priceColors: Record<string, string> = {
  budget: 'text-green-600 bg-green-50',
  mid: 'text-blue-600 bg-blue-50',
  high: 'text-purple-600 bg-purple-50',
}

function getInitials(name: string) {
  return name.charAt(0)
}

const avatarColors = [
  'bg-[#FF6B6B]',
  'bg-[#4ECDC4]',
  'bg-yellow-400',
  'bg-purple-400',
]

export default function GroupCard({ group }: GroupCardProps) {
  const members = group.members || []
  const proposal = group.latestProposal

  const proposalStatus = proposal?.status
  const statusLabel =
    proposalStatus === 'confirmed'
      ? '確定済み'
      : proposalStatus === 'pending'
      ? '投票中'
      : null

  const statusColor =
    proposalStatus === 'confirmed'
      ? 'text-green-600 bg-green-50'
      : 'text-orange-600 bg-orange-50'

  return (
    <Link href={`/groups/${group.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-800 text-base">{group.name}</h3>
            {group.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{group.description}</p>
            )}
          </div>
          <span
            className={clsx(
              'text-xs px-2 py-1 rounded-full font-medium',
              priceColors[group.priceRange] || 'text-gray-600 bg-gray-50'
            )}
          >
            {priceLabels[group.priceRange] || group.priceRange}
          </span>
        </div>

        {/* Member avatars */}
        <div className="flex items-center gap-1.5 mb-3">
          {members.slice(0, 4).map((m, i) => (
            <div
              key={m.user.id}
              className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold',
                avatarColors[i % avatarColors.length]
              )}
              title={m.user.name}
            >
              {getInitials(m.user.name)}
            </div>
          ))}
          <span className="text-xs text-gray-500 ml-1">{members.length}人</span>
        </div>

        {/* Latest proposal */}
        {proposal ? (
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="text-xs text-gray-600 truncate flex-1 mr-2">
              {proposal.proposedDate} · {proposal.restaurantName}
            </div>
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', statusColor)}>
              {statusLabel}
            </span>
          </div>
        ) : (
          <div className="pt-3 border-t border-gray-50">
            <p className="text-xs text-gray-400">提案はまだありません</p>
          </div>
        )}
      </div>
    </Link>
  )
}
