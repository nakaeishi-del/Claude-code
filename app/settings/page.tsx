'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AvailabilityGrid from '@/components/AvailabilityGrid'
import BearMascot from '@/components/BearMascot'
import Avatar from '@/components/Avatar'

interface User {
  id: string
  name: string
  email: string
  priceRange: string
  avatarUrl?: string | null
  googleCalendarConnected: boolean
}

// Resize an image file to a square data URL (JPEG, ~200px) for compact storage.
function resizeImage(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('読み込みに失敗しました'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('画像を読み込めませんでした'))
      img.onload = () => {
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        const canvas = document.createElement('canvas')
        canvas.width = maxSize
        canvas.height = maxSize
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('canvas エラー')); return }
        ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDF9' }}>
        <BearMascot size={70} mood="sleep" animate />
      </div>
    }>
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
  const [editName, setEditName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState('')
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    const [meRes, availRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/availability')])
    if (!meRes.ok) { router.push('/'); return }
    const meData = await meRes.json()
    const availData = await availRes.json()
    setUser(meData.user)
    setPriceRange(meData.user.priceRange)
    setEditName(meData.user.name)
    setAvatarUrl(meData.user.avatarUrl ?? null)
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

  async function handlePickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    setAvatarError('')
    if (!file.type.startsWith('image/')) { setAvatarError('画像ファイルを選んでください'); return }
    try {
      const dataUrl = await resizeImage(file)
      setAvatarUrl(dataUrl)
    } catch {
      setAvatarError('画像の処理に失敗しました')
    }
  }

  function handleRemovePhoto() {
    setAvatarUrl(null)
    setAvatarError('')
  }

  async function handleSave() {
    setSaving(true)
    setSaveSuccess(false)
    await Promise.all([
      fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      }),
      fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, priceRange, avatarUrl }),
      }),
    ])
    await fetchData()
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDF9' }}>
        <div className="flex flex-col items-center gap-3">
          <BearMascot size={80} mood="sleep" animate />
          <p className="text-sm font-bold" style={{ color: '#9B8B7E' }}>よみこみ中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF9' }}>
      <Navbar userName={user?.name} avatarUrl={user?.avatarUrl} />

      <main className="max-w-2xl mx-auto px-4 pt-7 pb-28 sm:pb-10 space-y-5">
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: '#2D1B0E' }}>設定</h1>
          <p className="mt-1 text-sm" style={{ color: '#9B8B7E' }}>プロフィールと空き時間を設定しよう</p>
        </div>

        <Card>
          <SLabel>プロフィール</SLabel>

          {/* Avatar */}
          <div className="mt-4 flex items-center gap-4">
            <Avatar name={editName || 'U'} avatarUrl={avatarUrl} size={72} />
            <div className="flex-1">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePickPhoto} className="hidden" />
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-black px-4 py-2.5 rounded-2xl text-white"
                  style={{ background: '#F07050' }}>
                  写真を選ぶ
                </button>
                {avatarUrl && (
                  <button type="button" onClick={handleRemovePhoto}
                    className="text-xs font-black px-4 py-2.5 rounded-2xl"
                    style={{ border: '1.5px solid #EDE8E3', color: '#9B8B7E' }}>
                    削除
                  </button>
                )}
              </div>
              <p className="text-[11px] font-bold mt-2" style={{ color: '#C8B8A8' }}>
                自分の写真を正方形に切り抜いてアイコンにします
              </p>
              {avatarError && <p className="text-xs font-bold mt-1" style={{ color: '#F07050' }}>{avatarError}</p>}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#9B8B7E' }}>お名前</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-sm font-bold outline-none transition-all"
                style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3', color: '#2D1B0E' }}
                onFocus={(e) => { e.target.style.borderColor = '#F07050'; e.target.style.background = '#FFF' }}
                onBlur={(e) => { e.target.style.borderColor = '#EDE8E3'; e.target.style.background = '#FAFAF8' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#9B8B7E' }}>メールアドレス</label>
              <div className="px-4 py-3 rounded-2xl text-sm font-bold" style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3', color: '#C8B8A8' }}>
                {user?.email}
              </div>
            </div>
          </div>
        </Card>

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
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SLabel>空き時間</SLabel>
          <p className="text-xs mt-1 mb-4 font-bold" style={{ color: '#C8B8A8' }}>
            週間の定期的な空き状況を設定してください。自動スケジューリングに使用されます。
          </p>
          <AvailabilityGrid availability={availability} onChange={setAvailability} />
        </Card>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-2xl text-white font-black text-sm disabled:opacity-50"
          style={{ background: '#F07050', boxShadow: '0 4px 14px rgba(240,112,80,0.28)' }}>
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
