/**
 * StatusChip — single unified badge for ALL status types in the system.
 *
 * Usage:
 *   <StatusChip status="SCHEDULED" type="appt" />
 *   <StatusChip status="PAID"      type="bill" />
 *   <StatusChip status="ACTIVE"    type="user" />
 *
 * type: 'appt' | 'bill' | 'user'   (defaults to auto-detect)
 */

const APPT = {
  SCHEDULED:   { cls:'bg-blue-100 text-blue-700',       dot:'bg-blue-500'    },
  CONFIRMED:   { cls:'bg-emerald-100 text-emerald-700', dot:'bg-emerald-500' },
  IN_PROGRESS: { cls:'bg-amber-100 text-amber-700',     dot:'bg-amber-500'   },
  COMPLETED:   { cls:'bg-teal-100 text-teal-700',       dot:'bg-teal-500'    },
  CANCELLED:   { cls:'bg-red-100 text-red-700',         dot:'bg-red-500'     },
  NO_SHOW:     { cls:'bg-slate-100 text-slate-600',     dot:'bg-slate-400'   },
}

const BILL = {
  UNPAID:        { cls:'bg-red-100 text-red-700',         dot:'bg-red-500',     icon:'⚠' },
  PARTIALLY_PAID:{ cls:'bg-amber-100 text-amber-700',     dot:'bg-amber-500',   icon:'◑' },
  PAID:          { cls:'bg-emerald-100 text-emerald-700', dot:'bg-emerald-500', icon:'✓' },
  CANCELLED:     { cls:'bg-slate-100 text-slate-500',     dot:'bg-slate-400',   icon:'✕' },
}

const USER = {
  ACTIVE:    { cls:'bg-emerald-100 text-emerald-700', dot:'bg-emerald-500' },
  INACTIVE:  { cls:'bg-slate-100 text-slate-600',     dot:'bg-slate-400'   },
  SUSPENDED: { cls:'bg-red-100 text-red-700',         dot:'bg-red-500'     },
}

const ALL_MAPS = { appt: APPT, bill: BILL, user: USER }

function autoType(status) {
  if (status in APPT) return 'appt'
  if (status in BILL) return 'bill'
  if (status in USER) return 'user'
  return 'appt'
}

export default function StatusChip({
  status,
  type,                // 'appt' | 'bill' | 'user'
  showDot  = false,    // animated leading dot
  showIcon = false,    // bill icon (⚠ ◑ ✓ ✕)
  size     = 'sm',     // 'xs' | 'sm'
}) {
  const resolvedType = type || autoType(status)
  const map   = ALL_MAPS[resolvedType] || APPT
  const meta  = map[status] || { cls:'bg-slate-100 text-slate-600', dot:'bg-slate-400' }
  const label = status?.replace(/_/g, ' ') || '—'
  const textSize = size === 'xs' ? 'text-[10px]' : 'text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold ${textSize} ${meta.cls}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />}
      {showIcon && meta.icon && <span className="text-[10px] leading-none">{meta.icon}</span>}
      {label}
    </span>
  )
}
