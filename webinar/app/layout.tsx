import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import SpaRedirectHandler from '@/components/SpaRedirectHandler'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ウェビナー運用ナビ',
  description: 'ヨンデミー保護者向けウェビナー運用を半自動化するナビゲーションツール',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.className} bg-gray-50 text-gray-800 min-h-screen`}>
        <SpaRedirectHandler />
        <Nav />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
