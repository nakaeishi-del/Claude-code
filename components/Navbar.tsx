'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Avatar from './Avatar'

interface NavbarProps {
  userName?: string
  avatarUrl?: string | null
}

export default function Navbar({ userName, avatarUrl }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [pendingVotes, setPendingVotes] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 4) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch('/api/me/pending-votes')
      .then((r) => r.json())
      .then((d) => setPendingVotes(d.count || 0))
      .catch(() => {})
  }, [pathname])

  const NAV_LINKS = [
    { href: '/dashboard', label: 'ホーム', badge: pendingVotes },
    { href: '/events', label: 'イベント', badge: 0 },
    { href: '/settings', label: '設定', badge: 0 },
  ]

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <nav className="bg-white sticky top-0 z-50 transition-shadow duration-200"
      style={{
        borderBottom: '1.5px solid #EDE8E3',
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
      }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-black text-lg tracking-tight flex items-center gap-1.5" style={{ color: '#F07050', letterSpacing: '-0.5px' }}>
            tomomeet
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, badge }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link key={href} href={href}
                  className="relative text-sm font-bold px-3 py-1.5 rounded-xl transition-all"
                  style={isActive
                    ? { color: '#F07050', background: '#FFF0EC' }
                    : { color: '#9B8B7E' }}>
                  {label}
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-white text-[9px] font-black rounded-full flex items-center justify-center gentle-pulse"
                      style={{ background: '#F07050' }}>
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <Link href="/settings" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-gray-50"
              style={{ color: '#6B5B4E' }}>
              <Avatar name={userName} avatarUrl={avatarUrl} size={24} />
              <span className="text-sm font-bold">{userName}</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="hidden sm:block text-sm font-bold px-3 py-1.5 rounded-xl transition-all hover:bg-gray-50"
            style={{ color: '#C8B8A8' }}
          >
            ログアウト
          </button>
          {userName && (
            <Link href="/settings" className="sm:hidden">
              <Avatar name={userName} avatarUrl={avatarUrl} size={32} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
