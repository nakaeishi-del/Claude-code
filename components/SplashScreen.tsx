'use client'

import { useEffect, useState } from 'react'
import BearMascot from './BearMascot'

const SPLASH_KEY = 'tomomeet_splash_seen'

const PARTICLES = [
  { emoji: '✨', x: -48, y: -36, delay: 0.5, size: 18 },
  { emoji: '🎉', x: 52, y: -28, delay: 0.65, size: 16 },
  { emoji: '💫', x: -54, y: 28, delay: 0.75, size: 15 },
  { emoji: '⭐', x: 50, y: 36, delay: 0.6, size: 14 },
  { emoji: '✨', x: 4, y: -58, delay: 0.8, size: 13 },
  { emoji: '💕', x: -30, y: 58, delay: 0.7, size: 14 },
  { emoji: '🌟', x: 34, y: 56, delay: 0.85, size: 13 },
]

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const [phase, setPhase] = useState<'wave' | 'celebrate'>('wave')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = sessionStorage.getItem(SPLASH_KEY)
    if (seen) return

    sessionStorage.setItem(SPLASH_KEY, '1')
    setVisible(true)

    // Phase 2: switch to celebrate after 700ms
    const phaseTimer = setTimeout(() => setPhase('celebrate'), 700)

    // Start fade-out after 2s display
    const fadeTimer = setTimeout(() => setFadingOut(true), 2000)

    // Unmount after fade-out completes
    const removeTimer = setTimeout(() => setVisible(false), 2450)

    return () => {
      clearTimeout(phaseTimer)
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: '#FFFDF9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? 'opacity 0.45s ease-out' : undefined,
      }}
    >
      <style>{`
        @keyframes bearSlideIn {
          0%   { transform: translateY(60px) scale(0.8); opacity: 0; }
          60%  { transform: translateY(-10px) scale(1.05); opacity: 1; }
          80%  { transform: translateY(4px) scale(0.98); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes textFadeIn {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-7px); opacity: 1; }
        }
        @keyframes ringPulse {
          0%   { transform: scale(0.88); opacity: 0.3; }
          50%  { transform: scale(1.1); opacity: 0.1; }
          100% { transform: scale(0.88); opacity: 0.3; }
        }
        @keyframes particlePop {
          0%   { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
          60%  { opacity: 1; }
          100% { transform: translate(var(--px), var(--py)) scale(1) rotate(var(--pr)); opacity: 0.9; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-6px) rotate(8deg); }
        }
        .splash-bear  { animation: bearSlideIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .splash-text  { animation: textFadeIn 0.45s ease-out 0.45s forwards; opacity: 0; }
        .splash-sub   { animation: textFadeIn 0.4s ease-out 0.6s forwards; opacity: 0; }
        .splash-dots  { animation: textFadeIn 0.4s ease-out 0.8s forwards; opacity: 0; }
        .dot1 { animation: dotBounce 1.2s ease-in-out 0.95s infinite; }
        .dot2 { animation: dotBounce 1.2s ease-in-out 1.1s infinite; }
        .dot3 { animation: dotBounce 1.2s ease-in-out 1.25s infinite; }
        .ring { animation: ringPulse 2s ease-in-out infinite; }
        .particle {
          position: absolute;
          animation: particlePop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                     particleFloat 2s ease-in-out calc(var(--pd) + 0.55s) infinite;
          animation-delay: var(--pd);
          opacity: 0;
        }
        @keyframes bgGlow {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.9; }
        }
      `}</style>

      {/* Soft background glow */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240,112,80,0.12) 0%, transparent 70%)',
        animation: 'bgGlow 2.5s ease-in-out infinite',
      }} />

      {/* Bear with ring + particles */}
      <div className="splash-bear" style={{ position: 'relative', display: 'inline-block' }}>
        {/* Pulsing ring */}
        <div className="ring" style={{
          position: 'absolute',
          inset: '-20px',
          borderRadius: '50%',
          border: '2.5px solid #F07050',
        }} />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <span key={i} className="particle" style={{
            left: '50%',
            top: '50%',
            fontSize: `${p.size}px`,
            ['--px' as string]: `${p.x}px`,
            ['--py' as string]: `${p.y}px`,
            ['--pr' as string]: `${(i % 2 === 0 ? 1 : -1) * (10 + i * 5)}deg`,
            ['--pd' as string]: `${p.delay}s`,
            marginLeft: '-0.5em',
            marginTop: '-0.5em',
          }}>
            {p.emoji}
          </span>
        ))}

        <BearMascot size={108} mood={phase} animate={true} animationType="float" />
      </div>

      <div className="splash-text" style={{ textAlign: 'center', marginTop: '22px' }}>
        <p style={{ color: '#F07050', fontWeight: 900, fontSize: '1.9rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
          tomomeet
        </p>
      </div>
      <div className="splash-sub" style={{ textAlign: 'center', marginTop: '6px' }}>
        <p style={{ color: '#9B8B7E', fontSize: '0.875rem', fontWeight: 700 }}>
          友達との予定を、かんたんに。
        </p>
      </div>

      <div className="splash-dots" style={{ display: 'flex', gap: '6px', marginTop: '32px' }}>
        <span className="dot1" style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#F07050', opacity: 0.4 }} />
        <span className="dot2" style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#F07050', opacity: 0.4 }} />
        <span className="dot3" style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#F07050', opacity: 0.4 }} />
      </div>
    </div>
  )
}
