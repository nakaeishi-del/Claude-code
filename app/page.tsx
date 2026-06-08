'use client'

import { useState, useEffect, useRef } from 'react'
import MascotCharacter from '@/components/MascotCharacter'
import VoiceRecorder from '@/components/VoiceRecorder'
import DiaryCard from '@/components/DiaryCard'
import { saveEntry, getAllEntries, deleteEntry, updateEntry } from '@/lib/storage'
import { DiaryEntry, MascotState } from '@/lib/types'

const MOODS = ['😊', '😢', '😡', '😂', '😴', '🥰', '😤', '🤔', '🎉', '😰']

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function formatToday() {
  return new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

export default function HomePage() {
  const [mascotState, setMascotState] = useState<MascotState>('idle')
  const [transcript, setTranscript] = useState('')
  const [enhancedText, setEnhancedText] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [mood, setMood] = useState('😊')
  const [photos, setPhotos] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveAnim, setSaveAnim] = useState(false)
  const [recentEntries, setRecentEntries] = useState<DiaryEntry[]>([])
  const [streak, setStreak] = useState(0)
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const entries = await getAllEntries()
    setRecentEntries(entries.slice(0, 5))

    // Calculate consecutive streak
    let s = 0
    const dates = new Set(entries.map((e) => e.date))
    const check = new Date()
    while (true) {
      const d = check.toISOString().split('T')[0]
      if (dates.has(d)) {
        s++
        check.setDate(check.getDate() - 1)
      } else {
        break
      }
    }
    setStreak(s)
  }

  async function handleEnhance() {
    const text = transcript.trim()
    if (!text) return
    setIsEnhancing(true)
    setMascotState('thinking')
    try {
      const res = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      setEnhancedText(data.enhanced || text)
      setMascotState('happy')
      setTimeout(() => setMascotState('idle'), 2000)
    } catch {
      setEnhancedText(text)
    } finally {
      setIsEnhancing(false)
    }
  }

  async function handleSave() {
    const content = (enhancedText || transcript).trim()
    if (!content) return
    setIsSaving(true)

    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      date: todayStr(),
      content,
      rawContent: transcript,
      mood,
      photos,
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    await saveEntry(entry)

    // Auto-share if sharing enabled
    const username = localStorage.getItem('ikki-username') || ''
    const sharingEnabled = localStorage.getItem('ikki-sharing') === 'true'
    if (sharingEnabled && username && username !== 'ゲスト') {
      try {
        const res = await fetch('/api/diary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, content: entry.content.slice(0, 500), mood, date: entry.date }),
        })
        const data = await res.json()
        if (data.entry) {
          await updateEntry({ ...entry, isPublic: true, publicId: data.entry.id })
        }
      } catch {}
    }

    setIsSaving(false)
    setSaveAnim(true)
    setMascotState('happy')

    setTimeout(() => {
      setTranscript('')
      setEnhancedText('')
      setPhotos([])
      setSaveAnim(false)
      setMascotState('idle')
      loadData()
    }, 2200)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const newPhotos: string[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const compressed = await compressImage(file, 800)
      newPhotos.push(compressed)
    }
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 4))
  }

  async function handleDelete(id: string) {
    await deleteEntry(id)
    loadData()
  }

  async function handleShare(entry: DiaryEntry) {
    const usr = localStorage.getItem('ikki-username') || ''
    if (!usr || usr === 'ゲスト') {
      alert('設定からニックネームを設定してシェアしよう！')
      return
    }
    if (entry.isPublic) {
      if (entry.publicId) {
        await fetch('/api/diary', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: entry.publicId }),
        })
      }
      await updateEntry({ ...entry, isPublic: false, publicId: undefined })
    } else {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usr, content: entry.content.slice(0, 500), mood: entry.mood, date: entry.date }),
      })
      const data = await res.json()
      if (data.entry) {
        await updateEntry({ ...entry, isPublic: true, publicId: data.entry.id })
      }
    }
    loadData()
  }

  const displayText = enhancedText || transcript

  return (
    <div
      className="min-h-screen pb-24 star-bg"
      style={{ background: 'linear-gradient(160deg, #0D0B1E 0%, #1A0540 50%, #0D1520 100%)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <div>
          <h1 className="text-2xl font-black gradient-text">✦ 一気日記</h1>
          <p className="text-[11px] text-[#9D8EBF] mt-0.5">{formatToday()}</p>
        </div>
        {streak > 0 && (
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}
          >
            🔥 {streak}日連続
          </div>
        )}
      </div>

      {/* Mascot */}
      <div className="py-2">
        <MascotCharacter state={saveAnim ? 'happy' : mascotState} />
      </div>

      {/* Save success overlay */}
      {saveAnim && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className="px-8 py-6 rounded-3xl text-center animate-bounce"
            style={{
              background: 'rgba(13,11,30,0.95)',
              border: '2px solid #FF4ECD',
              boxShadow: '0 0 40px rgba(255,78,205,0.5)',
            }}
          >
            <div className="text-5xl mb-2">🎉</div>
            <div className="text-lg font-black text-white">保存完了！</div>
            <div className="text-sm text-[#FF4ECD] mt-1">今日もえらい！✦</div>
          </div>
        </div>
      )}

      <div className="px-4 space-y-4">
        {/* Voice recorder */}
        <div className="glass-card p-5" style={{ border: '1px solid rgba(255,78,205,0.2)' }}>
          <VoiceRecorder value={transcript} onChange={setTranscript} onMascotState={setMascotState} />
        </div>

        {/* Text editor */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#9D8EBF]">📝 今日のひとこと</span>
            {enhancedText && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(0,255,159,0.15)', color: '#00FF9F' }}
              >
                ✨ AI整形済み
              </span>
            )}
          </div>
          <textarea
            className="w-full bg-transparent text-[#F0E6FF] text-sm leading-relaxed placeholder-[#4A3D6B] min-h-[120px]"
            placeholder="声で録音するか、ここに直接入力してね..."
            value={displayText}
            onChange={(e) => {
              setEnhancedText('')
              setTranscript(e.target.value)
            }}
          />
        </div>

        {/* Mood selector */}
        <div className="glass-card p-4">
          <p className="text-xs font-bold text-[#9D8EBF] mb-3">今日の気分は？</p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`text-2xl transition-all duration-200 ${
                  mood === m ? 'scale-125' : 'opacity-60 hover:opacity-100 hover:scale-110'
                }`}
                style={mood === m ? { filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.6))' } : {}}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Photo upload */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-[#9D8EBF]">📸 写真（最大4枚）</p>
            {photos.length > 0 && (
              <span className="text-xs text-[#9D8EBF]">{photos.length}/4</span>
            )}
          </div>
          {photos.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {photos.map((photo, i) => (
                <div key={i} className="relative">
                  <img
                    src={photo}
                    alt=""
                    className="w-20 h-20 object-cover rounded-xl"
                    style={{ border: '2px solid rgba(255,78,205,0.3)' }}
                  />
                  <button
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => photoRef.current?.click()}
            disabled={photos.length >= 4}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: photos.length >= 4 ? 'rgba(255,255,255,0.04)' : 'rgba(255,78,205,0.15)',
              color: photos.length >= 4 ? '#4A3D6B' : '#FF4ECD',
              border: `1px solid ${photos.length >= 4 ? 'rgba(255,255,255,0.05)' : 'rgba(255,78,205,0.3)'}`,
            }}
          >
            📸 写真を選ぶ
          </button>
          <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleEnhance}
            disabled={isEnhancing || !transcript.trim()}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background:
                isEnhancing || !transcript.trim() ? 'rgba(255,255,255,0.04)' : 'rgba(123,47,255,0.2)',
              color: isEnhancing || !transcript.trim() ? '#4A3D6B' : '#C084FC',
              border: `1px solid ${
                isEnhancing || !transcript.trim() ? 'rgba(255,255,255,0.05)' : 'rgba(123,47,255,0.4)'
              }`,
            }}
          >
            {isEnhancing ? (
              <><span className="animate-spin inline-block">⟳</span> 整形中...</>
            ) : (
              <>✨ AIで整える</>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !displayText.trim()}
            className="flex-1 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background:
                isSaving || !displayText.trim()
                  ? 'rgba(255,255,255,0.04)'
                  : 'linear-gradient(135deg, #FF4ECD, #7B2FFF)',
              color: isSaving || !displayText.trim() ? '#4A3D6B' : 'white',
              boxShadow: !displayText.trim() ? 'none' : '0 4px 20px rgba(255,78,205,0.4)',
            }}
          >
            {isSaving ? '保存中...' : '💾 保存する'}
          </button>
        </div>

        {/* Recent entries */}
        {recentEntries.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 mt-2">
              <span className="text-sm font-black text-[#F0E6FF]">最近の日記</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <DiaryCard
                  key={entry.id}
                  entry={entry}
                  compact
                  onDelete={handleDelete}
                  onShare={handleShare}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

async function compressImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width
        let h = img.height
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h)
          w = Math.round(w * ratio)
          h = Math.round(h * ratio)
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
