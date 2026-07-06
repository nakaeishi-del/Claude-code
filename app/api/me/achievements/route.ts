import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface Stats {
  groupCount: number
  proposalCount: number
  voteCount: number
  acceptVoteCount: number
  confirmedCount: number
  likeCount: number
}

interface AchievementDef {
  id: string
  icon: string
  label: string
  desc: string
  condition: (s: Stats) => boolean
}

const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_group', icon: '🎊', label: 'グループ結成！', desc: 'はじめてグループを作った', condition: (s) => s.groupCount >= 1 },
  { id: 'socialite', icon: '👥', label: 'ソーシャライト', desc: '3つのグループに参加', condition: (s) => s.groupCount >= 3 },
  { id: 'first_proposal', icon: '✨', label: 'プランナー', desc: 'はじめて提案した', condition: (s) => s.proposalCount >= 1 },
  { id: 'super_planner', icon: '🗓️', label: 'スーパープランナー', desc: '10回提案した', condition: (s) => s.proposalCount >= 10 },
  { id: 'first_vote', icon: '🗳️', label: 'みんなで決める', desc: 'はじめて投票した', condition: (s) => s.voteCount >= 1 },
  { id: 'yes_person', icon: '⭕', label: 'ポジティブ参加', desc: '10回参加票を入れた', condition: (s) => s.acceptVoteCount >= 10 },
  { id: 'first_meetup', icon: '🍽️', label: 'はじめての飲み会！', desc: 'はじめて予定が確定した', condition: (s) => s.confirmedCount >= 1 },
  { id: 'regular', icon: '🔥', label: 'レギュラー', desc: '5回の予定が確定した', condition: (s) => s.confirmedCount >= 5 },
  { id: 'event_lover', icon: '🎉', label: 'イベント好き', desc: 'イベントを5つお気に入り', condition: (s) => s.likeCount >= 5 },
]

export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  if (!userId) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const [
    groupCount,
    proposalCount,
    voteCount,
    acceptVoteCount,
    confirmedCount,
    likeCount,
  ] = await Promise.all([
    prisma.groupMember.count({ where: { userId } }),
    prisma.meetingProposal.count({ where: { createdById: userId } }),
    prisma.meetingVote.count({ where: { userId } }),
    prisma.meetingVote.count({ where: { userId, vote: 'accept' } }),
    prisma.meetingProposal.count({
      where: {
        status: 'confirmed',
        group: {
          members: {
            some: { userId },
          },
        },
      },
    }),
    prisma.eventLike.count({ where: { userId } }),
  ])

  const stats: Stats = { groupCount, proposalCount, voteCount, acceptVoteCount, confirmedCount, likeCount }

  const achievements = ACHIEVEMENTS.map(({ id, icon, label, desc, condition }) => ({
    id,
    icon,
    label,
    desc,
    unlocked: condition(stats),
  }))

  return NextResponse.json({ achievements })
}
