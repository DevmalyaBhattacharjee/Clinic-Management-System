/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#d9e7ff',
          200: '#bcd3ff',
          300: '#8fb5fd',
          400: '#608df9',
          500: '#3b67f5',
          600: '#2347ea',
          700: '#1b35d0',
          800: '#1d2ea8',
          900: '#1e2d85',
          950: '#161d55',
        },
        slate: {
          750: '#253047',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-hover': '0 4px 16px 0 rgba(59,103,245,.12)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      animation: {
        'fade-in':  'fadeIn .35s ease',
        'slide-up': 'slideUp .4s cubic-bezier(.16,1,.3,1)',
        'spin-slow': 'spin 1.4s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
