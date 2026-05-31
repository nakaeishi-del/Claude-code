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
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-[#FF6B6B] font-bold text-lg tracking-tight">
            TomoMeet
          </Link>
          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-[#FF6B6B] transition-colors font-medium"
            >
              ダッシュボード
            </Link>
            <Link
              href="/events"
              className="text-sm text-gray-600 hover:text-[#FF6B6B] transition-colors font-medium flex items-center gap-1"
            >
              イベント
              <span className="text-[10px] bg-[#4ECDC4] text-white px-1.5 py-0.5 rounded-full font-semibold">
                近日公開
              </span>
            </Link>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* User name — desktop only */}
          {userName && (
            <span className="text-sm text-gray-600 hidden sm:block mr-1">
              {userName} さん
            </span>
          )}
          {/* Settings — desktop only (mobile uses bottom nav) */}
          <Link
            href="/settings"
            className="hidden sm:flex p-2 text-gray-500 hover:text-[#FF6B6B] transition-colors"
            title="設定"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          {/* Logout — desktop only (mobile logs out from settings) */}
          <button
            onClick={handleLogout}
            className="hidden sm:block text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            ログアウト
          </button>
          {/* Mobile: show user initial avatar */}
          {userName && (
            <div className="sm:hidden w-8 h-8 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white text-sm font-bold">
              {userName.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
