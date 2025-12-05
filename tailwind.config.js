/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
        tech: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        'vodoun-red': '#DC2626',
        'vodoun-gold': '#F59E0B',
        'vodoun-green': '#059669',
        'vodoun-purple': '#7C3AED',
        'vodoun-orange': '#EA580C',
        'cyber-black': '#050505',
        'cyber-gray': '#121212',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 12s linear infinite',
        'spin-very-slow': 'spin 60s linear infinite',
        'spin-reverse-slow': 'spin-reverse 45s linear infinite',
        'drift': 'drift 20s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'spin-reverse': {
          'from': { transform: 'rotate(360deg)' },
          'to': { transform: 'rotate(0deg)' },
        },
        drift: {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(50px) translateY(-20px)' },
          '100%': { transform: 'translateX(0) translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}