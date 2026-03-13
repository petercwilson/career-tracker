/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"Instrument Sans"', 'sans-serif'],
      },
      colors: {
        surface: {
          950: '#060810',
          900: '#0d1117',
          800: '#161b27',
          700: '#1e2535',
          600: '#2a3347',
        },
        accent: {
          DEFAULT: '#38bdf8',
          dim: '#0ea5e9',
          glow: 'rgba(56,189,248,0.15)',
        },
        gold: {
          DEFAULT: '#f59e0b',
          dim: '#d97706',
          glow: 'rgba(245,158,11,0.15)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
