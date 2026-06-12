interface BearMascotProps {
  size?: number
  mood?: 'happy' | 'wave' | 'sleep' | 'wink'
  className?: string
  animate?: boolean
}

export default function BearMascot({ size = 100, mood = 'happy', className = '', animate = false }: BearMascotProps) {
  const isSleeping = mood === 'sleep'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scaleY(1); transform-origin: bottom center; }
          50% { transform: scaleY(1.03); transform-origin: bottom center; }
        }
        @keyframes zFloat {
          0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translate(8px, -16px) scale(1); }
        }
        .bear-body { ${animate && isSleeping ? 'animation: breathe 2.4s ease-in-out infinite;' : ''} }
        .z1 { animation: zFloat 2.4s ease-out infinite; }
        .z2 { animation: zFloat 2.4s ease-out 0.8s infinite; }
        .z3 { animation: zFloat 2.4s ease-out 1.6s infinite; }
      `}</style>

      <g className="bear-body">
        {/* Left ear */}
        <circle cx="24" cy="34" r="13" fill="#EDD5A0" />
        <circle cx="24" cy="34" r="7.5" fill="#F0AEA4" />

        {/* Right ear */}
        <circle cx="76" cy="34" r="13" fill="#EDD5A0" />
        <circle cx="76" cy="34" r="7.5" fill="#F0AEA4" />

        {/* Head */}
        <circle cx="50" cy="57" r="40" fill="#F5E3B8" />

        {/* Muzzle */}
        <ellipse cx="50" cy="69" rx="17" ry="11" fill="#FAEFD4" />

        {/* Eyes */}
        {mood === 'sleep' ? (
          <>
            <path d="M36 52 Q40 48 44 52" stroke="#2D1B0E" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M56 52 Q60 48 64 52" stroke="#2D1B0E" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </>
        ) : mood === 'wink' ? (
          <>
            <circle cx="38" cy="52" r="5" fill="#2D1B0E" />
            <circle cx="40" cy="50" r="1.8" fill="white" />
            <path d="M56 52 Q60 48 64 52" stroke="#2D1B0E" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx="38" cy="52" r="5" fill="#2D1B0E" />
            <circle cx="62" cy="52" r="5" fill="#2D1B0E" />
            <circle cx="40" cy="50" r="1.8" fill="white" />
            <circle cx="64" cy="50" r="1.8" fill="white" />
          </>
        )}

        {/* Nose */}
        <ellipse cx="50" cy="63" rx="3.5" ry="2.5" fill="#7A4020" />

        {/* Mouth */}
        {mood === 'happy' || mood === 'wave' || mood === 'wink' ? (
          <path d="M43 68 Q50 75 57 68" stroke="#7A4020" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M44 70 Q50 68 56 70" stroke="#7A4020" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        )}

        {/* Blush */}
        <circle cx="28" cy="63" r="8" fill="#FFB0A0" opacity="0.28" />
        <circle cx="72" cy="63" r="8" fill="#FFB0A0" opacity="0.28" />

        {/* Wave arm */}
        {mood === 'wave' && (
          <ellipse cx="82" cy="72" rx="9" ry="6" fill="#F0D098" transform="rotate(-35 82 72)" />
        )}
      </g>

      {/* Sleeping Zzz — only animate when animate=true */}
      {isSleeping && animate && (
        <>
          <text className="z1" x="72" y="38" fontSize="8" fontWeight="bold" fill="#9B8B7E">z</text>
          <text className="z2" x="78" y="30" fontSize="10" fontWeight="bold" fill="#9B8B7E">z</text>
          <text className="z3" x="84" y="21" fontSize="12" fontWeight="bold" fill="#9B8B7E">Z</text>
        </>
      )}
    </svg>
  )
}
