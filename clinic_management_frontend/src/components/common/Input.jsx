import { useState } from 'react'

function EyeIcon({ open }) {
  return open
    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
}

export default function Input({ label, type='text', name, value, onChange, error, placeholder, required=false, disabled=false, className='', ...props }) {
  const [show, setShow] = useState(false)
  const inputType = type==='password' && show ? 'text' : type
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="label" htmlFor={name}>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <div className="relative">
        <input
          id={name} name={name} type={inputType} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled} required={required}
          className={`input ${error?'input-error':''} ${type==='password'?'pr-10':''}`}
          {...props}
        />
        {type==='password' && (
          <button type="button" onClick={()=>setShow(s=>!s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            <EyeIcon open={show} />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  )
}
