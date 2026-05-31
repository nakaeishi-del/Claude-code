'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function JoinGroupPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.groupId as string

  const [group, setGroup] = useState<{ name: string; description?: string | null; memberCount: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [notLoggedIn, setNotLoggedIn] = useState(false)

  useEffect(() => {
    Promise.all([fetch('/api/auth/me'), fetch(`/api/groups/${groupId}`)]).then(
      async ([meRes, groupRes]) => {
        if (!meRes.ok) {
          setNotLoggedIn(true)
          setLoading(false)
          return
        }
        if (groupRes.ok) {
          const [meData, groupData] = await Promise.all([meRes.json(), groupRes.json()])
          const isMember = groupData.group.members.some(
            (m: { user: { id: string } }) => m.user.id === meData.user.id
          )
          if (isMember) {
            router.replace(`/groups/${groupId}`)
            return
          }
          setGroup({
            name: groupData.group.name,
            description: groupData.group.description,
            memberCount: groupData.group.members.length,
          })
        } else {
          setError('グループが見つかりません')
        }
        setLoading(false)
      }
    )
  }, [groupId, router])

  async function handleJoin() {
    setJoining(true)
    const res = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' })
    const data = await res.json()
    if (res.ok || data.alreadyMember) {
      router.push(`/groups/${groupId}`)
    } else {
      setError(data.error || '参加に失敗しました')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4ECDC4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full text-center">
          <div className="text-4xl mb-4">👥</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">グループに招待されています</h1>
          <p className="text-sm text-gray-500 mb-6">参加するにはログインが必要です</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3.5 bg-[#FF6B6B] text-white rounded-xl font-bold mb-2"
          >
            ログインして参加
          </button>
          <button
            onClick={() => router.push('/register')}
            className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm"
          >
            新規登録して参加
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center text-3xl font-bold text-[#4ECDC4] mx-auto mb-4">
            {group?.name?.[0] || '?'}
          </div>
          <h1 className="text-xl font-bold text-gray-800">{group?.name}</h1>
          {group?.description && (
            <p className="text-sm text-gray-500 mt-1">{group.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">現在 {group?.memberCount}人のメンバー</p>
        </div>

        {error ? (
          <div className="text-center">
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button onClick={() => router.push('/dashboard')} className="text-sm text-[#4ECDC4]">
              ダッシュボードへ戻る
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-xl font-bold disabled:opacity-60"
            >
              {joining ? '参加中...' : 'グループに参加する'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 text-gray-400 text-sm hover:text-gray-600"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
