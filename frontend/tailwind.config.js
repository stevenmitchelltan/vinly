/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        fraunces: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      colors: {
        burgundy: {
          50: '#fdf4f4',
          100: '#fce8e8',
          200: '#f9d5d5',
          300: '#f4b3b3',
          400: '#ec8888',
          500: '#e05c5c',
          600: '#cc3f3f',
          700: '#ab2f2f',
          800: '#8d2929',
          900: '#762727',
          950: '#3f1111',
        },
        cream: {
          50: '#fdfcfa',
          100: '#faf7f2',
          200: '#f0e9de',
          300: '#ddd2c2',
          400: '#b8a68e',
        },
        gold: {
          400: '#e5c590',
          500: '#d4a86a',
          600: '#b8894c',
        },
        th: {
          bg: 'rgb(var(--th-bg) / <alpha-value>)',
          surface: 'rgb(var(--th-surface) / <alpha-value>)',
          elevated: 'rgb(var(--th-elevated) / <alpha-value>)',
          border: 'rgb(var(--th-border) / <alpha-value>)',
          'border-sub': 'rgb(var(--th-border-sub) / <alpha-value>)',
          text: 'rgb(var(--th-text) / <alpha-value>)',
          'text-sub': 'rgb(var(--th-text-sub) / <alpha-value>)',
          'text-dim': 'rgb(var(--th-text-dim) / <alpha-value>)',
          accent: 'rgb(var(--th-accent) / <alpha-value>)',
          'accent-h': 'rgb(var(--th-accent-h) / <alpha-value>)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'slide-up': 'slideUp 0.5s ease-out both',
        'scale-in': 'scaleIn 0.4s ease-out both',
        'modal-up': 'modalUp 0.35s cubic-bezier(0.32,0.72,0,1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        modalUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
