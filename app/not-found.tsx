import Link from 'next/link'
import BearMascot from '@/components/BearMascot'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center"
      style={{ background: '#FFFDF9' }}>
      <BearMascot size={100} mood="sad" animate animationType="float" />

      <h1 className="text-6xl font-black mt-6 mb-2" style={{ color: '#F07050', letterSpacing: '-2px' }}>
        404
      </h1>
      <h2 className="text-xl font-black mb-2" style={{ color: '#2D1B0E' }}>
        ページが見つかりません
      </h2>
      <p className="text-sm font-bold mb-8" style={{ color: '#9B8B7E' }}>
        お探しのページは存在しないか、移動した可能性があります
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/dashboard"
          className="px-6 py-3.5 rounded-2xl text-white text-sm font-black transition-all active:scale-95"
          style={{ background: '#F07050', boxShadow: '0 4px 14px rgba(240,112,80,0.28)' }}>
          ホームへ戻る
        </Link>
        <Link href="/events"
          className="px-6 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95"
          style={{ border: '1.5px solid #EDE8E3', color: '#9B8B7E', background: 'white' }}>
          イベントを見る
        </Link>
      </div>
    </div>
  )
}
