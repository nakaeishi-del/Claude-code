'use client'

import { useEffect, useState } from 'react'

const COLORS = ['#F07050', '#7AC8A0', '#F0C050', '#A87FD0', '#6B8FD4', '#E06090', '#4ADE80', '#FFB347', '#FF69B4']
const COUNT = 36

interface Piece {
  id: number
  color: string
  left: number
  delay: number
  duration: number
  size: number
  shape: 'circle' | 'square' | 'triangle'
  drift: number
}

function generatePieces(): Piece[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    left: 2 + Math.random() * 96,
    delay: Math.random() * 0.8,
    duration: 1.2 + Math.random() * 1.2,
    size: 5 + Math.random() * 10,
    shape: (['circle', 'square', 'triangle'] as const)[i % 3],
    drift: (Math.random() - 0.5) * 80,
  }))
}

interface Props {
  trigger?: boolean
  duration?: number
}

export default function Confetti({ trigger = true, duration = 2500 }: Props) {
  const [pieces, setPieces] = useState<Piece[]>([])
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!trigger) return
    setPieces(generatePieces())
    setActive(true)
    const t = setTimeout(() => { setActive(false); setPieces([]) }, duration)
    return () => clearTimeout(t)
  }, [trigger, duration])

  if (!active || pieces.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[150] overflow-hidden">
      <style>{`
        @keyframes confettiFallDrift {
          0%   { opacity: 1; transform: translateY(-10px) translateX(0) rotate(0deg) scale(1); }
          100% { opacity: 0; transform: translateY(110vh) translateX(var(--drift)) rotate(720deg) scale(0.4); }
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={p.shape === 'triangle' ? {
            position: 'absolute',
            top: '-20px',
            left: `${p.left}%`,
            width: 0,
            height: 0,
            '--drift': `${p.drift}px`,
            borderLeft: `${p.size / 2}px solid transparent`,
            borderRight: `${p.size / 2}px solid transparent`,
            borderBottom: `${p.size}px solid ${p.color}`,
            animation: `confettiFallDrift ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s both`,
          } as React.CSSProperties : {
            position: 'absolute',
            top: '-20px',
            left: `${p.left}%`,
            '--drift': `${p.drift}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '3px',
            animation: `confettiFallDrift ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s both`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
