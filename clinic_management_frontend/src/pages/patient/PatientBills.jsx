import { useState, useCallback, useMemo } from 'react'
import { useApi } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import StatusChip from '../../components/common/StatusChip'
import patientService from '../../services/patientService'
import { formatDate, formatCurrency } from '../../utils/helpers'
import Pagination from '../../components/common/Pagination'
import Spinner from '../../components/common/Spinner'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE = 10
const PAYMENT_ICONS = { CASH:'💵', CARD:'💳', UPI:'📱', NET_BANKING:'🏦', INSURANCE:'🛡️' }

function BillDetailRow({ label, value, bold, color }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 ${color || ''}`}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{value}</span>
    </div>
  )
}

export default function PatientBills() {
  useTitle('Bills & Payments')
  const { data: bills       = [], loading: lb } = useApi(useCallback(() => patientService.getBills(),       []), { initialData: [] })
  const { data: outstanding,      loading: lo } = useApi(useCallback(() => patientService.getOutstanding(), []), { initialData: [] })

  const [filter,   setFilter]   = useState('ALL')
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [selected, setSelected] = useState(null)

  const paid    = useMemo(() => bills.filter(b=>b.status==='PAID'),                                      [bills])
  const unpaid  = useMemo(() => bills.filter(b=>b.status==='UNPAID'||b.status==='PARTIALLY_PAID'),        [bills])
  const totalSpent = useMemo(() => paid.reduce((s,b)=>s+(b.finalAmount||0), 0),                          [paid])

  const filtered = useMemo(() => {
    let list = (Array.isArray(bills) ? bills : [])
    if (filter === 'UNPAID')  list = bills.filter(b=>b.status==='UNPAID'||b.status==='PARTIALLY_PAID')
    if (filter === 'PAID')    list = paid
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b => b.billNumber?.toLowerCase().includes(q))
    }
    return [...list].sort((a,b)=>b.billDate?.localeCompare(a.billDate))
  }, [bills, filter, search, paid])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  return (
    <div className="space-y-5">
      <PageHeader title="Bills & Payments" subtitle="Your complete billing history"/>

      {/* Outstanding banner */}
      {(outstanding ?? 0) > 0 && (
        <div className="flex items-center gap-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">⚠️</div>
          <div className="flex-1">
            <p className="font-bold text-red-700 text-lg">{formatCurrency(outstanding)} outstanding</p>
            <p className="text-sm text-red-500">Please contact reception to clear your dues</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-red-400">{unpaid.length} unpaid bill{unpaid.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Total Bills',    value: bills.length,           color:'bg-brand-50 text-brand-700 border-brand-100'   },
          { label:'Paid',           value: paid.length,            color:'bg-emerald-50 text-emerald-700 border-emerald-100'},
          { label:'Unpaid',         value: unpaid.length,          color: unpaid.length ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-200' },
          { label:'Total Paid',     value: formatCurrency(totalSpent), color:'bg-teal-50 text-teal-700 border-teal-100'   },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-xl px-4 py-3 ${color}`}>
            <p className="text-xl font-bold">{lb ? '…' : value}</p>
            <p className="text-xs mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[['ALL','All'],['UNPAID','Unpaid'],['PAID','Paid']].map(([v,l]) => (
            <button key={v} onClick={()=>{setFilter(v);setPage(1)}}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                ${filter===v?'bg-white text-slate-800 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder="Search bill number…" className="input pl-10"/>
        </div>
      </div>

      {/* Bill table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Bill No.','Date','Consultation','Total','Final Amount','Payment','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lb ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="md"/><span className="text-sm">Loading…</span></div>
                </td></tr>
              ) : !paginated.length ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <p className="text-4xl mb-2">🧾</p>
                  <p className="text-slate-400">{search||filter!=='ALL' ? 'No bills match your filters' : 'No bills yet'}</p>
                </td></tr>
              ) : paginated.map(b => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => setSelected(b)}>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono font-semibold text-slate-700">{b.billNumber}</code>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(b.billDate)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatCurrency(b.consultationFee)}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(b.finalAmount)}</td>
                  <td className="px-4 py-3">
                    {b.paymentMethod
                      ? <span className="flex items-center gap-1 text-slate-600 text-xs">{PAYMENT_ICONS[b.paymentMethod]} {b.paymentMethod}</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3"><StatusChip status={b.status}/></td>
                  <td className="px-4 py-3">
                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage}/>
      </div>

      {/* Bill detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Bill Details" size="md">
        {selected && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <code className="text-xs font-mono font-bold text-slate-600">{selected.billNumber}</code>
                <p className="text-sm text-slate-400 mt-0.5">{formatDate(selected.billDate)}</p>
              </div>
              <StatusChip status={selected.status}/>
            </div>

            {/* Fee breakdown */}
            <div className="bg-white border border-slate-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Fee Breakdown</p>
              {[
                ['Consultation Fee',  formatCurrency(selected.consultationFee),
                false],
                ['Medication Cost',   formatCurrency(selected.medicationCost),
                false],
                ['Lab Charges',       formatCurrency(selected.labCharges),
                false],
                ['Other Charges',     formatCurrency(selected.otherCharges),
                false],
                ['Subtotal',          formatCurrency(selected.totalAmount),
                true],
                ['Discount',          `− ${formatCurrency(selected.discount)}`,  false, 'text-emerald-600'],
                ['Tax',               `+ ${formatCurrency(selected.tax)}`,       false, 'text-slate-500'],
              ].map(([l,v,bold,cls]) => (
                <div key={l} className={`flex justify-between py-2 border-b border-slate-50 last:border-0 ${cls||''}`}>
                  <span className="text-sm text-slate-500">{l}</span>
                  <span className={`text-sm ${bold?'font-bold text-slate-800':'font-medium text-slate-700'}`}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-1 border-t-2 border-slate-200">
                <span className="font-bold text-slate-800">Total Amount</span>
                <span className="text-xl font-black text-brand-700">{formatCurrency(selected.finalAmount)}</span>
              </div>
            </div>

            {/* Payment info */}
            {selected.status === 'PAID' && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <p className="text-xs font-semibold text-emerald-600 mb-2">Payment Information</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Method</span>
                    <span className="font-medium">{PAYMENT_ICONS[selected.paymentMethod]} {selected.paymentMethod}</span>
                  </div>
                  {selected.paymentDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Paid on</span>
                      <span className="font-medium">{formatDate(selected.paymentDate)}</span>
                    </div>
                  )}
                  {selected.transactionId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Transaction ID</span>
                      <code className="font-mono text-xs">{selected.transactionId}</code>
                    </div>
                  )}
                </div>
              </div>
            )}
            {selected.status !== 'PAID' && selected.status !== 'CANCELLED' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="font-semibold text-amber-700 text-sm">Payment Pending</p>
                <p className="text-xs text-amber-500 mt-0.5">Please visit the reception desk to complete your payment.</p>
              </div>
            )}
            {selected.notes && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Notes</p>
                <p className="text-sm text-slate-700">{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
