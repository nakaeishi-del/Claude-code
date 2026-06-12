'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface NavbarProps {
  userName?: string
}

export default function Navbar({ userName }: NavbarProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <nav className="bg-white sticky top-0 z-50" style={{ borderBottom: '1.5px solid #EDE8E3' }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-black text-lg tracking-tight" style={{ color: '#F07050', letterSpacing: '-0.5px' }}>
            lifematch
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-bold transition-colors" style={{ color: '#9B8B7E' }}>
              ホーム
            </Link>
            <Link href="/settings" className="text-sm font-bold transition-colors" style={{ color: '#9B8B7E' }}>
              設定
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm font-bold hidden sm:block" style={{ color: '#C8B8A8' }}>
              {userName}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="hidden sm:block text-sm font-bold px-3 py-1.5 rounded-xl transition-colors"
            style={{ color: '#C8B8A8' }}
          >
            ログアウト
          </button>
          {userName && (
            <div className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black"
              style={{ background: '#F07050' }}>
              {userName.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
