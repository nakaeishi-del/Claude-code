'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AvailabilityGrid from '@/components/AvailabilityGrid'
import BearMascot from '@/components/BearMascot'

interface User {
  id: string
  name: string
  email: string
  priceRange: string
  googleCalendarConnected: boolean
}

interface AvailabilityEntry {
  dayOfWeek?: number | null
  date?: string | null
  type: string
}

const priceRangeOptions = [
  { value: 'budget', label: 'リーズナブル', sub: '〜¥3,000' },
  { value: 'mid',    label: 'スタンダード', sub: '¥3,000〜¥8,000' },
  { value: 'high',   label: 'プレミアム',   sub: '¥8,000〜' },
]

export default function SettingsPage() {
  return (
<<<<<<< Updated upstream
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><div className="text-gray-400 text-sm">読み込み中...</div></div>}>
=======
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDF9' }}>
        <BearMascot size={70} mood="sleep" animate />
      </div>
    }>
>>>>>>> Stashed changes
      <SettingsContent />
    </Suspense>
  )
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-black" style={{ color: '#9B8B7E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</h2>
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid #EDE8E3' }}>
      {children}
    </div>
  )
}

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const googleConnected = searchParams.get('connected') === 'google'
  const googleError = searchParams.get('error')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [priceRange, setPriceRange] = useState('mid')
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([])

  const fetchData = useCallback(async () => {
    const [meRes, availRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/availability')])
    if (!meRes.ok) { router.push('/'); return }
    const meData = await meRes.json()
    const availData = await availRes.json()
    setUser(meData.user)
    setPriceRange(meData.user.priceRange)
    setAvailability(availData.availability || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleGoogleDisconnect() {
    setDisconnecting(true)
    await fetch('/api/auth/google/disconnect', { method: 'POST' })
    setDisconnecting(false)
    await fetchData()
  }

  async function handleSave() {
    setSaving(true)
    setSaveSuccess(false)
    await fetch('/api/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availability }),
    })
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  if (loading) {
    return (
<<<<<<< Updated upstream
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-gray-400 text-sm">読み込み中...</div>
=======
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDF9' }}>
        <div className="flex flex-col items-center gap-3">
          <BearMascot size={80} mood="sleep" animate />
          <p className="text-sm font-bold" style={{ color: '#9B8B7E' }}>よみこみ中...</p>
        </div>
>>>>>>> Stashed changes
      </div>
    )
  }

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen bg-[#FAFAFA]">
=======
    <div className="min-h-screen" style={{ background: '#FFFDF9' }}>
>>>>>>> Stashed changes
      <Navbar userName={user?.name} />

      <main className="max-w-2xl mx-auto px-4 pt-7 pb-28 sm:pb-10 space-y-5">
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: '#2D1B0E' }}>設定</h1>
          <p className="mt-1 text-sm" style={{ color: '#9B8B7E' }}>プロフィールと空き時間を設定しよう</p>
        </div>

<<<<<<< Updated upstream
        {/* Profile section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#FF6B6B] rounded-full inline-block"></span>
            プロフィール
          </h2>
          <div className="space-y-3">
=======
        {/* Profile */}
        <Card>
          <SLabel>プロフィール</SLabel>
          <div className="mt-4 space-y-3">
>>>>>>> Stashed changes
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#9B8B7E' }}>お名前</label>
              <div className="px-4 py-3 rounded-2xl text-sm font-bold" style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3', color: '#2D1B0E' }}>
                {user?.name}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#9B8B7E' }}>メールアドレス</label>
              <div className="px-4 py-3 rounded-2xl text-sm font-bold" style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3', color: '#2D1B0E' }}>
                {user?.email}
              </div>
            </div>
          </div>
        </Card>

        {/* Google Calendar */}
        <Card>
          <SLabel>Googleカレンダー連携</SLabel>
          <p className="text-xs mt-1 mb-4 font-bold" style={{ color: '#C8B8A8' }}>
            連携するとカレンダーの予定を自動読み込みして、空き時間を正確に判定できます
          </p>
          {user?.googleCalendarConnected ? (
            <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#EEF3FC', border: '1.5px solid #C5D9FA' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: '#4285F4' }}>G</div>
                <div>
                  <div className="text-sm font-black" style={{ color: '#2D1B0E' }}>連携済み</div>
                  <div className="text-xs font-bold" style={{ color: '#9B8B7E' }}>予定を自動取得しています</div>
                </div>
              </div>
              <button onClick={handleGoogleDisconnect} disabled={disconnecting}
                className="text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                style={{ color: '#F07050', border: '1.5px solid #F5C4B0', background: '#FFF0EC' }}>
                {disconnecting ? '解除中...' : '連携を解除'}
              </button>
            </div>
          ) : (
            <a href="/api/auth/google"
              className="flex items-center justify-center gap-3 w-full py-3 rounded-2xl font-bold text-sm transition-all"
              style={{ border: '1.5px solid #EDE8E3', background: '#FAFAF8', color: '#6B5B4E' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: '#4285F4' }}>G</div>
              Googleカレンダーを連携する
            </a>
          )}
        </Card>

<<<<<<< Updated upstream
        {/* Price range section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-base font-bold text-gray-700 mb-1 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#FF6B6B] rounded-full inline-block"></span>
            価格帯設定
          </h2>
          <p className="text-xs text-gray-500 mb-4">グループ提案時のレストラン価格帯の基準になります</p>
          <div className="grid grid-cols-3 gap-3">
            {priceRangeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriceRange(opt.value)}
                className={clsx(
                  'p-4 rounded-xl border-2 text-center transition-all',
                  priceRange === opt.value
                    ? 'border-[#FF6B6B] bg-[#FF6B6B]/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className={clsx('text-sm font-semibold', priceRange === opt.value ? 'text-[#FF6B6B]' : 'text-gray-700')}>
                  {opt.label}
                </div>
                <div className="text-xs text-gray-400 mt-1">{opt.sub}</div>
=======
        {/* Price range */}
        <Card>
          <SLabel>価格帯</SLabel>
          <p className="text-xs mt-1 mb-4 font-bold" style={{ color: '#C8B8A8' }}>グループ提案時のレストランの基準になります</p>
          <div className="grid grid-cols-3 gap-2">
            {priceRangeOptions.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setPriceRange(opt.value)}
                className="p-3 rounded-2xl text-center transition-all"
                style={priceRange === opt.value
                  ? { border: '2px solid #F07050', background: '#FFF5F2' }
                  : { border: '1.5px solid #EDE8E3', background: '#FAFAF8' }}>
                <p className="text-xs font-black" style={{ color: priceRange === opt.value ? '#F07050' : '#6B5B4E' }}>{opt.label}</p>
                <p className="text-xs mt-0.5 font-bold" style={{ color: '#B8A898' }}>{opt.sub}</p>
>>>>>>> Stashed changes
              </button>
            ))}
          </div>
        </Card>

<<<<<<< Updated upstream
        {/* Availability section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-bold text-gray-700 mb-1 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#4ECDC4] rounded-full inline-block"></span>
            空き時間設定
          </h2>
          <p className="text-xs text-gray-500 mb-4">
=======
        {/* Availability */}
        <Card>
          <SLabel>空き時間</SLabel>
          <p className="text-xs mt-1 mb-4 font-bold" style={{ color: '#C8B8A8' }}>
>>>>>>> Stashed changes
            週間の定期的な空き状況を設定してください。自動スケジューリングに使用されます。
          </p>
          <AvailabilityGrid availability={availability} onChange={setAvailability} />
        </Card>

<<<<<<< Updated upstream
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={clsx(
            'w-full py-3.5 rounded-xl font-bold text-white transition-all',
            saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF6B6B] hover:bg-[#e55a5a] shadow-md'
          )}
        >
=======
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-2xl text-white font-black text-sm disabled:opacity-50"
          style={{ background: '#F07050', boxShadow: '0 4px 14px rgba(240,112,80,0.28)' }}>
>>>>>>> Stashed changes
          {saving ? '保存中...' : '設定を保存'}
        </button>

        {saveSuccess && (
          <div className="p-3 rounded-2xl text-sm text-center font-bold" style={{ background: '#F0FAF2', border: '1.5px solid #D4EDD8', color: '#3B8A5A' }}>
            ✓ 設定を保存しました
          </div>
        )}
        {googleConnected && (
          <div className="p-3 rounded-2xl text-sm text-center font-bold" style={{ background: '#EEF3FC', border: '1.5px solid #C5D9FA', color: '#4285F4' }}>
            Googleカレンダーを連携しました
          </div>
        )}
        {googleError && (
          <div className="p-3 rounded-2xl text-sm text-center font-bold" style={{ background: '#FFF0EC', border: '1.5px solid #F5C4B0', color: '#F07050' }}>
            {googleError === 'google_denied' ? 'Googleカレンダーの連携がキャンセルされました' : 'Googleカレンダーの連携に失敗しました'}
          </div>
        )}

        <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/' }}
          className="sm:hidden w-full py-3.5 rounded-2xl font-black text-sm"
          style={{ border: '1.5px solid #F5C4B0', color: '#F07050', background: '#FFF0EC' }}>
          ログアウト
        </button>
      </main>
    </div>
  )
}
