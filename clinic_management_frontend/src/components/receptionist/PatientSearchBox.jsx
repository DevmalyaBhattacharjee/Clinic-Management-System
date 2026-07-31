import { useState, useEffect, useRef } from 'react'
import Avatar from '../common/Avatar'
import receptionistService from '../../services/receptionistService'

export default function PatientSearchBox({ onSelect, placeholder = 'Search patient by name or ID…', autoFocus = false }) {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [open,     setOpen]     = useState(false)
  const debounce   = useRef(null)
  const ref        = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = async (q) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await receptionistService.searchPatients(q)
      setResults(res.data || [])
    } catch { setResults([]) }
    finally { setLoading(false) }
  }

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    setOpen(true)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => search(q), 300)
  }

  const handleSelect = (p) => {
    setQuery(p.name)
    setOpen(false)
    onSelect(p)
  }

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query && setOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="input pl-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {results.map(p => (
            <button key={p.id} type="button"
              onClick={() => handleSelect(p)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 transition-colors text-left"
            >
              <Avatar name={p.name} size="sm"/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                <p className="text-xs text-slate-400">{p.patientNumber} · {p.phone}</p>
              </div>
              {p.bloodGroup && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">{p.bloodGroup}</span>
              )}
            </button>
          ))}
        </div>
      )}
      {open && query && !loading && results.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-center text-slate-400 text-sm">
          No patients found for "{query}"
        </div>
      )}
    </div>
  )
}
