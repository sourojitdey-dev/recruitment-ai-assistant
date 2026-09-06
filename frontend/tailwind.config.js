/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#0a0b14',
          card: 'rgba(22, 24, 43, 0.65)',
        },
        brand: {
          purple: '#a855f7',
          indigo: '#6366f1',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        }
      },
      boxShadow: {
        'glass-glow': '0 8px 32px 0 rgba(99, 102, 241, 0.25)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
      }
    },
  },
  plugins: [],
}
