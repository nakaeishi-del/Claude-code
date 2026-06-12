import type { Metadata, Viewport } from 'next'
import { M_PLUS_Rounded_1c } from 'next/font/google'
import './globals.css'
import ClientShell from '@/components/ClientShell'

const mplus = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'lifematch - 友達との予定、ぜんぶおまかせ！',
  description: '友達との予定、ぜんぶおまかせ！グループの空き時間を自動でマッチング。',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'lifematch',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F07050',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={mplus.className} style={{ background: '#FFFDF9', color: '#2D1B0E' }}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
