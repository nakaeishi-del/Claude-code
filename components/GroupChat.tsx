'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Avatar from './Avatar'

interface Message {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; avatarUrl?: string | null }
}

interface Props {
  groupId: string
  currentUserId: string
}

const avatarPalette = ['#F07050', '#7AC8A0', '#F0B050', '#A87FD0', '#6B8FD4', '#E06090']
const QUICK_EMOJIS = ['👍', '🎉', '😆', '🙏', '❤️', '🍽️', '📅']

function getColor(userId: string) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) | 0
  return avatarPalette[Math.abs(hash) % avatarPalette.length]
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return '昨日'
  if (diffDays < 7) return `${diffDays}日前`
  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export default function GroupChat({ groupId, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)

  const lastIdRef = useRef<string | null>(null)
  const isAtBottomRef = useRef(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async (initial = false) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`)
      if (!res.ok) return
      const d = await res.json()
      const incoming: Message[] = d.messages || []
      if (initial) {
        setMessages(incoming)
        setLoading(false)
        lastIdRef.current = incoming[incoming.length - 1]?.id ?? null
      } else {
        setMessages((prev) => {
          const lastKnown = lastIdRef.current
          const newOnes = lastKnown
            ? incoming.filter((m) => m.id > lastKnown)
            : incoming
          if (newOnes.length === 0) return prev
          lastIdRef.current = incoming[incoming.length - 1]?.id ?? lastKnown
          setNewIds((ids) => {
            const next = new Set(ids)
            newOnes.forEach((m) => next.add(m.id))
            return next
          })
          setTimeout(() => setNewIds(new Set()), 800)
          return [...prev, ...newOnes]
        })
      }
    } catch { /* ignore */ }
  }, [groupId])

  useEffect(() => {
    fetchMessages(true)
    const interval = setInterval(() => fetchMessages(false), 5000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }

  async function handleSend(e?: React.FormEvent, quickText?: string) {
    e?.preventDefault()
    const content = (quickText ?? input).trim()
    if (!content || sending) return
    setSending(true)
    if (!quickText) setInput('')
    const res = await fetch(`/api/groups/${groupId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessages((prev) => [...prev, data.message])
      isAtBottomRef.current = true
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      <style>{`
        @keyframes msgSlideRight {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes msgSlideLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes emojiPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.3); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .msg-new-me   { animation: msgSlideRight 0.25s ease-out; }
        .msg-new-them { animation: msgSlideLeft  0.25s ease-out; }
        .emoji-pop-active { animation: emojiPop 0.3s ease-out; }
      `}</style>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto space-y-3 max-h-72 pr-1">
        {loading ? (
          <div className="text-center py-6 text-xs font-bold" style={{ color: '#C8B8A8' }}>よみこみ中...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-2xl mb-2">💬</div>
            <p className="text-sm font-bold" style={{ color: '#2D1B0E' }}>最初のメッセージを送ってみよう！</p>
            <p className="text-xs mt-1 font-bold" style={{ color: '#C8B8A8' }}>グループメンバーだけが見られます</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user.id === currentUserId
            const color = getColor(msg.user.id)
            const isNew = newIds.has(msg.id)
            return (
              <div key={msg.id}
                className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${isNew ? (isMe ? 'msg-new-me' : 'msg-new-them') : ''}`}>
                {!isMe && (
                  <div className="mt-0.5">
                    <Avatar name={msg.user.name} avatarUrl={msg.user.avatarUrl} size={28} color={color} />
                  </div>
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {!isMe && (
                    <span className="text-[10px] font-black mb-0.5" style={{ color: '#9B8B7E' }}>{msg.user.name}</span>
                  )}
                  <div className="px-3 py-2 rounded-2xl text-sm font-bold leading-relaxed"
                    style={isMe
                      ? { background: '#F07050', color: 'white', borderBottomRightRadius: '6px' }
                      : { background: '#FAFAF8', color: '#2D1B0E', border: '1.5px solid #EDE8E3', borderBottomLeftRadius: '6px' }
                    }>
                    {msg.content}
                  </div>
                  <span className="text-[10px] font-bold mt-0.5" style={{ color: '#C8B8A8' }}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick emoji bar */}
      <div className="flex gap-2 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleSend(undefined, emoji)}
            disabled={sending}
            className="flex-shrink-0 w-9 h-9 rounded-2xl text-lg flex items-center justify-center transition-all active:scale-90"
            style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3' }}>
            {emoji}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          maxLength={500}
          className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-bold outline-none transition-all"
          style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3', color: '#2D1B0E' }}
          onFocus={(e) => { e.target.style.borderColor = '#F07050' }}
          onBlur={(e) => { e.target.style.borderColor = '#EDE8E3' }}
        />
        <button type="submit" disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white disabled:opacity-40 transition-all active:scale-90"
          style={{ background: '#F07050' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}
