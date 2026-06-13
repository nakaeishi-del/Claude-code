'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BearMascot from '@/components/BearMascot'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })
      const data = await res.json()
      if (!res.ok) setError(data.detail ? `${data.error}（${data.detail}）` : (data.error || 'ログインに失敗しました'))
      else router.push(redirect)
    } catch { setError('通信エラーが発生しました') }
    finally { setLoading(false) }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (registerData.password !== registerData.confirmPassword) { setError('パスワードが一致しません'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerData.name, email: registerData.email, password: registerData.password }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.detail ? `${data.error}（${data.detail}）` : (data.error || '登録に失敗しました'))
      else router.push(redirect)
    } catch { setError('通信エラーが発生しました') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: '#FFFDF9' }}>
      {/* Bear + Brand */}
      <div className="flex flex-col items-center mb-8">
        <BearMascot size={88} mood={tab === 'login' ? 'happy' : 'wave'} animate />
        <h1 className="mt-3 text-3xl font-black tracking-tight" style={{ color: '#F07050', letterSpacing: '-0.5px' }}>
          lifematch
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#9B8B7E' }}>
          友達との予定を、かんたんに。
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-7" style={{ border: '1.5px solid #EDE8E3', boxShadow: '0 2px 20px rgba(0,0,0,0.05)' }}>
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {(['login', 'register'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={tab === t
                ? { background: 'white', color: '#2D1B0E', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }
                : { color: '#9B8B7E' }
              }>
              {t === 'login' ? 'ログイン' : '新規登録'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-2xl text-sm font-medium" style={{ background: '#FFF0EC', color: '#C85030' }}>
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Field label="メールアドレス" type="email" placeholder="hello@example.com"
              value={loginData.email} onChange={(v) => setLoginData({ ...loginData, email: v })} />
            <Field label="パスワード" type="password" placeholder="••••••••"
              value={loginData.password} onChange={(v) => setLoginData({ ...loginData, password: v })} />
            <Btn loading={loading} label="ログイン" />
            <p className="text-center text-xs pt-1" style={{ color: '#C8B8A8' }}>
              デモ: alice@demo.com / demo1234
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <Field label="ニックネーム" type="text" placeholder="田中 さくら"
              value={registerData.name} onChange={(v) => setRegisterData({ ...registerData, name: v })} />
            <Field label="メールアドレス" type="email" placeholder="hello@example.com"
              value={registerData.email} onChange={(v) => setRegisterData({ ...registerData, email: v })} />
            <Field label="パスワード" type="password" placeholder="6文字以上"
              value={registerData.password} onChange={(v) => setRegisterData({ ...registerData, password: v })} />
            <Field label="パスワード確認" type="password" placeholder="もう一度入力"
              value={registerData.confirmPassword} onChange={(v) => setRegisterData({ ...registerData, confirmPassword: v })} />
            <Btn loading={loading} label="はじめる" />
          </form>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDF9' }}>
        <BearMascot size={80} mood="sleep" animate />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

function Field({ label, type, placeholder, value, onChange }: {
  label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: '#9B8B7E' }}>{label}</label>
      <input type={type} required value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3.5 rounded-2xl text-sm transition-all outline-none"
        style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3', color: '#2D1B0E' }}
        onFocus={(e) => { e.target.style.borderColor = '#F07050'; e.target.style.background = '#FFFFFF' }}
        onBlur={(e) => { e.target.style.borderColor = '#EDE8E3'; e.target.style.background = '#FAFAF8' }}
      />
    </div>
  )
}

function Btn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-4 rounded-2xl text-white font-bold text-sm mt-1 transition-opacity disabled:opacity-50"
      style={{ background: '#F07050', boxShadow: '0 4px 16px rgba(240,112,80,0.28)' }}>
      {loading ? '...' : label}
    </button>
  )
}
