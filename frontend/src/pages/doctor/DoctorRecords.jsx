import { useState, useCallback, useMemo } from 'react'
import { useApi, useMutation } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import SearchBar from '../../components/common/SearchBar'
import VitalSignsDisplay from '../../components/doctor/VitalSignsDisplay'
import doctorService from '../../services/doctorService'
import { useToast } from '../../context/ToastContext'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { validate, required } from '../../utils/validation'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE = 10

const BLANK_CREATE = {
  patientId:'', appointmentId:'', visitDate:'', chiefComplaint:'',
  symptoms:'', diagnosis:'', treatmentPlan:'', labTests:'',
  vitalSigns:'', notes:'', followUpDate:'',
}
const BLANK_UPDATE = {
  symptoms:'', diagnosis:'', treatmentPlan:'',
  labTests:'', vitalSigns:'', notes:'', followUpDate:'',
}
const createRules = {
  patientId:      [required('Patient ID')],
  visitDate:      [required('Visit date')],
  chiefComplaint: [required('Chief complaint')],
}

const VITALS_TEMPLATE = '{"bp":"","pulse":"","temp":"","weight":""}'

export default function DoctorRecords() {
  useTitle('Medical Records')
  const { addToast } = useToast()

  const { data: records = [], loading, execute: reload } = useApi(
    useCallback(() => doctorService.getMedicalRecords(), [])
  , { initialData: [] })
  const { data: patients = [] } = useApi(
    useCallback(() => doctorService.getPatients(), [])
  , { initialData: [] })

  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)
  const [form,       setForm]       = useState(BLANK_CREATE)
  const [editForm,   setEditForm]   = useState(BLANK_UPDATE)
  const [errors,     setErrors]     = useState({})

  const { mutate: createRecord, loading: creating } = useMutation(
    useCallback(data => doctorService.createMedicalRecord(data), [])
  )
  const { mutate: updateRecord, loading: updating } = useMutation(
    useCallback((id,data) => doctorService.updateMedicalRecord(id,data), [])
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return records
    const q = search.toLowerCase()
    return records.filter(r =>
      r.patientName?.toLowerCase().includes(q) ||
      r.chiefComplaint?.toLowerCase().includes(q) ||
      r.diagnosis?.toLowerCase().includes(q)
    )
  }, [records, search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const setF  = k => e => { setForm(f=>({...f,[k]:e.target.value})); if(errors[k]) setErrors(er=>({...er,[k]:''})) }
  const setEF = k => e => setEditForm(f=>({...f,[k]:e.target.value}))

  const openEdit = r => {
    setEditTarget(r)
    setEditForm({
      symptoms: r.symptoms||'', diagnosis: r.diagnosis||'',
      treatmentPlan: r.treatmentPlan||'', labTests: r.labTests||'',
      vitalSigns: r.vitalSigns||'', notes: r.notes||'',
      followUpDate: r.followUpDate||'',
    })
  }

  const handleCreate = async e => {
    e.preventDefault()
    const errs = validate(form, createRules)
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await createRecord({
        ...form,
        patientId:     +form.patientId,
        appointmentId: form.appointmentId ? +form.appointmentId : undefined,
        vitalSigns:    form.vitalSigns || undefined,
      })
      addToast('Medical record created', 'success')
      setCreateOpen(false); setForm(BLANK_CREATE); setErrors({}); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const handleUpdate = async e => {
    e.preventDefault()
    try {
      await updateRecord(editTarget.id, { ...editForm, vitalSigns: editForm.vitalSigns || undefined })
      addToast('Record updated', 'success')
      setEditTarget(null); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Medical Records"
        subtitle={`${records.length} records`}
        action={<Button onClick={() => { setCreateOpen(true); setForm(BLANK_CREATE); setErrors({}) }}>+ New Record</Button>}
      />

      <SearchBar value={search} onChange={v=>{setSearch(v);setPage(1)}} placeholder="Search by patient complaint diagnosis…"/>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Patient','Visit Date','Chief Complaint','Diagnosis','Follow-up',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/>
                    Loading records…
                  </div>
                </td></tr>
              ) : !paginated.length ? (
                <tr><td colSpan={6} className="py-16 text-center"><EmptyState icon="📋" title="{search ? 'No records match your search' : 'No medical records yet'}"/></td></tr>
              ) : paginated.map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{r.patientName}</p>
                    <p className="text-xs text-slate-400">ID #{r.patientId}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(r.visitDate)}</td>
                  <td className="px-4 py-3">
                    <span className="text-slate-700 text-xs max-w-[180px] truncate block">{r.chiefComplaint}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.diagnosis
                      ? <span className="text-brand-600 font-medium text-xs">{r.diagnosis}</span>
                      : <span className="text-slate-300 text-xs italic">Pending</span>}
                  </td>
                  <td className="px-4 py-3">
                    {r.followUpDate
                      ? <span className="badge-green badge">{formatDate(r.followUpDate)}</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewTarget(r)} title="View"
                        className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      <button onClick={() => openEdit(r)} title="Edit"
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage}/>
      </div>

      {/* ── Create, Modal ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Medical Record" size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Patient <span className="text-red-500">*</span></label>
              <select value={form.patientId} onChange={e => { setForm(f=>({...f,patientId:e.target.value})); if(errors.patientId) setErrors(er=>({...er,patientId:''})) }}
                className={`input ${errors.patientId ? 'input-error' : ''}`}>
                <option value="">Select patient…</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientNumber})</option>)}
              </select>
              {errors.patientId && <p className="mt-1 text-xs text-red-500">⚠ {errors.patientId}</p>}
            </div>
            <Input label="Appointment ID" type="number" name="appointmentId" value={form.appointmentId} onChange={setF('appointmentId')} placeholder="Optional"/>
            <Input label="Visit Date" type="date" name="visitDate" value={form.visitDate} onChange={setF('visitDate')} error={errors.visitDate} required className="sm:col-span-1"/>
            <Input label="Follow-up Date" type="date" name="followUpDate" value={form.followUpDate} onChange={setF('followUpDate')}/>
            <div className="sm:col-span-2">
              <label className="label">Chief Complaint <span className="text-red-500">*</span></label>
              <input type="text" value={form.chiefComplaint} onChange={setF('chiefComplaint')}
                placeholder="Main presenting complaint…"
                className={`input ${errors.chiefComplaint ? 'input-error' : ''}`}/>
              {errors.chiefComplaint && <p className="mt-1 text-xs text-red-500">⚠ {errors.chiefComplaint}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Symptoms</label>
              <textarea value={form.symptoms} onChange={setF('symptoms')} rows={2} className="input resize-none" placeholder="Presenting symptoms…"/>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Diagnosis</label>
              <input type="text" value={form.diagnosis} onChange={setF('diagnosis')} className="input" placeholder="ICD diagnosis…"/>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Treatment Plan</label>
              <textarea value={form.treatmentPlan} onChange={setF('treatmentPlan')} rows={2} className="input resize-none" placeholder="Prescribed treatment…"/>
            </div>
            <Input label="Lab Tests" name="labTests" value={form.labTests} onChange={setF('labTests')} placeholder="e.g. ECG Lipid Profile"/>
            <div>
              <label className="label flex items-center justify-between">
                Vital Signs (JSON)
                <button type="button" onClick={() => setForm(f=>({...f,vitalSigns:VITALS_TEMPLATE}))}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium">Use template</button>
              </label>
              <input type="text" value={form.vitalSigns} onChange={setF('vitalSigns')}
                className="input font-mono text-xs" placeholder='{"bp":"120/80","pulse":"72","temp":"98.6"}' />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea value={form.notes} onChange={setF('notes')} rows={2} className="input resize-none" placeholder="Additional notes…"/>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateOpen(false)} type="button">Cancel</Button>
            <Button type="submit" loading={creating}>Create Record</Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit, Modal ── */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit Record — ${editTarget?.patientName}`} size="xl">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-sm">
            <span className="text-slate-500">Visit:</span> <span className="font-semibold text-slate-800">{formatDate(editTarget?.visitDate)}</span>
            <span className="mx-2 text-slate-300">·</span>
            <span className="text-slate-500">Complaint:</span> <span className="font-medium text-slate-700">{editTarget?.chiefComplaint}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Symptoms</label>
              <textarea value={editForm.symptoms} onChange={setEF('symptoms')} rows={2} className="input resize-none"/>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Diagnosis</label>
              <input type="text" value={editForm.diagnosis} onChange={setEF('diagnosis')} className="input"/>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Treatment Plan</label>
              <textarea value={editForm.treatmentPlan} onChange={setEF('treatmentPlan')} rows={2} className="input resize-none"/>
            </div>
            <Input label="Lab Tests"    name="labTests"     value={editForm.labTests}    onChange={setEF('labTests')}/>
            <Input label="Follow-up Date" type="date" name="followUpDate" value={editForm.followUpDate} onChange={setEF('followUpDate')}/>
            <div className="sm:col-span-2">
              <label className="label">Vital Signs (JSON)</label>
              <input type="text" value={editForm.vitalSigns} onChange={setEF('vitalSigns')} className="input font-mono text-xs"/>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea value={editForm.notes} onChange={setEF('notes')} rows={2} className="input resize-none"/>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setEditTarget(null)} type="button">Cancel</Button>
            <Button type="submit" loading={updating}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* ── View, Modal ── */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Medical Record" size="lg">
        {viewTarget && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-slate-800">{viewTarget.patientName}</p>
                <p className="text-xs text-slate-400 mt-0.5">Visit: {formatDate(viewTarget.visitDate)}</p>
              </div>
              <button onClick={() => { setViewTarget(null); openEdit(viewTarget) }}
                className="btn btn-secondary btn-sm">Edit</button>
            </div>
            <div className="space-y-3">
              {[
                ['Chief Complaint', viewTarget.chiefComplaint, 'text-brand-700 font-semibold'],
                ['Symptoms',        viewTarget.symptoms],
                ['Diagnosis',       viewTarget.diagnosis],
                ['Treatment Plan',  viewTarget.treatmentPlan],
                ['Lab Tests',       viewTarget.labTests],
                ['Notes',           viewTarget.notes],
              ].map(([l,v,extra='']) => v ? (
                <div key={l}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{l}</p>
                  <p className={`text-sm text-slate-700 ${extra}`}>{v}</p>
                </div>
              ) : null)}
            </div>
            {viewTarget.vitalSigns && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Vital, Signs</p>
                <VitalSignsDisplay vitalSigns={viewTarget.vitalSigns}/>
              </div>
            )}
            {viewTarget.followUpDate && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <p className="text-xs font-semibold text-emerald-600">Follow-up, scheduled</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{formatDate(viewTarget.followUpDate)}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
