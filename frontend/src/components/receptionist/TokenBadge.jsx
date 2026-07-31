export default function TokenBadge({ token, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-xl' }
  return (
    <div className={`${sizes[size]} bg-brand-100 text-brand-700 font-black rounded-xl flex items-center justify-center flex-shrink-0`}>
      #{token}
    </div>
  )
}
