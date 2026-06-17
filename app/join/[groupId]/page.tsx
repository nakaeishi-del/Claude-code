'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import BearMascot from '@/components/BearMascot'

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
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function load() {
      const [meRes, groupRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/groups/${groupId}`),
      ])

      if (meRes.ok) {
        setIsLoggedIn(true)
        if (groupRes.ok) {
          const meData = await meRes.json()
          const groupData = await groupRes.json()
          const alreadyIn = groupData.group.members.some(
            (m: { user: { id: string } }) => m.user.id === meData.user.id
          )
          if (alreadyIn) {
            router.replace(`/groups/${groupId}`)
            return
          }
          setGroup({
            id: groupData.group.id,
            name: groupData.group.name,
            description: groupData.group.description,
            memberCount: groupData.group.members.length,
          })
        } else {
          setError('グループが見つかりません')
        }
      } else {
        if (groupRes.ok) {
          const groupData = await groupRes.json()
          setGroup({
            id: groupData.group.id,
            name: groupData.group.name,
            description: groupData.group.description,
            memberCount: groupData.group.members.length,
          })
        } else {
          setError('グループが見つかりません')
        }
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
      setJoined(true)
      setTimeout(() => router.push(`/groups/${groupId}`), 1800)
    } else {
      setError(data.error || 'エラーが発生しました')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFFDF9' }}>
        <div className="w-full max-w-sm">
          <div className="h-8 w-28 rounded-full shimmer mx-auto mb-8" />
          <div className="bg-white rounded-3xl p-8" style={{ border: '1.5px solid #EDE8E3' }}>
            <div className="w-20 h-20 rounded-full shimmer mx-auto mb-4" />
            <div className="h-5 w-3/4 rounded-full shimmer mx-auto mb-2" />
            <div className="h-3 w-1/2 rounded-full shimmer mx-auto mb-6" />
            <div className="h-12 rounded-2xl shimmer" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFFDF9' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-black text-2xl tracking-tight" style={{ color: '#F07050', letterSpacing: '-0.5px' }}>
            tomomeet
          </span>
        </div>

        <div className="bg-white rounded-3xl p-8 text-center page-enter" style={{ border: '1.5px solid #EDE8E3', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {joined ? (
            <>
              <BearMascot size={90} mood="celebrate" animate animationType="float" />
              <h1 className="text-xl font-black mt-4 mb-1" style={{ color: '#2D1B0E' }}>参加しました！🎉</h1>
              <p className="text-sm font-bold" style={{ color: '#9B8B7E' }}>グループページに移動します...</p>
            </>
          ) : error && !group ? (
            <>
              <BearMascot size={80} mood="sad" animate />
              <h1 className="text-lg font-black mt-4 mb-2" style={{ color: '#2D1B0E' }}>グループが見つかりません</h1>
              <p className="text-sm font-bold" style={{ color: '#9B8B7E' }}>{error}</p>
              <Link href="/dashboard"
                className="mt-6 inline-block px-6 py-3 rounded-2xl text-white text-sm font-black"
                style={{ background: '#F07050' }}>
                ホームへ戻る
              </Link>
            </>
          ) : group ? (
            <>
              <BearMascot size={80} mood="excited" animate animationType="bounce" />
              <div className="mt-4 mb-2">
                <p className="text-xs font-bold" style={{ color: '#9B8B7E' }}>グループへの招待</p>
                <h1 className="text-xl font-black mt-1" style={{ color: '#2D1B0E' }}>{group.name}</h1>
              </div>
              {group.description && (
                <p className="text-sm font-bold mb-3" style={{ color: '#9B8B7E' }}>{group.description}</p>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black mb-6"
                style={{ background: '#F0FAF2', color: '#3B8A5A', border: '1px solid #BBF7D0' }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                現在 {group.memberCount}人 / 最大8人
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-2xl text-sm font-bold" style={{ background: '#FFF0EC', color: '#C85030', border: '1px solid #F5C4B0' }}>
                  {error}
                </div>
              )}

              {!isLoggedIn ? (
                <div className="space-y-3">
                  <p className="text-sm font-bold mb-4" style={{ color: '#9B8B7E' }}>参加するにはログインが必要です</p>
                  <Link href={`/?redirect=/join/${groupId}`}
                    className="block w-full py-3.5 rounded-2xl text-white text-sm font-black"
                    style={{ background: '#F07050', boxShadow: '0 4px 14px rgba(240,112,80,0.28)' }}>
                    ログインして参加する
                  </Link>
                  <Link href={`/?redirect=/join/${groupId}`}
                    className="block w-full py-3.5 rounded-2xl text-sm font-black"
                    style={{ border: '1.5px solid #EDE8E3', color: '#6B5B4E' }}>
                    新規登録して参加する
                  </Link>
                </div>
              ) : (
                <button onClick={handleJoin} disabled={joining}
                  className="w-full py-3.5 rounded-2xl text-white text-sm font-black transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #F07050, #F09070)', boxShadow: '0 4px 16px rgba(240,112,80,0.30)' }}>
                  {joining ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      参加中...
                    </span>
                  ) : 'グループに参加する 🎉'}
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
