/**
 * Table — enhanced universal table component.
 *
 * columns: Array<{
 *   key?:       string          — row[key] for plain value
 *   label:      string          — header text
 *   render?:    (row) => ReactNode  — custom cell renderer
 *   headerClass?: string        — extra th classes
 *   cellClass?:   string        — extra td classes
 *   sortable?:  boolean         — enables click-to-sort header
 *   align?:     'left'|'right'|'center'
 * }>
 *
 * data:         array of row objects (must have .id or array index used as key)
 * loading:      boolean
 * emptyIcon:    emoji for EmptyState (default '📭')
 * emptyMessage: string
 * onRowClick:   (row) => void   — make rows clickable
 *
 * Sorting is client-side; parent can also handle via sortKey/sortDir/onSort.
 */
import { useState } from 'react'
import Spinner from './Spinner'

export default function Table({
  columns      = [],
  data         = [],
  loading      = false,
  emptyIcon    = '📭',
  emptyMessage = 'No data found',
  onRowClick,
  rowClassName,   // (row) => string  — per-row class override
  stickyHeader = false,
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (col) => {
    if (!col.sortable) return
    if (sortKey === col.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(col.key); setSortDir('asc') }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const va = a[sortKey] ?? ''
        const vb = b[sortKey] ?? ''
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  const alignClass = { left:'text-left', center:'text-center', right:'text-right' }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className={`bg-slate-50 border-b border-slate-100 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            {columns.map((col, i) => (
              <th
                key={col.key || col.label || i}
                onClick={() => handleSort(col)}
                className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
                  ${alignClass[col.align] || 'text-left'}
                  ${col.sortable ? 'cursor-pointer select-none hover:text-slate-700 hover:bg-slate-100 transition-colors' : ''}
                  ${col.headerClass || ''}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="text-slate-300 text-[10px] flex flex-col leading-none">
                      <span className={sortKey === col.key && sortDir === 'asc'  ? 'text-brand-600' : ''}>▲</span>
                      <span className={sortKey === col.key && sortDir === 'desc' ? 'text-brand-600' : ''}>▼</span>
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <Spinner size="md"/>
                  <span className="text-sm">Loading…</span>
                </div>
              </td>
            </tr>
          ) : !sorted.length ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <span className="text-4xl block mb-2">{emptyIcon}</span>
                <span className="text-slate-400 text-sm">{emptyMessage}</span>
              </td>
            </tr>
          ) : sorted.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-slate-50 transition-colors
                ${onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/50'}
                ${rowClassName ? rowClassName(row) : ''}
              `}
            >
              {columns.map((col, j) => (
                <td
                  key={col.key || col.label || j}
                  className={`px-4 py-3 text-slate-700
                    ${alignClass[col.align] || 'text-left'}
                    ${col.cellClass || ''}
                  `}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
