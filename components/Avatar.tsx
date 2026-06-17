'use client'

interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: number
  color?: string
  className?: string
}

// Renders a user's photo if set, otherwise a colored circle with the first letter.
export default function Avatar({ name, avatarUrl, size = 36, color = '#F07050', className = '' }: AvatarProps) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }
  const initials = (() => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
    return name.charAt(0).toUpperCase()
  })()

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-black flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: color, fontSize: Math.round(size * 0.38) }}
    >
      {initials}
    </div>
  )
}
