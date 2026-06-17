'use client'

import { useEffect, useState } from 'react'
import BearMascot from './BearMascot'

const SPLASH_KEY = 'tomomeet_splash_seen'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    // Only show once per browser session
    if (typeof window === 'undefined') return
    const seen = sessionStorage.getItem(SPLASH_KEY)
    if (seen) return

    sessionStorage.setItem(SPLASH_KEY, '1')
    setVisible(true)

    // Start fade-out after 1.8s total display (1.4s solid + 0.4s fade)
    const fadeTimer = setTimeout(() => {
      setFadingOut(true)
    }, 1400)

    // Unmount after fade-out completes
    const removeTimer = setTimeout(() => {
      setVisible(false)
    }, 1800)

    return () => {
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
        transition: fadingOut ? 'opacity 0.4s ease-out' : undefined,
      }}
    >
      <style>{`
        @keyframes bearSlideIn {
          0%   { transform: translateY(60px); opacity: 0; }
          60%  { transform: translateY(-8px); opacity: 1; }
          80%  { transform: translateY(4px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes textFadeIn {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes ringPulse {
          0%   { transform: scale(0.88); opacity: 0.35; }
          50%  { transform: scale(1.08); opacity: 0.12; }
          100% { transform: scale(0.88); opacity: 0.35; }
        }
        .splash-bear  { animation: bearSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .splash-text  { animation: textFadeIn 0.4s ease-out 0.4s forwards; opacity: 0; }
        .splash-dots  { animation: textFadeIn 0.4s ease-out 0.7s forwards; opacity: 0; }
        .dot1 { animation: dotBounce 1.2s ease-in-out 0.85s infinite; }
        .dot2 { animation: dotBounce 1.2s ease-in-out 1.0s infinite; }
        .dot3 { animation: dotBounce 1.2s ease-in-out 1.15s infinite; }
        .ring { animation: ringPulse 1.8s ease-in-out infinite; }
      `}</style>

      <div className="splash-bear" style={{ position: 'relative' }}>
        <div className="ring" style={{
          position: 'absolute',
          inset: '-18px',
          borderRadius: '50%',
          border: '3px solid #F07050',
        }} />
        <BearMascot size={100} mood="celebrate" animate={true} animationType="float" />
      </div>

      <div className="splash-text" style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ color: '#F07050', fontWeight: 900, fontSize: '1.75rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
          tomomeet
        </p>
        <p style={{ color: '#9B8B7E', fontSize: '0.875rem', marginTop: '6px', fontWeight: 700 }}>
          友達との予定を、かんたんに。
        </p>
      </div>

      <div className="splash-dots" style={{ display: 'flex', gap: '6px', marginTop: '28px' }}>
        <span className="dot1" style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#F07050', opacity: 0.4 }} />
        <span className="dot2" style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#F07050', opacity: 0.4 }} />
        <span className="dot3" style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#F07050', opacity: 0.4 }} />
      </div>
    </div>
  )
}
