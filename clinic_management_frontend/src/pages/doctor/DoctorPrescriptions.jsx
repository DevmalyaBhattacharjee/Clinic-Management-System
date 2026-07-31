import { useState, useCallback, useMemo } from 'react'
import { useApi, useMutation } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import SearchBar from '../../components/common/SearchBar'
import { useToast } from '../../context/ToastContext'
import doctorService from '../../services/doctorService'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { validate, required} from '../../utils/validation'
import Pagination from '../../components/common/Pagination'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE = 10

const BLANK_CREATE = {
  patientId:'', medicalRecordId:'', prescriptionDate: new Date().toISOString().split('T')[0],
  medicationName:'', dosage:'', frequency:'', duration:'',
  route:'Oral', instructions:'', precautions:'',
}
const BLANK_UPDATE = { dosage:'', frequency:'', duration:'', instructions:'', precautions:'' }
const createRules = {
  patientId:      [required('Patient')],
  prescriptionDate:[required('Date')],
  medicationName: [required('Medication name')],
  dosage:         [required('Dosage')],
  frequency:      [required('Frequency')],
  duration:       [required('Duration')],
}

const FREQUENCY_OPTS = [
  'Once daily','Twice daily','Three times daily','Four times daily',
  'Every 4 hours','Every 6 hours','Every 8 hours','Every 12 hours',
  'Once weekly','As needed (PRN)',
].map(v => ({ value:v, label:v }))

const ROUTE_OPTS = ['Oral','Topical','Intravenous','Intramuscular','Subcutaneous','Inhaled','Sublingual','Rectal','Nasal']
  .map(v => ({ value:v, label:v }))

export default function DoctorPrescriptions() {
  useTitle('Prescriptions')
  const { addToast } = useToast()

  const { data: prescriptions = [], loading, execute: reload } = useApi(
    useCallback(() => doctorService.getPrescriptions(), [])
  , { initialData: [] })
  const { data: patients = [] } = useApi(
    useCallback(() => doctorService.getPatients(), [])
  , { initialData: [] })

  const [search,      setSearch]      = useState('')
  const [activeFilter,setActiveFilter]= useState('ALL')   // ALL | ACTIVE | INACTIVE
  const [page,        setPage]        = useState(1)
  const [createOpen,  setCreateOpen]  = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [deactivateId,setDeactivateId]= useState(null)
  const [form,        setForm]        = useState(BLANK_CREATE)
  const [editForm,    setEditForm]    = useState(BLANK_UPDATE)
  const [errors,      setErrors]      = useState({})

  const { mutate: createPrx, loading: creating } = useMutation(
    useCallback(data => doctorService.createPrescription(data), [])
  )
  const { mutate: updatePrx, loading: updating } = useMutation(
    useCallback((id,data) => doctorService.updatePrescription(id,data), [])
  )
  const { mutate: deactivatePrx, loading: deactivating } = useMutation(
    useCallback(id => doctorService.deactivatePrescription(id), [])
  )

  const filtered = useMemo(() => {
    let list = (Array.isArray(prescriptions) ? prescriptions : [])
    if (activeFilter === 'ACTIVE')   list = list.filter(p => p.isActive)
    if (activeFilter === 'INACTIVE') list = list.filter(p => !p.isActive)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.patientName?.toLowerCase().includes(q) ||
        p.medicationName?.toLowerCase().includes(q)
      )
    }
    return list
  }, [prescriptions, activeFilter, search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const activeCount   = useMemo(() => prescriptions.filter(p => p.isActive).length, [prescriptions])
  const inactiveCount = useMemo(() => prescriptions.filter(p => !p.isActive).length, [prescriptions])

  const setF  = k => e => { setForm(f=>({...f,[k]:e.target.value})); if(errors[k]) setErrors(er=>({...er,[k]:''})) }
  const setEF = k => e => setEditForm(f=>({...f,[k]:e.target.value}))

  const openEdit = p => {
    setEditTarget(p)
    setEditForm({ dosage:p.dosage||'', frequency:p.frequency||'', duration:p.duration?.toString()||'', instructions:p.instructions||'', precautions:p.precautions||'' })
  }

  const handleCreate = async e => {
    e.preventDefault()
    const errs = validate(form, createRules)
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await createPrx({ ...form, patientId:+form.patientId, duration:+form.duration, medicalRecordId:form.medicalRecordId?+form.medicalRecordId:undefined })
      addToast('Prescription issued', 'success')
      setCreateOpen(false); setForm(BLANK_CREATE); setErrors({}); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const handleUpdate = async e => {
    e.preventDefault()
    try {
      await updatePrx(editTarget.id, { ...editForm, duration:editForm.duration?+editForm.duration:undefined })
      addToast('Prescription updated', 'success')
      setEditTarget(null); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const handleDeactivate = async () => {
    try {
      await deactivatePrx(deactivateId)
      addToast('Prescription deactivated', 'success')
      setDeactivateId(null); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Prescriptions"
        subtitle={`${prescriptions.length} total · ${activeCount} active`}
        action={<Button onClick={() => { setCreateOpen(true); setForm(BLANK_CREATE); setErrors({}) }}>+ Issue Prescription</Button>}
      />

      {/* Summary, cards */}
      <div className="grid grid-cols-3 gap-3">
        {[['Total',prescriptions.length,'bg-brand-50 text-brand-700 border-brand-100'],['Active',activeCount,'bg-emerald-50 text-emerald-700 border-emerald-100'],['Ended',inactiveCount,'bg-slate-50 text-slate-600 border-slate-200']].map(([l,v,c]) => (
          <div key={l} className={`border rounded-xl px-4 py-3 ${c}`}>
            <p className="text-2xl font-bold">{loading ? '…' : v}</p>
            <p className="text-xs mt-0.5 opacity-70">{l}</p>
          </div>
        ))}
      </div>

      <SearchBar value={search} onChange={v=>{setSearch(v);setPage(1)}} placeholder="Search patient or medication…">
        <div className="flex gap-2">
          {['ALL','ACTIVE','INACTIVE'].map(f => (
            <button key={f} onClick={() => { setActiveFilter(f); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${activeFilter===f ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </SearchBar>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Patient','Medication','Dosage','Frequency','Duration','Date','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="md"/><span className="text-sm">Loading…</span></div>
                </td></tr>
              ) : !paginated.length ? (
                <tr><td colSpan={8} className="py-16 text-center"><EmptyState icon="💊" title="{search || activeFilter !== 'ALL' ? 'No prescriptions match' : 'No prescriptions issued yet'}"/></td></tr>
              ) : paginated.map(p => (
                <tr key={p.id} className={`border-b border-slate-50 transition-colors ${p.isActive ? 'hover:bg-slate-50/70' : 'opacity-60 hover:bg-slate-50/40'}`}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{p.patientName}</p>
                    <p className="text-xs text-slate-400">ID #{p.patientId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-700">{p.medicationName}</p>
                    {p.route && <p className="text-xs text-slate-400">{p.route}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{p.dosage}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{p.frequency}</td>
                  <td className="px-4 py-3 text-slate-600">{p.duration}d</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(p.prescriptionDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.isActive ? 'badge-green' : 'badge-slate'}`}>{p.isActive ? 'Active' : 'Ended'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} title="Edit"
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      {p.isActive && (
                        <button onClick={() => setDeactivateId(p.id)} title="Deactivate"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage}/>
      </div>

      {/* Create, Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Issue Prescription" size="lg">
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Patient <span className="text-red-500">*</span></label>
            <select value={form.patientId} onChange={e=>{setForm(f=>({...f,patientId:e.target.value}));if(errors.patientId)setErrors(er=>({...er,patientId:''}))}}
              className={`input ${errors.patientId?'input-error':''}`}>
              <option value="">Select patient…</option>
              {patients.map(p=><option key={p.id} value={p.id}>{p.name} ({p.patientNumber})</option>)}
            </select>
            {errors.patientId && <p className="mt-1 text-xs text-red-500">⚠ {errors.patientId}</p>}
          </div>
          <Input label="Medical Record ID" type="number" name="medicalRecordId" value={form.medicalRecordId} onChange={setF('medicalRecordId')} placeholder="Optional"/>
          <Input label="Prescription Date" type="date" name="prescriptionDate" value={form.prescriptionDate} onChange={setF('prescriptionDate')} error={errors.prescriptionDate} required/>
          <div className="sm:col-span-2">
            <Input label="Medication Name" name="medicationName" value={form.medicationName} onChange={setF('medicationName')} error={errors.medicationName} required placeholder="e.g. Aspirin"/>
          </div>
          <Input label="Dosage" name="dosage" value={form.dosage} onChange={setF('dosage')} error={errors.dosage} required placeholder="e.g. 75mg"/>
          <Select label="Frequency" name="frequency" value={form.frequency} onChange={setF('frequency')} error={errors.frequency} options={FREQUENCY_OPTS} placeholder="Select frequency…"/>
          <Input label="Duration (days)" type="number" name="duration" value={form.duration} onChange={setF('duration')} error={errors.duration} required placeholder="30"/>
          <Select label="Route" name="route" value={form.route} onChange={setF('route')} options={ROUTE_OPTS}/>
          <div className="sm:col-span-2">
            <label className="label">Instructions</label>
            <textarea value={form.instructions} onChange={setF('instructions')} rows={2} className="input resize-none" placeholder="e.g. Take after breakfast with water"/>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Precautions</label>
            <textarea value={form.precautions} onChange={setF('precautions')} rows={2} className="input resize-none" placeholder="e.g. Avoid if allergic to NSAIDs"/>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateOpen(false)} type="button">Cancel</Button>
            <Button type="submit" loading={creating}>Issue Prescription</Button>
          </div>
        </form>
      </Modal>

      {/* Edit, Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.medicationName}`} size="md">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-sm">
            <span className="text-slate-500">Patient:</span> <span className="font-semibold">{editTarget?.patientName}</span>
            <span className="mx-2 text-slate-300">·</span>
            <span className="text-slate-500">Rx:</span> <span className="font-semibold text-brand-700">{editTarget?.medicationName}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Dosage"    name="dosage"     value={editForm.dosage}     onChange={setEF('dosage')}/>
            <Select label="Frequency" name="frequency" value={editForm.frequency}  onChange={setEF('frequency')} options={FREQUENCY_OPTS}/>
            <Input label="Duration (days)" type="number" name="duration" value={editForm.duration} onChange={setEF('duration')}/>
          </div>
          <div>
            <label className="label">Instructions</label>
            <textarea value={editForm.instructions} onChange={setEF('instructions')} rows={2} className="input resize-none"/>
          </div>
          <div>
            <label className="label">Precautions</label>
            <textarea value={editForm.precautions} onChange={setEF('precautions')} rows={2} className="input resize-none"/>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setEditTarget(null)} type="button">Cancel</Button>
            <Button type="submit" loading={updating}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deactivateId} onClose={() => setDeactivateId(null)}
        onConfirm={handleDeactivate} loading={deactivating}
        title="Deactivate Prescription"
        message="This will mark the prescription as ended. The patient will no longer see it as active."
        confirmLabel="Deactivate"
      />
    </div>
  )
}
