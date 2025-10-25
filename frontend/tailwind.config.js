/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9f1239',
          900: '#881337',
          950: '#701a75',
        },
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
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}

