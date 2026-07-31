import { useState, useCallback, useMemo } from 'react'
import { useApi, useMutation } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import Avatar from '../../components/common/Avatar'
import PatientSearchBox from '../../components/receptionist/PatientSearchBox'
import FieldRow from '../../components/receptionist/FieldRow'
import { useToast } from '../../context/ToastContext'
import { useNotify } from '../../hooks/useNotify'
import receptionistService from '../../services/receptionistService'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { validate, required, isEmail, isPhone, isPastDate } from '../../utils/validation'
import Pagination from '../../components/common/Pagination'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE = 12
const TODAY    = new Date().toISOString().split('T')[0]

const BLANK = {
  name:'', email:'', phone:'', dateOfBirth:'', gender:'',
  bloodGroup:'', address:'', emergencyContactName:'', emergencyContact:'',
  medicalHistory:'', allergies:'',
}
const RULES = {
  name:        [required('Name')],
  email:       [required('Email'), isEmail],
  phone:       [required('Phone'), isPhone],
  dateOfBirth: [required('Date of birth'), isPastDate],
  gender:      [required('Gender')],
}
const GENDER_OPTS    = [{ value:'MALE',label:'Male' },{ value:'FEMALE',label:'Female' },{ value:'OTHER',label:'Other' }]
const BLOOD_OPTS     = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v=>({ value:v, label:v }))

export default function ReceptionistPatients() {
  useTitle('Patients')
  const { notify, notifyError } = useNotify()
  const { data: patients=[], loading, execute: reload } = useApi(useCallback(() => receptionistService.getPatients(), []), { initialData: [] })

  const [search,       setSearch]       = useState('')
  const [searchMode,   setSearchMode]   = useState('local') // 'local' | 'api'
  const [apiResults,   setApiResults]   = useState([])
  const [page,         setPage]         = useState(1)
  const [regOpen,      setRegOpen]      = useState(false)
  const [viewPatient,  setViewPatient]  = useState(null)
  const [form,         setForm]         = useState(BLANK)
  const [errors,       setErrors]       = useState({})
  const [step,         setStep]         = useState(1)   // 2-step registration

  const { mutate: register, loading: registering } = useMutation(
    useCallback(d => receptionistService.registerWalkIn(d), [])
  )
  const { data: patientAppts=[], loading: lappts, execute: loadAppts } = useApi(
    useCallback(() => viewPatient ? receptionistService.getAppointmentsByPatient(viewPatient.id) : Promise.resolve({data:[]}), [viewPatient?.id]),
    { immediate: false }
  )

  const localFiltered = useMemo(() => {
    if (!search.trim()) return patients
    const q = search.toLowerCase()
    return patients.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.patientNumber?.toLowerCase().includes(q) ||
      p.phone?.includes(q) ||
      p.email?.toLowerCase().includes(q)
    )
  }, [patients, search])

  const displayList = searchMode === 'api' ? apiResults : localFiltered
  const totalPages  = Math.ceil(displayList.length / PER_PAGE)
  const paginated   = displayList.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const setF = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => { const n={...er}; delete n[k]; return n })
  }

  const openView = async (p) => {
    setViewPatient(p)
    loadAppts()
  }

  const validateStep1 = () => {
    const errs = validate(form, RULES)
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleRegister = async e => {
    e.preventDefault()
    try {
      const res = await register(form)
      notify(`Patient ${res?.name || form.name} registered`, { type:'patient', title:'New patient registered', body:`ID: ${res?.patientNumber || ''}` })
      setRegOpen(false); setForm(BLANK); setErrors({}); setStep(1); reload()
    } catch (err) { notifyError(getErrorMessage(err)) }
  }

  const openReg = () => { setForm(BLANK); setErrors({}); setStep(1); setRegOpen(true) }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} registered patients`}
        action={<Button onClick={openReg}>+ Register Walk-in</Button>}
      />

      {/* Search area */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px] max-w-sm">
          <PatientSearchBox
            onSelect={p => { setViewPatient(p); loadAppts() }}
            placeholder="Live search by name…"
          />
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search}
            onChange={e => { setSearch(e.target.value); setSearchMode('local'); setPage(1) }}
            placeholder="Filter list by name number…" className="input pl-10"/>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Total',    value: patients.length,                              color:'bg-brand-50 text-brand-700 border-brand-100'   },
          { label:'Active',   value: patients.filter(p=>p.status==='ACTIVE').length,color:'bg-emerald-50 text-emerald-700 border-emerald-100'},
          { label:'Inactive', value: patients.filter(p=>p.status!=='ACTIVE').length,color:'bg-slate-50 text-slate-600 border-slate-200'  },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-xl px-4 py-3 ${color}`}>
            <p className="text-2xl font-bold">{loading ? '…' : value}</p>
            <p className="text-xs mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Patient grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({length:6}).map((_,i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : !paginated.length ? (
        <div className="card text-center py-12">
          <p className="text-5xl mb-3">👥</p>
          <p className="text-slate-500 font-medium">{search ? 'No patients match your search' : 'No patients registered yet'}</p>
          <Button onClick={openReg} className="mt-4">Register First Patient</Button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginated.map(p => (
              <button key={p.id} onClick={() => openView(p)}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:border-brand-200 transition-all text-left">
                <Avatar name={p.name} size="md"/>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400 truncate">{p.patientNumber}</p>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {p.bloodGroup && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">{p.bloodGroup}</span>}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${p.status==='ACTIVE'?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-500'}`}>{p.status}</span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            ))}
          </div>
          <Pagination page={page} total={displayList.length} perPage={PER_PAGE} onChange={setPage}/>
        </>
      )}

      {/* ── Registration Modal (2 steps) ── */}
      <Modal open={regOpen} onClose={() => setRegOpen(false)} title="Register Walk-in Patient" size="xl">
        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-6">
          {[['1','Personal Info'],['2','Health Info']].map(([n,l],i) => (
            <div key={n} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${step > i+1 ? 'bg-emerald-500 text-white' : step === i+1 ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-slate-100 text-slate-400'}`}>
                  {step > i+1
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    : n}
                </div>
                <span className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${step===i+1?'text-brand-600':step>i+1?'text-emerald-600':'text-slate-400'}`}>{l}</span>
              </div>
              {i < 1 && <div className={`h-0.5 w-12 mx-2 mb-4 ${step>i+1?'bg-emerald-400':'bg-slate-200'}`}/>}
            </div>
          ))}
        </div>

        <form onSubmit={handleRegister}>
          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full Name" name="name" value={form.name} onChange={setF('name')} error={errors.name} required placeholder="Carol Davis" className="sm:col-span-2"/>
              <Input label="Email" type="email" name="email" value={form.email} onChange={setF('email')} error={errors.email} required placeholder="carol@example.com"/>
              <Input label="Phone" name="phone" value={form.phone} onChange={setF('phone')} error={errors.phone} required placeholder="9876543218"/>
              <Input label="Date of Birth" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={setF('dateOfBirth')} error={errors.dateOfBirth} required max={TODAY}/>
              <Select label="Gender" name="gender" value={form.gender} onChange={setF('gender')} error={errors.gender} options={GENDER_OPTS} required/>
              <Input label="Address" name="address" value={form.address} onChange={setF('address')} placeholder="Street City" className="sm:col-span-2"/>
              <div className="sm:col-span-2 flex justify-end pt-3 border-t border-slate-100">
                <Button type="button" onClick={() => { if(validateStep1()) setStep(2) }}>
                  Continue →
                </Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={setF('bloodGroup')} options={BLOOD_OPTS} placeholder="Select blood group"/>
              <Input label="Emergency Contact Name" name="emergencyContactName" value={form.emergencyContactName} onChange={setF('emergencyContactName')} placeholder="John Davis"/>
              <Input label="Emergency Contact Phone" name="emergencyContact" value={form.emergencyContact} onChange={setF('emergencyContact')} placeholder="9999999991" className="sm:col-span-1"/>
              <div className="sm:col-span-2">
                <label className="label">Known Allergies</label>
                <textarea value={form.allergies} onChange={setF('allergies')} rows={2} className="input resize-none" placeholder="e.g. Penicillin Aspirin (leave blank if none)"/>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Medical History</label>
                <textarea value={form.medicalHistory} onChange={setF('medicalHistory')} rows={2} className="input resize-none" placeholder="Known conditions (optional)"/>
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-between pt-3 border-t border-slate-100">
                <Button variant="secondary" type="button" onClick={() => setStep(1)}>← Back</Button>
                <Button type="submit" loading={registering}>Register Patient</Button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* ── Patient Detail Modal ── */}
      <Modal open={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient Details" size="lg">
        {viewPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-brand-50 to-violet-50 rounded-xl border border-brand-100">
              <Avatar name={viewPatient.name} size="xl"/>
              <div>
                <h3 className="font-bold text-slate-800 text-xl">{viewPatient.name}</h3>
                <code className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">{viewPatient.patientNumber}</code>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {viewPatient.bloodGroup && <span className="badge bg-red-100 text-red-700">🩸 {viewPatient.bloodGroup}</span>}
                  {viewPatient.gender     && <span className="badge-slate badge">{viewPatient.gender}</span>}
                  <span className={`badge ${viewPatient.status==='ACTIVE'?'badge-green':'badge-red'}`}>{viewPatient.status}</span>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6">
              <FieldRow label="Email"       value={viewPatient.email}/>
              <FieldRow label="Phone"       value={viewPatient.phone}/>
              <FieldRow label="Date of Birth" value={formatDate(viewPatient.dateOfBirth)}/>
              <FieldRow label="Age"         value={viewPatient.dateOfBirth ? `${Math.floor((new Date()-new Date(viewPatient.dateOfBirth))/31557600000)} yrs` : null}/>
              <FieldRow label="Address"     value={viewPatient.address} className="sm:col-span-2"/>
              <FieldRow label="Emergency"   value={viewPatient.emergencyContactName ? `${viewPatient.emergencyContactName} · ${viewPatient.emergencyContact}` : null}/>
              <FieldRow label="Registered"  value={formatDate(viewPatient.createdAt)}/>
            </div>
            {viewPatient.allergies && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs font-bold text-red-600 mb-1">⚠ Known Allergies</p>
                <p className="text-sm text-red-700">{viewPatient.allergies}</p>
              </div>
            )}
            {viewPatient.medicalHistory && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs font-bold text-amber-700 mb-1">Medical History</p>
                <p className="text-sm text-slate-700">{viewPatient.medicalHistory}</p>
              </div>
            )}
            {/* Recent appointments */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Recent Appointments</p>
              {lappts ? <p className="text-slate-400 text-sm">Loading…</p>
              : !patientAppts.length ? <p className="text-slate-400 text-sm">No appointments on record</p>
              : patientAppts.slice(0,3).map(a => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 font-bold text-xs">#{a.tokenNumber}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{a.doctorName}</p>
                    <p className="text-xs text-slate-400">{formatDate(a.appointmentDate)}</p>
                  </div>
                  <span className={`badge text-[10px] ${a.status==='COMPLETED'?'badge-green':a.status==='CANCELLED'?'badge-red':'badge-blue'}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
