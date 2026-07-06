'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import BearMascot from '@/components/BearMascot'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center"
      style={{ background: '#FFFDF9' }}>
      <BearMascot size={100} mood="sad" animate animationType="float" />

      <h1 className="text-2xl font-black mt-6 mb-2" style={{ color: '#2D1B0E' }}>
        エラーが発生しました
      </h1>
      <p className="text-sm font-bold mb-8 max-w-xs" style={{ color: '#9B8B7E' }}>
        予期しないエラーが発生しました。もう一度試してみてください。
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="px-6 py-3.5 rounded-2xl text-white text-sm font-black transition-all active:scale-95"
          style={{ background: '#F07050', boxShadow: '0 4px 14px rgba(240,112,80,0.28)' }}>
          もう一度試す
        </button>
        <Link href="/dashboard"
          className="px-6 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95"
          style={{ border: '1.5px solid #EDE8E3', color: '#9B8B7E', background: 'white' }}>
          ホームへ戻る
        </Link>
      </div>
    </div>
  )
}
