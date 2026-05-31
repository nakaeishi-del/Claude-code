import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientShell from '@/components/ClientShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TomoMeet - 友達との時間を大切に',
  description: '大切な友達との時間を、自動で作ろう。グループの空き時間を自動でマッチングする友人グループ向けスケジューラー',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TomoMeet',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF6B6B',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-[#FAFAFA] text-gray-800`}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
