/**
 * Breadcrumb — new navigation trail component.
 *
 * Props:
 *   items  Array<{ label: string, to?: string }>
 *          last item is current page (no link, bold)
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: 'Dashboard', to: '/doctor/dashboard' },
 *     { label: 'Patients',  to: '/doctor/patients'  },
 *     { label: 'Alice Anderson' },
 *   ]} />
 */
import { Link } from 'react-router-dom'

export default function Breadcrumb({ items = [] }) {
  if (!items.length) return null
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-4 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            )}
            {isLast || !item.to ? (
              <span className={`font-${isLast ? 'semibold' : 'medium'} ${isLast ? 'text-slate-800' : 'text-slate-500'}`}>
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="text-brand-600 hover:text-brand-700 font-medium hover:underline transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
