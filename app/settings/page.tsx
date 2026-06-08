'use client'

import { useState, useEffect } from 'react'
import { getAllEntries, deleteEntry } from '@/lib/storage'

export default function SettingsPage() {
  const [username, setUsername] = useState('')
  const [sharingEnabled, setSharingEnabled] = useState(false)
  const [entryCount, setEntryCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    setUsername(localStorage.getItem('ikki-username') || '')
    setSharingEnabled(localStorage.getItem('ikki-sharing') === 'true')
    getAllEntries().then((entries) => setEntryCount(entries.length))
  }, [])

  function handleSave() {
    const trimmed = username.trim().slice(0, 20)
    if (!trimmed) { alert('ニックネームを入力してください'); return }
    localStorage.setItem('ikki-username', trimmed)
    localStorage.setItem('ikki-sharing', sharingEnabled ? 'true' : 'false')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleExport() {
    const entries = await getAllEntries()
    const json = JSON.stringify(entries, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ikki-diary-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleClearAll() {
    if (!confirmClear) { setConfirmClear(true); return }
    const entries = await getAllEntries()
    await Promise.all(entries.map((e) => deleteEntry(e.id)))
    setEntryCount(0)
    setConfirmClear(false)
    alert('全データを削除しました')
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: 'linear-gradient(160deg, #0D0B1E 0%, #1A0540 50%, #0D1520 100%)' }}
    >
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black gradient-text">⚙️ 設定</h1>
        <p className="text-xs text-[#9D8EBF] mt-1">一気日記をカスタマイズしよう</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Profile */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-black text-[#F0E6FF] mb-4">👤 プロフィール</h2>
          <div>
            <label className="text-xs text-[#9D8EBF] font-bold mb-2 block">ニックネーム（20文字まで）</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 20))}
              placeholder="あなたのニックネーム"
              className="w-full px-4 py-3 rounded-xl text-sm text-[#F0E6FF] placeholder-[#4A3D6B] font-medium"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <p className="text-xs text-[#9D8EBF] mt-1.5">
              みんなの日記でシェアするときに表示される名前です
            </p>
          </div>
        </div>

        {/* Sharing */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-black text-[#F0E6FF] mb-4">🌐 シェア設定</h2>
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div>
              <div className="text-sm font-bold text-[#F0E6FF]">自動シェア</div>
              <div className="text-xs text-[#9D8EBF] mt-0.5">
                保存した日記を自動でみんなに公開する
              </div>
            </div>
            <button
              onClick={() => setSharingEnabled(!sharingEnabled)}
              className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
              style={{
                background: sharingEnabled
                  ? 'linear-gradient(90deg, #00FF9F, #00CC80)'
                  : 'rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                style={{ left: sharingEnabled ? 'calc(100% - 22px)' : '2px' }}
              />
            </button>
          </div>
          {sharingEnabled && (
            <p className="text-xs text-[#00FF9F] mt-2 ml-1">
              ✓ 日記を保存するとみんなのページに表示されます
            </p>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl font-black text-white transition-all"
          style={{
            background: saved
              ? 'linear-gradient(135deg, #00FF9F, #00CC80)'
              : 'linear-gradient(135deg, #FF4ECD, #7B2FFF)',
            boxShadow: '0 4px 20px rgba(255,78,205,0.4)',
          }}
        >
          {saved ? '✓ 保存しました！' : '設定を保存'}
        </button>

        {/* Data & Stats */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-black text-[#F0E6FF] mb-4">📊 データ</h2>
          <div className="flex items-center justify-between py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-sm text-[#9D8EBF]">日記の総数</span>
            <span className="font-black text-[#F0E6FF]">{entryCount}件</span>
          </div>
          <div className="flex items-center justify-between py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-sm text-[#9D8EBF]">ストレージ</span>
            <span className="text-xs font-bold text-[#9D8EBF]">端末に保存中</span>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full mt-4 py-3 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(123,47,255,0.2)', color: '#C084FC', border: '1px solid rgba(123,47,255,0.3)' }}
          >
            📥 全データをエクスポート (JSON)
          </button>

          {/* Clear data */}
          <button
            onClick={handleClearAll}
            className="w-full mt-2 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: confirmClear ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
              color: confirmClear ? '#F87171' : '#9D8EBF',
              border: `1px solid ${confirmClear ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            {confirmClear ? '⚠️ もう一度タップで全削除（元に戻せません）' : '🗑️ 全データを削除'}
          </button>
          {confirmClear && (
            <button
              onClick={() => setConfirmClear(false)}
              className="w-full mt-1 py-2 text-xs text-[#9D8EBF]"
            >
              キャンセル
            </button>
          )}
        </div>

        {/* App info */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-black text-[#F0E6FF] mb-3">ℹ️ アプリについて</h2>
          <div className="space-y-2 text-xs text-[#9D8EBF]">
            <p>✦ 一気日記 v1.0</p>
            <p>音声入力でかんたんに日記を書こう。</p>
            <p>日記はこの端末に永続的に保存されます。</p>
            <p>シェア機能を使うとサーバーに保存されます。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
