'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Avatar from './Avatar'

interface NavbarProps {
  userName?: string
  avatarUrl?: string | null
}

const NAV_LINKS = [
  { href: '/dashboard', label: 'ホーム' },
  { href: '/events', label: 'イベント' },
  { href: '/settings', label: '設定' },
]

export default function Navbar({ userName, avatarUrl }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <nav className="bg-white sticky top-0 z-50" style={{ borderBottom: '1.5px solid #EDE8E3' }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-black text-lg tracking-tight" style={{ color: '#F07050', letterSpacing: '-0.5px' }}>
            tomomeet
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link key={href} href={href}
                  className="text-sm font-bold px-3 py-1.5 rounded-xl transition-colors"
                  style={isActive
                    ? { color: '#F07050', background: '#FFF0EC' }
                    : { color: '#9B8B7E' }}>
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <Link href="/settings" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors"
              style={{ color: '#C8B8A8' }}>
              <Avatar name={userName} avatarUrl={avatarUrl} size={24} />
              <span className="text-sm font-bold">{userName}</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="hidden sm:block text-sm font-bold px-3 py-1.5 rounded-xl transition-colors"
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
