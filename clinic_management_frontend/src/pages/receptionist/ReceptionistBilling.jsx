import { useState, useCallback, useMemo } from 'react'
import { useApi, useMutation } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import StatusChip from '../../components/common/StatusChip'
import PatientSearchBox from '../../components/receptionist/PatientSearchBox'
import Avatar from '../../components/common/Avatar'
import { useToast } from '../../context/ToastContext'
import { useNotify } from '../../hooks/useNotify'
import receptionistService from '../../services/receptionistService'
import { formatDate, formatCurrency, getErrorMessage } from '../../utils/helpers'
import { validate, required } from '../../utils/validation'
import Pagination from '../../components/common/Pagination'
import Spinner from '../../components/common/Spinner'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE  = 10
const TODAY     = new Date().toISOString().split('T')[0]
const PAY_OPTS  = ['CASH','CARD','UPI','NET_BANKING','INSURANCE'].map(v=>({ value:v, label:v }))
const PAY_ICONS = { CASH:'💵', CARD:'💳', UPI:'📱', NET_BANKING:'🏦', INSURANCE:'🛡️' }

export default function ReceptionistBilling() {
  useTitle('Billing')
  const { notify, notifyError } = useNotify()

  const { data: bills=[],      loading:lb,  execute:reloadBills  } = useApi(useCallback(() => receptionistService.getBills(),       []))
  const { data: todayBills=[], loading:ltb, execute:reloadToday  } = useApi(useCallback(() => receptionistService.getTodayBills(),  []))
  const { data: unpaid=[],     loading:lu,  execute:reloadUnpaid } = useApi(useCallback(() => receptionistService.getUnpaidBills(), []), { initialData: [] })

  const [tab,       setTab]      = useState('today')  // 'today' | 'all' | 'unpaid'
  const [search,    setSearch]   = useState('')
  const [page,      setPage]     = useState(1)
  const [createOpen,setCreateOpen]=useState(false)
  const [payOpen,   setPayOpen]  = useState(null)    // bill object
  const [viewBill,  setViewBill] = useState(null)
  const [selPatient,setSelPatient]=useState(null)
  const [patientAppts, setPatientAppts]=useState([])
  const [outstanding,  setOutstanding]=useState(null)

  /* Bill creation form */
  const [billForm, setBillForm] = useState({
    patientId:'', appointmentId:'', billDate:TODAY,
    consultationFee:'', medicationCost:'', labCharges:'',
    otherCharges:'', discount:'', tax:'', notes:'',
  })
  const [billErrors, setBillErrors] = useState({})

  /* Payment form */
  const [payForm, setPayForm] = useState({
    status:'PAID', paymentMethod:'CASH', paymentDate:TODAY, transactionId:'', notes:'',
  })

  const { mutate: createBill,  loading: creating  } = useMutation(useCallback(d   => receptionistService.createBill(d),     []))
  const { mutate: updatePay,   loading: paying     } = useMutation(useCallback((id,d) => receptionistService.updatePayment(id,d), []))

  const rawList = tab==='today' ? todayBills : tab==='unpaid' ? unpaid : bills
  const loading = tab==='today' ? ltb : tab==='unpaid' ? lu : lb

  const filtered = useMemo(() => {
    if (!search.trim()) return rawList
    const q = search.toLowerCase()
    return rawList.filter(b =>
      b.billNumber?.toLowerCase().includes(q) ||
      b.patientName?.toLowerCase().includes(q) ||
      b.patientNumber?.toLowerCase().includes(q)
    )
  }, [rawList, search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const todayRev    = useMemo(() => (todayBills || []).filter(b=>b.status==='PAID').reduce((s,b)=>s+(b.finalAmount||0),0), [todayBills])
  const unpaidTotal = useMemo(() => (unpaid || []).reduce((s,b)=>s+(b.finalAmount||0),0), [unpaid])

  /* Live fee calculation */
  const calcTotal = useMemo(() => {
    const f = billForm
    const sub = (parseFloat(f.consultationFee)||0)+(parseFloat(f.medicationCost)||0)+(parseFloat(f.labCharges)||0)+(parseFloat(f.otherCharges)||0)
    return sub - (parseFloat(f.discount)||0) + (parseFloat(f.tax)||0)
  }, [billForm])

  const setBF  = k => e => { setBillForm(f=>({...f,[k]:e.target.value})); if(billErrors[k]) setBillErrors(er=>{const n={...er};delete n[k];return n}) }
  const setPF  = k => e => setPayForm(f=>({...f,[k]:e.target.value}))

  const openCreate = () => {
    setSelPatient(null); setPatientAppts([]); setOutstanding(null)
    setBillForm({ patientId:'', appointmentId:'', billDate:TODAY, consultationFee:'', medicationCost:'', labCharges:'', otherCharges:'', discount:'', tax:'', notes:'' })
    setBillErrors({}); setCreateOpen(true)
  }

  const handlePatientSelect = async (p) => {
    setSelPatient(p)
    setBillForm(f=>({...f,patientId:p.id}))
    try {
      const [appts, out] = await Promise.all([
        receptionistService.getAppointmentsByPatient(p.id),
        receptionistService.getPatientOutstanding(p.id),
      ])
      setPatientAppts(appts.data || [])
      setOutstanding(out.data ?? 0)
    } catch { setPatientAppts([]); setOutstanding(null) }
  }

  const handleCreateBill = async e => {
    e.preventDefault()
    const errs = validate(billForm, { patientId:[required('Patient')], billDate:[required('Bill date')] })
    if (!selPatient) errs.patient = 'Select a patient'
    if (Object.keys(errs).length) { setBillErrors(errs); return }
    try {
      await createBill({
        patientId:       selPatient.id,
        appointmentId:   billForm.appointmentId ? +billForm.appointmentId : undefined,
        billDate:        billForm.billDate,
        consultationFee: parseFloat(billForm.consultationFee)||undefined,
        medicationCost:  parseFloat(billForm.medicationCost)||undefined,
        labCharges:      parseFloat(billForm.labCharges)||undefined,
        otherCharges:    parseFloat(billForm.otherCharges)||undefined,
        discount:        parseFloat(billForm.discount)||undefined,
        tax:             parseFloat(billForm.tax)||undefined,
        notes:           billForm.notes||undefined,
      })
      notify('Bill created', { type:'billing', title:'Bill created', body:`Patient billed ${billForm.consultationFee ? '₹'+parseFloat(billForm.consultationFee) : ''}` })
      setCreateOpen(false); reloadBills(); reloadToday(); reloadUnpaid()
    } catch (err) { notifyError(getErrorMessage(err)) }
  }

  const openPayment = (bill) => {
    setPayOpen(bill)
    setPayForm({ status:'PAID', paymentMethod:'CASH', paymentDate:TODAY, transactionId:'', notes:'' })
  }

  const handlePayment = async e => {
    e.preventDefault()
    try {
      await updatePay(payOpen.id, {
        status:         payForm.status,
        paymentMethod:  payForm.paymentMethod || undefined,
        paymentDate:    payForm.paymentDate   || undefined,
        transactionId:  payForm.transactionId || undefined,
        notes:          payForm.notes         || undefined,
      })
      notify('Payment recorded', { type:'billing', title:'Payment collected', body:`${payForm.paymentMethod || ''} payment confirmed` })
      setPayOpen(null); reloadBills(); reloadToday(); reloadUnpaid()
    } catch (err) { notifyError(getErrorMessage(err)) }
  }

  const reloadAll = () => { reloadBills(); reloadToday(); reloadUnpaid() }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Billing"
        subtitle="Create bills and collect payments"
        action={<Button onClick={openCreate}>+ Create Bill</Button>}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Today's Revenue", value:formatCurrency(todayRev),    color:'bg-emerald-50 text-emerald-700 border-emerald-100' },
          { label:"Today's Bills",   value:todayBills.length,           color:'bg-brand-50 text-brand-700 border-brand-100'       },
          { label:'Unpaid Bills',    value:unpaid.length,               color:unpaid.length?'bg-red-50 text-red-700 border-red-100':'bg-slate-50 text-slate-600 border-slate-200' },
          { label:'Outstanding',     value:formatCurrency(unpaidTotal), color:unpaidTotal>0?'bg-red-50 text-red-700 border-red-100':'bg-teal-50 text-teal-700 border-teal-100' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-xl px-4 py-3 ${color}`}>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[['today','Today'],['unpaid','Unpaid'],['all','All']].map(([v,l]) => (
            <button key={v} onClick={()=>{setTab(v);setPage(1)}}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab===v?'bg-white text-slate-800 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search bill number patient…" className="input pl-10"/>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Bill No.','Patient','Date','Consult.','Total','Final','Payment','Status',''].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-14 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="md"/><span className="text-sm">Loading…</span></div>
                </td></tr>
              ) : !paginated.length ? (
                <tr><td colSpan={9} className="py-14 text-center">
                  <p className="text-4xl mb-2">🧾</p>
                  <p className="text-slate-400">{search ? 'No bills match' : 'No bills found'}</p>
                </td></tr>
              ) : paginated.map(b => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={()=>setViewBill(b)}>
                  <td className="px-4 py-3"><code className="text-xs font-mono font-semibold text-slate-700">{b.billNumber}</code></td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{b.patientName}</p>
                    <p className="text-xs text-slate-400">{b.patientNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(b.billDate)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatCurrency(b.consultationFee)}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(b.finalAmount)}</td>
                  <td className="px-4 py-3">
                    {b.paymentMethod
                      ? <span className="text-xs">{PAY_ICONS[b.paymentMethod]} {b.paymentMethod}</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3"><StatusChip status={b.status}/></td>
                  <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
                    {(b.status==='UNPAID'||b.status==='PARTIALLY_PAID') && (
                      <button onClick={()=>openPayment(b)} className="btn btn-primary btn-sm whitespace-nowrap">Collect</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage}/>
      </div>

      {/* ── Create Bill Modal ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Bill" size="xl">
        <form onSubmit={handleCreateBill} className="space-y-4">
          {/* Patient */}
          <div>
            <label className="label">Patient <span className="text-red-500">*</span></label>
            {selPatient ? (
              <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-xl border border-brand-200">
                <Avatar name={selPatient.name} size="sm"/>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{selPatient.name}</p>
                  <p className="text-xs text-slate-400">{selPatient.patientNumber}</p>
                  {outstanding !== null && outstanding > 0 && (
                    <p className="text-xs text-red-600 font-semibold">Outstanding: {formatCurrency(outstanding)}</p>
                  )}
                </div>
                <button type="button" onClick={()=>{setSelPatient(null);setPatientAppts([]);setOutstanding(null)}} className="text-slate-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            ) : (
              <div>
                <PatientSearchBox onSelect={handlePatientSelect}/>
                {billErrors.patient && <p className="mt-1 text-xs text-red-500">⚠ {billErrors.patient}</p>}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Appointment (optional) */}
            {patientAppts.length > 0 && (
              <div className="sm:col-span-2">
                <label className="label">Link Appointment <span className="text-slate-400 font-normal">(optional)</span></label>
                <select value={billForm.appointmentId} onChange={setBF('appointmentId')} className="input">
                  <option value="">No appointment linked</option>
                  {patientAppts.slice(0,10).map(a=>(
                    <option key={a.id} value={a.id}>#{a.tokenNumber} — {a.doctorName} · {formatDate(a.appointmentDate)}</option>
                  ))}
                </select>
              </div>
            )}
            <Input label="Bill Date" type="date" name="billDate" value={billForm.billDate} onChange={setBF('billDate')} error={billErrors.billDate} required/>
            <div/>
            {/* Fee fields */}
            {[
              ['Consultation Fee', 'consultationFee'],
              ['Medication Cost',  'medicationCost' ],
              ['Lab Charges',      'labCharges'     ],
              ['Other Charges',    'otherCharges'   ],
              ['Discount (−)',     'discount'       ],
              ['Tax (+)',          'tax'            ],
            ].map(([l,k]) => (
              <div key={k}>
                <label className="label">{l} <span className="text-slate-400 font-normal">(₹)</span></label>
                <input type="number" min="0" step="0.01" value={billForm[k]} onChange={setBF(k)} placeholder="0" className="input"/>
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea value={billForm.notes} onChange={setBF('notes')} rows={2} className="input resize-none" placeholder="Optional billing notes…"/>
            </div>
          </div>

          {/* Live total */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-50 to-emerald-50 rounded-xl border border-brand-100">
            <div>
              <p className="text-sm text-slate-500">Calculated Total</p>
              <p className="text-2xl font-black text-brand-700">{formatCurrency(calcTotal)}</p>
            </div>
            <div className="text-xs text-slate-500 text-right">
              <p>Sub: {formatCurrency((parseFloat(billForm.consultationFee)||0)+(parseFloat(billForm.medicationCost)||0)+(parseFloat(billForm.labCharges)||0)+(parseFloat(billForm.otherCharges)||0))}</p>
              <p>Disc: −{formatCurrency(parseFloat(billForm.discount)||0)}</p>
              <p>Tax: +{formatCurrency(parseFloat(billForm.tax)||0)}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={()=>setCreateOpen(false)} type="button">Cancel</Button>
            <Button type="submit" loading={creating}>Create Bill</Button>
          </div>
        </form>
      </Modal>

      {/* ── Collect Payment Modal ── */}
      <Modal open={!!payOpen} onClose={()=>setPayOpen(null)} title={`Collect Payment — ${payOpen?.billNumber}`} size="md">
        {payOpen && (
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-slate-800">{payOpen.patientName}</p>
                <StatusChip status={payOpen.status}/>
              </div>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(payOpen.finalAmount)}</p>
              <p className="text-xs text-slate-400 mt-0.5">Amount to collect</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Payment Status <span className="text-red-500">*</span></label>
                <select value={payForm.status} onChange={setPF('status')} className="input">
                  <option value="PAID">PAID</option>
                  <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select value={payForm.paymentMethod} onChange={setPF('paymentMethod')} className="input">
                  <option value="">Select…</option>
                  {PAY_OPTS.map(o=><option key={o.value} value={o.value}>{PAY_ICONS[o.value]} {o.label}</option>)}
                </select>
              </div>
              <Input label="Payment Date" type="date" name="paymentDate" value={payForm.paymentDate} onChange={setPF('paymentDate')}/>
              <Input label="Transaction ID" name="transactionId" value={payForm.transactionId} onChange={setPF('transactionId')} placeholder="Optional"/>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea value={payForm.notes} onChange={setPF('notes')} rows={2} className="input resize-none" placeholder="Payment notes…"/>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={()=>setPayOpen(null)} type="button">Cancel</Button>
              <Button type="submit" loading={paying}>Record Payment</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Bill Detail Modal ── */}
      <Modal open={!!viewBill} onClose={()=>setViewBill(null)} title="Bill Details" size="md">
        {viewBill && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <code className="text-xs font-mono font-bold text-slate-600">{viewBill.billNumber}</code>
                <p className="text-sm text-slate-400 mt-0.5">{formatDate(viewBill.billDate)}</p>
              </div>
              <StatusChip status={viewBill.status}/>
            </div>
            <div className="space-y-2">
              {[
                ['Consultation Fee',   formatCurrency(viewBill.consultationFee)],
                ['Medication Cost',    formatCurrency(viewBill.medicationCost)],
                ['Lab Charges',        formatCurrency(viewBill.labCharges)],
                ['Other Charges',      formatCurrency(viewBill.otherCharges)],
                ['Subtotal',           formatCurrency(viewBill.totalAmount)],
                ['Discount',           `− ${formatCurrency(viewBill.discount)}`],
                ['Tax',                `+ ${formatCurrency(viewBill.tax)}`],
              ].map(([l,v]) => (
                <div key={l} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0 text-sm">
                  <span className="text-slate-500">{l}</span>
                  <span className="font-medium text-slate-700">{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t-2 border-slate-200">
                <span className="font-bold text-slate-800">Total</span>
                <span className="text-xl font-black text-brand-700">{formatCurrency(viewBill.finalAmount)}</span>
              </div>
            </div>
            {viewBill.status==='PAID' && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1 text-sm">
                <p className="font-semibold text-emerald-700">Payment Info</p>
                <div className="flex justify-between"><span className="text-slate-500">Method</span><span className="font-medium">{PAY_ICONS[viewBill.paymentMethod]} {viewBill.paymentMethod}</span></div>
                {viewBill.paymentDate  && <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{formatDate(viewBill.paymentDate)}</span></div>}
                {viewBill.transactionId && <div className="flex justify-between"><span className="text-slate-500">Txn ID</span><code className="font-mono text-xs">{viewBill.transactionId}</code></div>}
              </div>
            )}
            {(viewBill.status==='UNPAID'||viewBill.status==='PARTIALLY_PAID') && (
              <Button onClick={()=>{setViewBill(null);openPayment(viewBill)}} className="w-full">Collect Payment</Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
