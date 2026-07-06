'use client'

import { useToast } from '@/components/Toast'

interface ShareCardProps {
  date: string        // "2024-03-15"
  time: string        // "19:00"
  restaurant: string  // restaurant name
  area: string        // area name
  genre: string       // restaurant genre
  members: string[]   // member names
  cost: string        // estimated cost string
}

const AVATAR_COLORS = [
  '#F07050', '#7AC8A0', '#F0C050', '#9B7FD0', '#5BAFD0', '#D07A9B',
]

function getGenreEmoji(genre: string): string {
  const lower = genre.toLowerCase()
  if (lower.includes('音楽') || lower.includes('music') || lower.includes('ライブ') || lower.includes('カラオケ')) return '🎵'
  if (lower.includes('アート') || lower.includes('art') || lower.includes('美術') || lower.includes('ギャラリー')) return '🎨'
  if (lower.includes('スポーツ') || lower.includes('sport') || lower.includes('サッカー') || lower.includes('野球')) return '⚽'
  if (lower.includes('カフェ') || lower.includes('cafe') || lower.includes('coffee') || lower.includes('コーヒー')) return '☕'
  if (lower.includes('居酒屋') || lower.includes('バー') || lower.includes('bar') || lower.includes('飲み')) return '🍺'
  if (lower.includes('ラーメン') || lower.includes('麺')) return '🍜'
  if (lower.includes('焼肉') || lower.includes('肉') || lower.includes('bbq')) return '🥩'
  if (lower.includes('寿司') || lower.includes('魚') || lower.includes('海鮮')) return '🍱'
  if (lower.includes('イタリア') || lower.includes('ピザ') || lower.includes('パスタ')) return '🍝'
  return '🍽️'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const m = d.getMonth() + 1
  const day = d.getDate()
  const w = weekdays[d.getDay()]
  return `${m}月${day}日（${w}）`
}

export default function ShareCard({ date, time, restaurant, area, genre, members, cost }: ShareCardProps) {
  const { showToast } = useToast()
  const emoji = getGenreEmoji(genre)
  const dateLabel = formatDate(date)

  const shareText = `${emoji} ${restaurant}（${area}）で飲み会が確定したよ！\n📅 ${date} ${time}〜\n👥 ${members.join('・')}\ntomomeet で計画したよ → https://tomomeet.vercel.app`
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`

  function copyText() {
    navigator.clipboard.writeText(shareText).then(() => {
      showToast('コピーしました！', 'success')
    }).catch(() => {
      showToast('コピーに失敗しました', 'error')
    })
  }

  // Show up to 4 avatars, then "+N" overflow
  const MAX_VISIBLE = 4
  const visibleMembers = members.slice(0, MAX_VISIBLE)
  const overflowCount = members.length - MAX_VISIBLE

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* ── Card ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '375 / 200',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #F07050 0%, #FF8C6B 50%, #FFB08C 100%)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(240,112,80,0.35)',
        fontFamily: '"M PLUS Rounded 1c", "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 20px 16px',
        boxSizing: 'border-box',
      }}>

        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-28px', right: '-28px',
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-36px', left: '-20px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)', pointerEvents: 'none',
        }} />

        {/* Top row: logo + badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <span style={{
            color: 'rgba(255,255,255,0.90)',
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '0.06em',
          }}>
            tomomeet
          </span>

          {/* 確定！ pill badge */}
          <span style={{
            background: 'rgba(255,255,255,0.95)',
            color: '#F07050',
            fontSize: '11px',
            fontWeight: 900,
            padding: '3px 10px',
            borderRadius: '100px',
            letterSpacing: '0.02em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          }}>
            🎉 確定！
          </span>
        </div>

        {/* Middle: emoji + restaurant info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
          {/* Big emoji */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', flexShrink: 0,
            backdropFilter: 'blur(4px)',
          }}>
            {emoji}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '17px',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}>
              {restaurant}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.82)',
              fontSize: '12px',
              fontWeight: 700,
              marginTop: '3px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {area} · {genre}
            </div>
          </div>
        </div>

        {/* Bottom row: date/time/cost + avatars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          {/* Date, time, cost */}
          <div>
            <div style={{
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '14px',
              lineHeight: 1.3,
              textShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}>
              📅 {dateLabel} {time}〜
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 700,
              fontSize: '12px',
              marginTop: '2px',
            }}>
              💰 {cost}
            </div>
          </div>

          {/* Member avatars */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {visibleMembers.map((name, i) => (
              <div key={i} style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                border: '2px solid rgba(255,255,255,0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 900, color: '#fff',
                marginLeft: i === 0 ? 0 : '-8px',
                zIndex: visibleMembers.length - i,
                position: 'relative',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                flexShrink: 0,
              }}>
                {name.charAt(0)}
              </div>
            ))}
            {overflowCount > 0 && (
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.30)',
                border: '2px solid rgba(255,255,255,0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 900, color: '#fff',
                marginLeft: '-8px',
                position: 'relative',
                zIndex: 0,
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                flexShrink: 0,
              }}>
                +{overflowCount}
              </div>
            )}
            {members.length > 0 && (
              <span style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '11px',
                fontWeight: 700,
                marginLeft: '6px',
              }}>
                {members.length}人
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Share buttons ── */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '11px 0',
            borderRadius: '16px',
            background: '#06C755',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 900,
            textDecoration: 'none',
            fontFamily: '"M PLUS Rounded 1c", "Helvetica Neue", Arial, sans-serif',
            boxShadow: '0 2px 8px rgba(6,199,85,0.30)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.627.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          LINE でシェア
        </a>
        <button
          onClick={copyText}
          style={{
            padding: '11px 18px',
            borderRadius: '16px',
            border: '1.5px solid #EDE8E3',
            background: '#FAFAF8',
            color: '#9B8B7E',
            fontSize: '13px',
            fontWeight: 900,
            cursor: 'pointer',
            fontFamily: '"M PLUS Rounded 1c", "Helvetica Neue", Arial, sans-serif',
          }}
        >
          コピー
        </button>
      </div>
    </div>
  )
}
