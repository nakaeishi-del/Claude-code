interface BearMascotProps {
  size?: number
  mood?: 'happy' | 'wave' | 'sleep' | 'wink' | 'excited' | 'celebrate' | 'love' | 'thinking'
  className?: string
  animate?: boolean
  animationType?: 'breathe' | 'bounce' | 'float' | 'wave' | 'none'
}

export default function BearMascot({
  size = 100,
  mood = 'happy',
  className = '',
  animate = false,
  animationType,
}: BearMascotProps) {
  const isSleeping = mood === 'sleep'

  // Determine effective animation type
  let effectiveAnimation: 'breathe' | 'bounce' | 'float' | 'wave' | 'none'
  if (animationType !== undefined) {
    effectiveAnimation = animationType
  } else if (!animate) {
    effectiveAnimation = 'none'
  } else if (isSleeping) {
    effectiveAnimation = 'breathe'
  } else if (mood === 'wave') {
    effectiveAnimation = 'wave'
  } else {
    effectiveAnimation = 'bounce'
  }

  const bodyAnimation =
    effectiveAnimation === 'breathe'
      ? 'animation: breathe 2.4s ease-in-out infinite;'
      : effectiveAnimation === 'bounce'
      ? 'animation: bounce 0.7s cubic-bezier(0.36,0.07,0.19,0.97) infinite;'
      : effectiveAnimation === 'float'
      ? 'animation: float 3s ease-in-out infinite;'
      : ''

  const waveArmAnimation =
    effectiveAnimation === 'wave'
      ? 'animation: waveArm 0.6s ease-in-out infinite;'
      : ''

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
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes waveArm {
          0%, 100% { transform: rotate(0deg); transform-origin: 74px 78px; }
          50% { transform: rotate(-22deg); transform-origin: 74px 78px; }
        }
        @keyframes zFloat {
          0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translate(8px, -16px) scale(1); }
        }
        @keyframes blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .bear-body { ${bodyAnimation} }
        .wave-arm { ${waveArmAnimation} }
        .eye-l { animation: blink 4.5s ease-in-out infinite; transform-origin: 38px 52px; }
        .eye-r { animation: blink 4.5s ease-in-out 0.05s infinite; transform-origin: 62px 52px; }
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

        {/* Party hat (celebrate mood) */}
        {mood === 'celebrate' && (
          <>
            <polygon points="50,10 41,34 59,34" fill="#F5C842" />
            <polygon points="50,10 45,22 55,22" fill="#F07050" />
            <circle cx="50" cy="10" r="2.5" fill="#F07050" />
            {/* Confetti dots */}
            <circle cx="22" cy="28" r="2.5" fill="#F07050" />
            <circle cx="30" cy="18" r="2" fill="#5BC4BF" />
            <circle cx="70" cy="22" r="2.5" fill="#F5C842" />
            <circle cx="78" cy="32" r="2" fill="#A78BFA" />
            <circle cx="65" cy="14" r="1.8" fill="#F07050" />
            <circle cx="35" cy="14" r="1.8" fill="#5BC4BF" />
          </>
        )}

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
            <g className={animate ? 'eye-l' : ''}>
              <circle cx="38" cy="52" r="5" fill="#2D1B0E" />
              <circle cx="40" cy="50" r="1.8" fill="white" />
            </g>
            <path d="M56 52 Q60 48 64 52" stroke="#2D1B0E" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </>
        ) : mood === 'love' ? (
          <>
            {/* Heart-shaped eyes */}
            <path
              d="M38 54 C38 54 33 50 33 47 C33 44.5 35.5 43 38 45 C40.5 43 43 44.5 43 47 C43 50 38 54 38 54 Z"
              fill="#E84A7A"
            />
            <path
              d="M62 54 C62 54 57 50 57 47 C57 44.5 59.5 43 62 45 C64.5 43 67 44.5 67 47 C67 50 62 54 62 54 Z"
              fill="#E84A7A"
            />
          </>
        ) : mood === 'thinking' ? (
          <>
            {/* Eyes looking up-right */}
            <circle cx="38" cy="52" r="5" fill="#2D1B0E" />
            <circle cx="62" cy="52" r="5" fill="#2D1B0E" />
            {/* Pupils offset up-right */}
            <circle cx="40" cy="49.5" r="1.8" fill="white" />
            <circle cx="64" cy="49.5" r="1.8" fill="white" />
          </>
        ) : mood === 'excited' ? (
          <>
            {/* Wide eyes with big highlights */}
            <g className={animate ? 'eye-l' : ''}>
              <circle cx="38" cy="52" r="6.5" fill="#2D1B0E" />
              <circle cx="40" cy="49.5" r="2.5" fill="white" />
            </g>
            <g className={animate ? 'eye-r' : ''}>
              <circle cx="62" cy="52" r="6.5" fill="#2D1B0E" />
              <circle cx="64" cy="49.5" r="2.5" fill="white" />
            </g>
            {/* Raised eyebrows */}
            <path d="M33 44 Q38 41 43 44" stroke="#7A4020" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M57 44 Q62 41 67 44" stroke="#7A4020" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </>
        ) : mood === 'celebrate' ? (
          <>
            <g className={animate ? 'eye-l' : ''}>
              <circle cx="38" cy="52" r="5" fill="#2D1B0E" />
              <circle cx="40" cy="50" r="1.8" fill="white" />
            </g>
            <g className={animate ? 'eye-r' : ''}>
              <circle cx="62" cy="52" r="5" fill="#2D1B0E" />
              <circle cx="64" cy="50" r="1.8" fill="white" />
            </g>
          </>
        ) : (
          /* happy, wave */
          <>
            <g className={animate ? 'eye-l' : ''}>
              <circle cx="38" cy="52" r="5" fill="#2D1B0E" />
              <circle cx="40" cy="50" r="1.8" fill="white" />
            </g>
            <g className={animate ? 'eye-r' : ''}>
              <circle cx="62" cy="52" r="5" fill="#2D1B0E" />
              <circle cx="64" cy="50" r="1.8" fill="white" />
            </g>
          </>
        )}

        {/* Nose */}
        <ellipse cx="50" cy="63" rx="3.5" ry="2.5" fill="#7A4020" />

        {/* Mouth */}
        {mood === 'happy' || mood === 'wave' || mood === 'wink' || mood === 'celebrate' || mood === 'love' ? (
          <path d="M43 68 Q50 75 57 68" stroke="#7A4020" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        ) : mood === 'excited' ? (
          /* Wide open smile */
          <path d="M41 67 Q50 77 59 67" stroke="#7A4020" strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : mood === 'thinking' ? (
          /* Slight uncertain smile */
          <path d="M44 70 Q50 73 56 70" stroke="#7A4020" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        ) : (
          /* sleep */
          <path d="M44 70 Q50 68 56 70" stroke="#7A4020" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        )}

        {/* Blush */}
        <circle cx="28" cy="63" r="8" fill="#FFB0A0" opacity="0.28" />
        <circle cx="72" cy="63" r="8" fill="#FFB0A0" opacity="0.28" />

        {/* Extra blush for excited */}
        {mood === 'excited' && (
          <>
            <circle cx="28" cy="63" r="8" fill="#FFB0A0" opacity="0.22" />
            <circle cx="72" cy="63" r="8" fill="#FFB0A0" opacity="0.22" />
          </>
        )}

        {/* Wave arm */}
        {mood === 'wave' && (
          <g className="wave-arm">
            <ellipse cx="82" cy="72" rx="9" ry="6" fill="#F0D098" transform="rotate(-35 82 72)" />
          </g>
        )}

        {/* Thinking paw at chin */}
        {mood === 'thinking' && (
          <ellipse cx="60" cy="76" rx="8" ry="5.5" fill="#EDD5A0" transform="rotate(-15 60 76)" />
        )}
      </g>

      {/* Sleeping Zzz */}
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
