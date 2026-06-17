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
          0% { transform: translateY(60px); opacity: 0; }
          60% { transform: translateY(-8px); opacity: 1; }
          80% { transform: translateY(4px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes textFadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .splash-bear {
          animation: bearSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .splash-text {
          animation: textFadeIn 0.4s ease-out 0.4s forwards;
          opacity: 0;
        }
      `}</style>

      <div className="splash-bear">
        <BearMascot size={100} mood="celebrate" animate={true} animationType="float" />
      </div>

      <div className="splash-text" style={{ textAlign: 'center', marginTop: '16px' }}>
        <p
          style={{
            color: '#F07050',
            fontWeight: 900,
            fontSize: '1.5rem',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          tomomeet
        </p>
        <p
          style={{
            color: '#9B8B7E',
            fontSize: '0.875rem',
            marginTop: '6px',
          }}
        >
          友達との予定を、かんたんに。
        </p>
      </div>
    </div>
  )
}
