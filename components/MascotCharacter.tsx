'use client'

import { useEffect, useState } from 'react'
import { MascotState } from '@/lib/types'

interface Props {
  state: MascotState
}

const expressions = {
  idle: {
    leftEye: '●', rightEye: '●',
    mouth: 'ω',
    blush: true,
    extra: null,
  },
  recording: {
    leftEye: '◉', rightEye: '◉',
    mouth: 'O',
    blush: false,
    extra: '🎵',
  },
  thinking: {
    leftEye: '–', rightEye: '–',
    mouth: '...',
    blush: false,
    extra: '💭',
  },
  happy: {
    leftEye: '^', rightEye: '^',
    mouth: '▽',
    blush: true,
    extra: '✦',
  },
  sleeping: {
    leftEye: '-', rightEye: '-',
    mouth: 'zzz',
    blush: true,
    extra: '💤',
  },
}

export default function MascotCharacter({ state }: Props) {
  const [blink, setBlink] = useState(false)
  const expr = expressions[state]

  useEffect(() => {
    if (state !== 'idle') return
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 150)
    }, 3500)
    return () => clearInterval(interval)
  }, [state])

  const animClass =
    state === 'recording'
      ? 'animate-bounce'
      : state === 'thinking'
      ? 'animate-spin-slow'
      : state === 'happy'
      ? 'animate-bounce'
      : 'animate-float'

  return (
    <div className="flex flex-col items-center select-none py-2">
      <div className={`relative ${animClass}`} style={{ animationDuration: state === 'recording' ? '0.6s' : undefined }}>
        {/* Sparkle decorations */}
        <span className="absolute -top-2 -left-4 text-yellow-300 animate-sparkle text-sm">✦</span>
        <span className="absolute -top-1 -right-5 text-pink-300 animate-sparkle text-xs" style={{ animationDelay: '0.5s' }}>★</span>
        <span className="absolute bottom-0 -left-6 text-purple-300 animate-sparkle text-xs" style={{ animationDelay: '1s' }}>✦</span>

        {/* Main body */}
        <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bodyGrad" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FF8FE0" />
              <stop offset="100%" stopColor="#FF4ECD" />
            </radialGradient>
            <radialGradient id="earGrad" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FF9FE8" />
              <stop offset="100%" stopColor="#E840B8" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ears */}
          <ellipse cx="25" cy="38" rx="13" ry="15" fill="url(#earGrad)" />
          <ellipse cx="85" cy="38" rx="13" ry="15" fill="url(#earGrad)" />
          <ellipse cx="25" cy="40" rx="8" ry="10" fill="#FFB3E6" />
          <ellipse cx="85" cy="40" rx="8" ry="10" fill="#FFB3E6" />

          {/* Body */}
          <ellipse cx="55" cy="68" rx="38" ry="34" fill="url(#bodyGrad)" />

          {/* Crown / antenna */}
          <line x1="55" y1="32" x2="55" y2="18" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          <circle cx="55" cy="14" r="6" fill="#FFD700" filter="url(#glow)" />
          <text x="55" y="18" fontSize="7" textAnchor="middle" fill="white" fontWeight="bold">★</text>

          {/* Eyes */}
          <g style={{ transform: blink ? 'scaleY(0.1)' : 'scaleY(1)', transformOrigin: '42px 62px', transition: 'transform 0.1s' }}>
            <circle cx="42" cy="62" r="11" fill="white" />
            <circle cx="42" cy="63" r="7" fill="#2D1B69" />
            <circle cx="44" cy="59" r="3" fill="white" />
          </g>
          <g style={{ transform: blink ? 'scaleY(0.1)' : 'scaleY(1)', transformOrigin: '68px 62px', transition: 'transform 0.1s' }}>
            <circle cx="68" cy="62" r="11" fill="white" />
            <circle cx="68" cy="63" r="7" fill="#2D1B69" />
            <circle cx="70" cy="59" r="3" fill="white" />
          </g>

          {/* Happy state: closed eyes */}
          {state === 'happy' && (
            <>
              <path d="M 33 62 Q 42 55 51 62" stroke="#2D1B69" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 59 62 Q 68 55 77 62" stroke="#2D1B69" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* Thinking state: squinting */}
          {state === 'thinking' && (
            <>
              <path d="M 33 62 L 51 62" stroke="#2D1B69" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 59 62 L 77 62" stroke="#2D1B69" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {/* Blush */}
          {expr.blush && (
            <>
              <ellipse cx="32" cy="74" rx="8" ry="5" fill="#FF9FBF" opacity="0.55" />
              <ellipse cx="78" cy="74" rx="8" ry="5" fill="#FF9FBF" opacity="0.55" />
            </>
          )}

          {/* Mouth */}
          {state === 'happy' ? (
            <path d="M 45 80 Q 55 90 65 80" stroke="#2D1B69" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : state === 'recording' ? (
            <ellipse cx="55" cy="82" rx="7" ry="6" fill="#2D1B69" />
          ) : state === 'thinking' ? (
            <path d="M 48 82 Q 55 80 62 82" stroke="#2D1B69" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : state === 'sleeping' ? (
            <path d="M 48 82 Q 55 86 62 82" stroke="#2D1B69" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M 45 80 Q 55 87 65 80" stroke="#2D1B69" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}

          {/* Little paws */}
          <ellipse cx="20" cy="80" rx="9" ry="7" fill="#FF4ECD" opacity="0.7" />
          <ellipse cx="90" cy="80" rx="9" ry="7" fill="#FF4ECD" opacity="0.7" />
        </svg>

        {/* Extra floating icon */}
        {expr.extra && (
          <span
            className="absolute -top-4 right-0 text-2xl animate-float"
            style={{ animationDelay: '0.3s' }}
          >
            {expr.extra}
          </span>
        )}
      </div>

      {/* Name tag */}
      <div className="mt-1 px-3 py-0.5 rounded-full text-xs font-bold text-white/70"
        style={{ background: 'rgba(255,78,205,0.15)', border: '1px solid rgba(255,78,205,0.3)' }}>
        イッキーちゃん
      </div>
    </div>
  )
}
