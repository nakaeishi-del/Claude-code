'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface GroupInfo {
  id: string
  name: string
  description?: string | null
  memberCount: number
}

export default function JoinGroupPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.groupId as string

  const [group, setGroup] = useState<GroupInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
    async function load() {
      const [meRes, groupRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/groups/${groupId}`),
      ])

      if (meRes.ok) setIsLoggedIn(true)

      if (groupRes.ok) {
        const data = await groupRes.json()
        setGroup({
          id: data.group.id,
          name: data.group.name,
          description: data.group.description,
          memberCount: data.group.members.length,
        })
        if (meRes.ok) {
          const meData = await meRes.json()
          const alreadyIn = data.group.members.some(
            (m: { user: { id: string } }) => m.user.id === meData.user.id
          )
          if (alreadyIn) {
            setIsMember(true)
            router.replace(`/groups/${groupId}`)
            return
          }
        }
      } else {
        setError('グループが見つかりません')
      }

      setLoading(false)
    }
    load()
  }, [groupId, router])

  async function handleJoin() {
    setJoining(true)
    setError('')
    const res = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      router.push(`/groups/${groupId}`)
    } else {
      setError(data.error || 'エラーが発生しました')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6DB8A4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4">👋</div>
        {error ? (
          <>
            <h1 className="text-lg font-bold text-gray-800 mb-2">エラー</h1>
            <p className="text-sm text-red-500">{error}</p>
          </>
        ) : group ? (
          <>
            <h1 className="text-lg font-bold text-gray-800 mb-1">グループへの招待</h1>
            <p className="text-2xl font-bold text-[#6DB8A4] my-4">{group.name}</p>
            {group.description && (
              <p className="text-sm text-gray-500 mb-4">{group.description}</p>
            )}
            <p className="text-xs text-gray-400 mb-6">現在 {group.memberCount}人 / 最大4人</p>

            {!isLoggedIn ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">参加するにはログインが必要です</p>
                <Link
                  href={`/login?redirect=/join/${groupId}`}
                  className="block w-full py-3 bg-[#6DB8A4] text-white rounded-xl text-sm font-semibold hover:bg-[#3ba89e] transition-colors"
                >
                  ログインして参加
                </Link>
                <Link
                  href={`/register?redirect=/join/${groupId}`}
                  className="block w-full py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  新規登録して参加
                </Link>
              </div>
            ) : (
              <>
                {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full py-3 bg-[#6DB8A4] text-white rounded-xl text-sm font-semibold hover:bg-[#3ba89e] disabled:opacity-60 transition-colors"
                >
                  {joining ? '参加中...' : 'グループに参加する'}
                </button>
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
