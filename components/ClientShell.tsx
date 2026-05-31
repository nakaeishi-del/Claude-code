'use client'

import BottomNav from './BottomNav'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}
