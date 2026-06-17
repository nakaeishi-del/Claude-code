'use client'

import { useEffect, useState } from 'react'

const COLORS = ['#F07050', '#7AC8A0', '#F0C050', '#A87FD0', '#6B8FD4', '#E06090', '#4ADE80']
const COUNT = 24

interface Piece {
  id: number
  color: string
  left: number
  delay: number
  duration: number
  size: number
  shape: 'circle' | 'square' | 'triangle'
}

function generatePieces(): Piece[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    left: 5 + Math.random() * 90,
    delay: Math.random() * 0.5,
    duration: 0.9 + Math.random() * 0.8,
    size: 6 + Math.random() * 8,
    shape: (['circle', 'square', 'triangle'] as const)[i % 3],
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
      {pieces.map((p) => (
        <div
          key={p.id}
          style={p.shape === 'triangle' ? {
            position: 'absolute',
            top: '-20px',
            left: `${p.left}%`,
            width: 0,
            height: 0,
            borderLeft: `${p.size / 2}px solid transparent`,
            borderRight: `${p.size / 2}px solid transparent`,
            borderBottom: `${p.size}px solid ${p.color}`,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s both`,
          } : {
            position: 'absolute',
            top: '-20px',
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s both`,
          }}
        />
      ))}
    </div>
  )
}
