module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ikki: {
          bg: '#0D0B1E',
          card: '#1A1438',
          pink: '#FF4ECD',
          purple: '#7B2FFF',
          gold: '#FFD700',
          neon: '#00FF9F',
          muted: '#9D8EBF',
          text: '#F0E6FF',
        },
      },
      fontFamily: {
        rounded: ['M PLUS Rounded 1c', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-pink': 'pulse-pink 1.5s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'blink': 'blink 4s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
        'record-ring': 'record-ring 1s ease-out infinite',
      },
      keyframes: {
        'pulse-pink': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 78, 205, 0.4)' },
          '50%': { boxShadow: '0 0 0 20px rgba(255, 78, 205, 0)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '0.5', transform: 'scale(1.3) rotate(180deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        blink: {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.05)' },
        },
        'record-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
