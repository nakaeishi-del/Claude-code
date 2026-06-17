import type { Metadata, Viewport } from 'next'
import { M_PLUS_Rounded_1c } from 'next/font/google'
import './globals.css'
import ClientShell from '@/components/ClientShell'

const mplus = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'tomomeet - 友達との予定を、かんたんに',
  description: '友達グループの空き時間を自動でマッチング。お店の提案から投票まで一括管理。',
  manifest: '/manifest.json',
  keywords: ['友達', '予定', 'グループ', '食事', 'マッチング'],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'tomomeet - 友達との予定を、かんたんに',
    description: '友達グループの空き時間を自動でマッチング。お店の提案から投票まで一括管理。',
    siteName: 'tomomeet',
    locale: 'ja_JP',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'tomomeet',
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
