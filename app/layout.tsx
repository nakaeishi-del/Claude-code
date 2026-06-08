import type { Metadata, Viewport } from 'next'
import './globals.css'
import ClientShell from '@/components/ClientShell'

export const metadata: Metadata = {
  title: '一気日記 - 声で書く、毎日の記録',
  description: '音声入力でかんたんに日記を書こう。AIが文章を整えて、毎日の思い出を残してくれる。',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '一気日記',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D0B1E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#0D0B1E] text-[#F0E6FF]">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
