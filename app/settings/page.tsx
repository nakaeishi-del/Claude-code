'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AvailabilityGrid from '@/components/AvailabilityGrid'
import { clsx } from 'clsx'

interface User {
  id: string
  name: string
  email: string
  priceRange: string
}

interface AvailabilityEntry {
  dayOfWeek?: number | null
  date?: string | null
  type: string
}

const priceRangeOptions = [
  { value: 'budget', label: 'リーズナブル', sub: '〜¥3,000' },
  { value: 'mid', label: 'スタンダード', sub: '¥3,000〜¥8,000' },
  { value: 'high', label: 'プレミアム', sub: '¥8,000〜' },
]

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [priceRange, setPriceRange] = useState('mid')
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([])

  const fetchData = useCallback(async () => {
    const [meRes, availRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/availability'),
    ])

    if (!meRes.ok) {
      router.push('/')
      return
    }

    const meData = await meRes.json()
    const availData = await availRes.json()

    setUser(meData.user)
    setPriceRange(meData.user.priceRange)
    setAvailability(availData.availability || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleSave() {
    setSaving(true)
    setSaveSuccess(false)

    await Promise.all([
      fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      }),
    ])

    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar userName={user?.name} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">設定</h1>
          <p className="text-sm text-gray-500 mt-1">プロフィールと空き時間を設定しましょう</p>
        </div>

        {/* Profile section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#FF6B6B] rounded-full inline-block"></span>
            プロフィール
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">お名前</label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700">{user?.name}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">メールアドレス</label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700">{user?.email}</div>
            </div>
          </div>
        </div>

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
              </button>
            ))}
          </div>
        </div>

        {/* Availability section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-bold text-gray-700 mb-1 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#4ECDC4] rounded-full inline-block"></span>
            空き時間設定
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            週間の定期的な空き状況を設定してください。自動スケジューリングに使用されます。
          </p>
          <AvailabilityGrid
            availability={availability}
            onChange={setAvailability}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={clsx(
            'w-full py-3.5 rounded-xl font-bold text-white transition-all',
            saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF6B6B] hover:bg-[#e55a5a] shadow-md'
          )}
        >
          {saving ? '保存中...' : '設定を保存'}
        </button>

        {saveSuccess && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm text-center">
            設定を保存しました
          </div>
        )}
      </main>
    </div>
  )
}
