'use client'

import { useEffect, useState } from 'react'
import BearMascot from './BearMascot'

const KEY = 'tomomeet_onboarding_done'

const STEPS = [
  {
    mood: 'wave' as const,
    title: 'ようこそ tomomeet へ！',
    body: '友達との「いつ集まる？」を自動で解決するアプリです。30秒だけ使い方を紹介させてください🐻',
    emoji: '👋',
  },
  {
    mood: 'happy' as const,
    title: 'グループを作って友達を招待',
    body: 'グループを作ったら、LINEで招待リンクを送るだけ。友達はワンタップで参加できます。',
    emoji: '👥',
  },
  {
    mood: 'thinking' as const,
    title: '空き時間を登録すると…',
    body: 'みんなの空き時間が重なる日をAIが自動で見つけて、お店と一緒に提案してくれます。',
    emoji: '🗓️',
  },
  {
    mood: 'celebrate' as const,
    title: 'あとは投票するだけ！',
    body: '全員が「参加」に投票したら予定が確定🎉 さっそく最初のグループを作ってみましょう！',
    emoji: '🗳️',
  },
]

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!localStorage.getItem(KEY)) setVisible(true)
  }, [])

  function finish() {
    localStorage.setItem(KEY, '1')
    setLeaving(true)
    setTimeout(() => setVisible(false), 300)
  }

  if (!visible) return null

  const s = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center px-5"
      style={{
        background: 'rgba(45,27,14,0.45)',
        backdropFilter: 'blur(3px)',
        opacity: leaving ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}>
      <div key={step} className="bounce-in bg-white rounded-3xl p-7 w-full max-w-sm text-center relative"
        style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.18)' }}>

        {/* Skip */}
        <button onClick={finish}
          className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-full"
          style={{ color: '#C8B8A8', background: '#FAFAF8' }}>
          スキップ
        </button>

        <div className="flex justify-center mb-4 mt-2">
          <BearMascot size={90} mood={s.mood} animate animationType="float" />
        </div>

        <div className="text-2xl mb-2">{s.emoji}</div>
        <h2 className="text-lg font-black mb-2" style={{ color: '#2D1B0E' }}>{s.title}</h2>
        <p className="text-sm font-bold leading-relaxed mb-6" style={{ color: '#9B8B7E' }}>{s.body}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <span key={i} className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 7,
                height: 7,
                background: i === step ? '#F07050' : '#EDE8E3',
              }} />
          ))}
        </div>

        <div className="flex gap-2.5">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="px-5 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95"
              style={{ border: '1.5px solid #EDE8E3', color: '#9B8B7E' }}>
              戻る
            </button>
          )}
          <button onClick={() => (isLast ? finish() : setStep(step + 1))}
            className="flex-1 py-3.5 rounded-2xl text-white text-sm font-black transition-all active:scale-[0.98]"
            style={{ background: '#F07050', boxShadow: '0 4px 14px rgba(240,112,80,0.3)' }}>
            {isLast ? 'はじめる 🎉' : 'つぎへ'}
          </button>
        </div>
      </div>
    </div>
  )
}
