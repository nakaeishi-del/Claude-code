'use client'

import BottomNav from './BottomNav'
import SplashScreen from './SplashScreen'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashScreen />
      {children}
      <BottomNav />
    </>
  )
}
