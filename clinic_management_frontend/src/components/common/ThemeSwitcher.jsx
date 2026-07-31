import { useTheme } from '../../context/ThemeContext'

export default function ThemeSwitcher({ className = '' }) {
  const { isDark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 outline-none
        ${isDark ? 'bg-brand-600' : 'bg-slate-200'} ${className}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 flex items-center justify-center text-[10px]
        ${isDark ? 'translate-x-5' : 'translate-x-0'}`}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
