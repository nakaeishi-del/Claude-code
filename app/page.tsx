'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BearMascot from '@/components/BearMascot'

type Mood = 'happy' | 'wave' | 'sleep' | 'wink' | 'excited' | 'celebrate' | 'love' | 'thinking'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [tabKey, setTabKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  // Determine bear mood based on context
  function getBearMood(): Mood {
    if (loading) return 'celebrate'
    if (error) return 'sleep'
    if (tab === 'register') {
      if (registerData.name.length > 0 && focusedField === 'name') return 'excited'
      if (focusedField === 'password' || focusedField === 'confirmPassword') return 'thinking'
      return 'wave'
    }
    if (focusedField === 'password') return 'wink'
    if (focusedField === 'email') return 'thinking'
    return 'happy'
  }

  function triggerError(msg: string) {
    setError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

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
      if (!res.ok) triggerError(data.detail ? `${data.error}（${data.detail}）` : (data.error || 'ログインに失敗しました'))
      else router.push(redirect)
    } catch { triggerError('通信エラーが発生しました') }
    finally { setLoading(false) }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (registerData.password !== registerData.confirmPassword) { triggerError('パスワードが一致しません'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerData.name, email: registerData.email, password: registerData.password }),
      })
      const data = await res.json()
      if (!res.ok) triggerError(data.detail ? `${data.error}（${data.detail}）` : (data.error || '登録に失敗しました'))
      else router.push(redirect)
    } catch { triggerError('通信エラーが発生しました') }
    finally { setLoading(false) }
  }

  const mood = getBearMood()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden" style={{ background: '#FFFDF9' }}>
      <style>{`
        @keyframes loginEnter {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-5px); }
          60% { transform: translateX(5px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
        @keyframes floatBlob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(8px, -12px) scale(1.04); }
          66%       { transform: translate(-6px, 6px) scale(0.97); }
        }
        .login-card-enter { animation: loginEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .card-shake { animation: shake 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
        .blob1 { animation: floatBlob 8s ease-in-out infinite; }
        .blob2 { animation: floatBlob 10s ease-in-out 2s infinite; }
        .blob3 { animation: floatBlob 7s ease-in-out 4s infinite; }
      `}</style>

      {/* Decorative background blobs */}
      <div className="blob1 absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FFF0EC 0%, transparent 70%)', opacity: 0.7 }} />
      <div className="blob2 absolute -bottom-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F0FAF2 0%, transparent 70%)', opacity: 0.6 }} />
      <div className="blob3 absolute top-1/2 -right-24 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #EEF3FC 0%, transparent 70%)', opacity: 0.5 }} />

      {/* Bear + Brand */}
      <div className="flex flex-col items-center mb-8" style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <div style={{ transition: 'all 0.3s ease' }}>
          <BearMascot size={96} mood={mood} animate={!loading}
            animationType={loading ? 'bounce' : undefined} />
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight" style={{ color: '#F07050', letterSpacing: '-0.5px' }}>
          tomomeet
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#9B8B7E' }}>
          {loading ? '処理中...' : '友達との予定を、かんたんに。'}
        </p>
      </div>

      {/* Card */}
      <div className={`w-full max-w-sm bg-white rounded-3xl p-7 ${shake ? 'card-shake' : ''} ${mounted ? 'login-card-enter' : ''}`}
        style={{ border: '1.5px solid #EDE8E3', boxShadow: '0 2px 20px rgba(0,0,0,0.05)', animationDelay: '0.1s' }}>
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {(['login', 'register'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setTabKey((k) => k + 1); setError('') }}
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
          <form key={tabKey} onSubmit={handleLogin} className="space-y-4 login-card-enter">
            <Field label="メールアドレス" type="email" placeholder="hello@example.com"
              value={loginData.email}
              onChange={(v) => setLoginData({ ...loginData, email: v })}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)} />
            <Field label="パスワード" type="password" placeholder="••••••••"
              value={loginData.password}
              onChange={(v) => setLoginData({ ...loginData, password: v })}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)} />
            <Btn loading={loading} label="ログイン" />
            <p className="text-center text-xs pt-1" style={{ color: '#C8B8A8' }}>
              デモ: alice@demo.com / demo1234
            </p>
          </form>
        ) : (
          <form key={tabKey} onSubmit={handleRegister} className="space-y-4 login-card-enter">
            <Field label="ニックネーム" type="text" placeholder="田中 さくら"
              value={registerData.name}
              onChange={(v) => setRegisterData({ ...registerData, name: v })}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)} />
            <Field label="メールアドレス" type="email" placeholder="hello@example.com"
              value={registerData.email}
              onChange={(v) => setRegisterData({ ...registerData, email: v })}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)} />
            <Field label="パスワード" type="password" placeholder="6文字以上"
              value={registerData.password}
              onChange={(v) => setRegisterData({ ...registerData, password: v })}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)} />
            <Field label="パスワード確認" type="password" placeholder="もう一度入力"
              value={registerData.confirmPassword}
              onChange={(v) => setRegisterData({ ...registerData, confirmPassword: v })}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)} />
            <Btn loading={loading} label="はじめる 🎉" />
          </form>
        )}
      </div>

      {/* Feature highlights */}
      <div className="mt-6 flex flex-col gap-2 w-full max-w-sm" style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s',
      }}>
        {[
          { icon: '🗓️', text: '空き時間を自動マッチング' },
          { icon: '🍽️', text: 'AIがお店を自動提案' },
          { icon: '🗳️', text: 'みんなで投票して確定' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid #EDE8E3' }}>
            <span className="text-base">{icon}</span>
            <span className="text-xs font-bold" style={{ color: '#9B8B7E' }}>{text}</span>
          </div>
        ))}
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

function Field({ label, type, placeholder, value, onChange, onFocus, onBlur }: {
  label: string; type: string; placeholder: string; value: string
  onChange: (v: string) => void; onFocus?: () => void; onBlur?: () => void
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: '#9B8B7E' }}>{label}</label>
      <input type={type} required value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => { e.target.style.borderColor = '#F07050'; e.target.style.background = '#FFFFFF'; onFocus?.() }}
        onBlur={(e) => { e.target.style.borderColor = '#EDE8E3'; e.target.style.background = '#FAFAF8'; onBlur?.() }}
        className="w-full px-4 py-3.5 rounded-2xl text-sm transition-all outline-none"
        style={{ background: '#FAFAF8', border: '1.5px solid #EDE8E3', color: '#2D1B0E' }}
      />
    </div>
  )
}

function Btn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-4 rounded-2xl text-white font-black text-sm mt-1 transition-all active:scale-[0.98] disabled:opacity-50"
      style={{ background: '#F07050', boxShadow: '0 4px 16px rgba(240,112,80,0.28)' }}>
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          処理中...
        </span>
      ) : label}
    </button>
  )
}
