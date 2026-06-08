'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { MascotState } from '@/lib/types'

interface Props {
  value: string
  onChange: (text: string) => void
  onMascotState: (state: MascotState) => void
}

export default function VoiceRecorder({ value, onChange, onMascotState }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef<any>(null)
  const finalRef = useRef(value)

  useEffect(() => {
    finalRef.current = value
  }, [value])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
      setIsSupported(supported)
    }
  }, [])

  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      let fin = ''
      let inter = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) fin += r[0].transcript
        else inter += r[0].transcript
      }
      if (fin) {
        finalRef.current = finalRef.current + fin
        onChange(finalRef.current)
      }
      setInterim(inter)
    }

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech') {
        console.warn('Speech recognition error:', e.error)
      }
    }

    recognition.onend = () => {
      // Auto-restart if still recording flag is set
      if (recognitionRef.current === recognition) {
        try { recognition.start() } catch {}
      }
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
    setInterim('')
    onMascotState('recording')
  }, [onChange, onMascotState])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      const r = recognitionRef.current
      recognitionRef.current = null
      r.stop()
    }
    setIsRecording(false)
    setInterim('')
    onMascotState('idle')
  }, [onMascotState])

  const toggle = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  if (!isSupported) {
    return (
      <div className="text-center text-sm text-[#9D8EBF] px-4 py-2">
        ⚠️ このブラウザは音声入力に対応していません。
        <br />
        テキストを直接入力してください。
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Record button */}
      <div className="relative">
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-[#FF4ECD] opacity-30 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-[#FF4ECD] opacity-20 animate-ping" style={{ animationDelay: '0.3s' }} />
          </>
        )}
        <button
          onClick={toggle}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl transition-all duration-300 shadow-lg ${
            isRecording
              ? 'bg-red-500 scale-110 shadow-red-500/40'
              : 'bg-gradient-to-br from-[#FF4ECD] to-[#7B2FFF] hover:scale-105 shadow-pink'
          }`}
          style={{ boxShadow: isRecording ? '0 0 30px rgba(255,0,0,0.4)' : '0 0 20px rgba(255,78,205,0.4)' }}
        >
          {isRecording ? '■' : '🎤'}
        </button>
      </div>

      {/* Status label */}
      <div className="text-sm font-bold">
        {isRecording ? (
          <span className="text-red-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block" />
            録音中... タップで停止
          </span>
        ) : (
          <span className="text-[#9D8EBF]">タップして録音開始</span>
        )}
      </div>

      {/* Interim text */}
      {interim && (
        <div className="w-full px-4 py-2 rounded-xl text-sm text-[#9D8EBF] italic"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          {interim}...
        </div>
      )}
    </div>
  )
}
