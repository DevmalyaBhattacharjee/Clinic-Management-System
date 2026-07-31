import { useRef, useState } from 'react'
import { initials } from '../../utils/helpers'

const COLORS = ['bg-brand-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-teal-500']
const colorFor = (name='') => COLORS[name.charCodeAt(0) % COLORS.length]

/**
 * Avatar — initials fallback + optional image upload.
 *
 * Props:
 *   name, size, className
 *   src        — image URL (if provided, shows image instead of initials)
 *   editable   — shows upload overlay on hover
 *   onUpload   — (file: File, dataUrl: string) => void
 */
export default function Avatar({ name='', size='md', className='', src, editable=false, onUpload }) {
  const [imgSrc, setImgSrc] = useState(src || null)
  const [hovering, setHovering] = useState(false)
  const fileRef = useRef(null)

  const sizes = {
    xs:  'w-6 h-6 text-[10px]',
    sm:  'w-7 h-7 text-xs',
    md:  'w-9 h-9 text-sm',
    lg:  'w-11 h-11 text-base',
    xl:  'w-14 h-14 text-lg',
    '2xl':'w-20 h-20 text-2xl',
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setImgSrc(dataUrl)
      onUpload?.(file, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      className={`${sizes[size] || sizes.md} relative rounded-full flex-shrink-0 ${className}
        ${editable ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => editable && setHovering(true)}
      onMouseLeave={() => editable && setHovering(false)}
      onClick={() => editable && fileRef.current?.click()}
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      onKeyDown={e => editable && e.key === 'Enter' && fileRef.current?.click()}
      aria-label={editable ? 'Upload profile picture' : name}
    >
      {imgSrc ? (
        <img src={imgSrc} alt={name}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImgSrc(null)}
        />
      ) : (
        <div className={`w-full h-full ${colorFor(name)} rounded-full flex items-center justify-center text-white font-semibold`}>
          {initials(name) || '?'}
        </div>
      )}

      {/* Upload overlay */}
      {editable && hovering && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
      )}

      {editable && (
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
      )}
    </div>
  )
}
