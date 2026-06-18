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
  const [unreadCount, setUnreadCount] = useState(0)
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
          if (!isAtBottomRef.current) {
            setUnreadCount((c) => c + newOnes.length)
          }
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
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    isAtBottomRef.current = atBottom
    if (atBottom) setUnreadCount(0)
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setUnreadCount(0)
    isAtBottomRef.current = true
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
    <div className="flex flex-col relative" style={{ minHeight: 0 }}>
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
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                {i % 2 !== 0 && <div className="w-7 h-7 rounded-full shimmer flex-shrink-0 mt-0.5" />}
                <div className="flex flex-col gap-1" style={{ maxWidth: '65%' }}>
                  {i % 2 !== 0 && <div className="h-2.5 w-12 rounded-full shimmer" />}
                  <div className="h-9 rounded-2xl shimmer" style={{ width: `${60 + i * 20}px` }} />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="text-3xl mb-2" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}>💬</div>
            <p className="text-sm font-black" style={{ color: '#2D1B0E' }}>最初のメッセージを送ってみよう！</p>
            <p className="text-xs mt-1 font-bold" style={{ color: '#C8B8A8' }}>グループメンバーだけが見られます</p>
            <div className="flex gap-2 mt-4">
              {['👋', '🎉', '楽しみ！'].map((q) => (
                <button key={q} onClick={() => handleSend(undefined, q)}
                  className="text-xs font-black px-3 py-1.5 rounded-2xl transition-all active:scale-95"
                  style={{ background: '#FFF0EC', color: '#F07050', border: '1.5px solid #F5C4B0' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.user.id === currentUserId
            const color = getColor(msg.user.id)
            const isNew = newIds.has(msg.id)
            const prevMsg = messages[i - 1]
            const nextMsg = messages[i + 1]
            const isSameAsPrev = prevMsg && prevMsg.user.id === msg.user.id
            const isSameAsNext = nextMsg && nextMsg.user.id === msg.user.id
            const isLastInGroup = !isSameAsNext

            // Adjust bubble corner based on grouping
            const myBubbleRadius = isSameAsNext
              ? { borderRadius: '18px 18px 6px 18px' }
              : isSameAsPrev
              ? { borderRadius: '18px 6px 6px 18px' }
              : { borderRadius: '18px 18px 6px 18px' }
            const theirBubbleRadius = isSameAsNext
              ? { borderRadius: '18px 18px 18px 6px' }
              : isSameAsPrev
              ? { borderRadius: '6px 18px 18px 6px' }
              : { borderRadius: '18px 18px 18px 6px' }

            return (
              <div key={msg.id}
                className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${isNew ? (isMe ? 'msg-new-me' : 'msg-new-them') : ''}`}
                style={{ marginBottom: isSameAsNext ? '2px' : '8px' }}>
                {!isMe && (
                  <div className="mt-auto flex-shrink-0" style={{ width: 28, opacity: isLastInGroup ? 1 : 0 }}>
                    {isLastInGroup && <Avatar name={msg.user.name} avatarUrl={msg.user.avatarUrl} size={28} color={color} />}
                  </div>
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {!isMe && !isSameAsPrev && (
                    <span className="text-[10px] font-black mb-1" style={{ color: '#9B8B7E' }}>{msg.user.name}</span>
                  )}
                  <div className="px-3 py-2 text-sm font-bold leading-relaxed"
                    style={isMe
                      ? { background: '#F07050', color: 'white', ...myBubbleRadius }
                      : { background: '#FAFAF8', color: '#2D1B0E', border: '1.5px solid #EDE8E3', ...theirBubbleRadius }
                    }>
                    {msg.content}
                  </div>
                  {isLastInGroup && (
                    <span className="text-[10px] font-bold mt-0.5 px-1" style={{ color: '#C8B8A8' }}>
                      {formatTime(msg.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Unread messages indicator */}
      {unreadCount > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-white z-10 transition-all"
          style={{ background: '#F07050', boxShadow: '0 3px 12px rgba(240,112,80,0.40)' }}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
          新着{unreadCount}件
        </button>
      )}

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
