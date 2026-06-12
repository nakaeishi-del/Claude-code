'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/dashboard',
    label: 'ホーム',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/events',
    label: 'イベント',
    soon: true,
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: '設定',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Only show on authenticated pages
  if (pathname === '/') return null

  return (
<<<<<<< Updated upstream
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg sm:hidden z-50 safe-bottom">
=======
    <nav className="fixed bottom-0 left-0 right-0 bg-white sm:hidden z-50"
      style={{ borderTop: '1.5px solid #EDE8E3', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
>>>>>>> Stashed changes
      <div className="flex">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href + '/'))
          return (
<<<<<<< Updated upstream
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 pt-3 gap-1 transition-colors min-h-[60px] relative ${
                active ? 'text-[#FF6B6B]' : 'text-gray-400'
              }`}
            >
              {tab.soon && (
                <span className="absolute top-1.5 right-1/2 translate-x-4 text-[8px] bg-[#4ECDC4] text-white px-1 rounded-full font-bold leading-tight">
                  NEW
                </span>
              )}
              {tab.icon(active)}
              <span className={`text-[10px] font-semibold ${active ? 'text-[#FF6B6B]' : 'text-gray-400'}`}>
                {tab.label}
              </span>
=======
            <Link key={tab.href} href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-2 pt-3 gap-1 min-h-[60px] relative transition-colors"
              style={{ color: active ? '#F07050' : '#C8B8A8' }}>
              {tab.href === '/dashboard' && pendingVotes > 0 && (
                <span className="absolute top-1.5 right-1/2 translate-x-4 min-w-[16px] h-4 px-1 text-white text-[9px] font-black rounded-full flex items-center justify-center"
                  style={{ background: '#F07050' }}>
                  {pendingVotes > 9 ? '9+' : pendingVotes}
                </span>
              )}
              {tab.icon(active)}
              <span className="text-[10px] font-black">{tab.label}</span>
>>>>>>> Stashed changes
            </Link>
          )
        })}
      </div>
      {/* iOS safe area spacer */}
      <div className="h-safe-bottom" />
    </nav>
  )
}
