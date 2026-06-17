import BearMascot from '@/components/BearMascot'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDF9' }}>
      <div className="flex flex-col items-center gap-3">
        <BearMascot size={80} mood="sleep" animate />
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#F07050', animation: 'loadDot 1.2s ease-in-out infinite' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#F07050', animation: 'loadDot 1.2s ease-in-out 0.2s infinite' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#F07050', animation: 'loadDot 1.2s ease-in-out 0.4s infinite' }} />
        </div>
        <style>{`
          @keyframes loadDot {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40%            { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  )
}
