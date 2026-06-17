'use client'

import BottomNav from './BottomNav'
import SplashScreen from './SplashScreen'
import { ToastProvider } from './Toast'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SplashScreen />
      {children}
      <BottomNav />
    </ToastProvider>
  )
}
