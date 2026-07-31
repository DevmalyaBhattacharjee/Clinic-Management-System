import { useState, useCallback, useMemo } from 'react'
import { useApi } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import SearchBar from '../../components/common/SearchBar'
import PatientCard from '../../components/doctor/PatientCard'
import VitalSignsDisplay from '../../components/doctor/VitalSignsDisplay'
import doctorService from '../../services/doctorService'
import { formatDate } from '../../utils/helpers'
import { useToast } from '../../context/ToastContext'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE = 12

export default function DoctorPatients() {
  useTitle('My Patients')
  const { addToast } = useToast()
  const { data: patients = [], loading } = useApi(useCallback(() => doctorService.getPatients(), []), { initialData: [] })

  const [search,   setSearch]   = useState('')
  const [gFilter,  setGFilter]  = useState('ALL')
  const [selected, setSelected] = useState(null)   // PatientDTO
  const [page,     setPage]     = useState(1)
  const [detailTab,setDetailTab]= useState('info') // 'info' | 'records' | 'prescriptions'

  // Per-patient data (loaded lazily when a patient is selected)
  const { data: patientRecords = [],       loading: lr, execute: loadRecords }      = useApi(
    useCallback(() => selected ? doctorService.getPatientMedicalRecords(selected.id) : Promise.resolve({data:[]}), [selected?.id]),
    { immediate: false }
  , { initialData: [] })
  const { data: patientPrescriptions = [], loading: lp, execute: loadPrescriptions } = useApi(
    useCallback(() => selected ? doctorService.getPatientPrescriptions(selected.id) : Promise.resolve({data:[]}), [selected?.id]),
    { immediate: false }
  , { initialData: [] })
  const { data: patientDetail, loading: ld, execute: loadDetail } = useApi(
    useCallback(() => selected ? doctorService.getPatientById(selected.id) : Promise.resolve({data:null}), [selected?.id]),
    { immediate: false }
  )

  const selectPatient = (p) => {
    setSelected(p)
    setDetailTab('info')
    loadDetail()
    loadRecords()
    loadPrescriptions()
  }

  const filtered = useMemo(() => {
    let list = (Array.isArray(patients) ? patients : [])
    if (gFilter !== 'ALL') list = list.filter(p => p.gender === gFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.patientNumber?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.includes(q)
      )
    }
    return list
  }, [patients, search, gFilter])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)
  const detail     = patientDetail || selected

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Patients"
        subtitle={`${patients.length} patients treated`}
      />

      <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search name number phone…">
        <div className="flex gap-2">
          {['ALL','MALE','FEMALE','OTHER'].map(g => (
            <button key={g} onClick={() => { setGFilter(g); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${gFilter===g ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {g}
            </button>
          ))}
        </div>
      </SearchBar>

      {/* Stats, row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Total',    value: patients.length,                               color:'bg-brand-50 text-brand-700 border-brand-100'  },
          { label:'Male',     value: patients.filter(p=>p.gender==='MALE').length,  color:'bg-blue-50 text-blue-700 border-blue-100'    },
          { label:'Female',   value: patients.filter(p=>p.gender==='FEMALE').length,color:'bg-violet-50 text-violet-700 border-violet-100'},
          { label:'Filtered', value: filtered.length,                               color:'bg-slate-50 text-slate-700 border-slate-200'  },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-xl px-4 py-3 ${color}`}>
            <p className="text-2xl font-bold">{loading ? '…' : value}</p>
            <p className="text-xs mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Patient, grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({length:6}).map((_,i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse"/>
          ))}
        </div>
      ) : !paginated.length ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-3">👤</p>
          <p className="text-slate-500 font-medium">No patients found</p>
          {(search || gFilter !== 'ALL') && (
            <button onClick={() => { setSearch(''); setGFilter('ALL') }}
              className="text-brand-600 text-sm mt-2 hover:text-brand-700">Clear filters</button>
          )}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginated.map(p => (
              <PatientCard key={p.id}
                patient={p}
                selected={selected?.id === p.id}
                onClick={() => selectPatient(p)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 pt-2">
              {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                    ${p===page ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Patient, Detail, Modal ── */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Patient Profile" size="xl">
        {selected && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-brand-50 to-violet-50 rounded-xl border border-brand-100">
              <Avatar name={detail?.name || selected.name} size="xl"/>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-lg truncate">{detail?.name || selected.name}</h3>
                <code className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">{detail?.patientNumber || selected.patientNumber}</code>
                <div className="flex flex-wrap gap-2 mt-2">
                  {detail?.gender     && <span className="badge-blue badge">{detail.gender}</span>}
                  {detail?.bloodGroup && <span className="badge bg-red-100 text-red-700">{detail.bloodGroup}</span>}
                  <span className={`badge ${detail?.status==='ACTIVE' ? 'badge-green' : 'badge-slate'}`}>{detail?.status || selected.status}</span>
                </div>
              </div>
            </div>

            {/* Tab, selector */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {[['info','Info'],['records','Medical Records'],['prescriptions','Prescriptions']].map(([v,l]) => (
                <button key={v} onClick={() => setDetailTab(v)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${detailTab===v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {l}
                </button>
              ))}
            </div>

            {/* Tab: Info */}
            {detailTab === 'info' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Email',       detail?.email],
                    ['Phone',       detail?.phone],
                    ['Date of Birth',formatDate(detail?.dateOfBirth)],
                    ['Gender',      detail?.gender],
                    ['Address',     detail?.address],
                    ['Emergency',   detail?.emergencyContactName ? `${detail.emergencyContactName} · ${detail.emergencyContact}` : null],
                  ].map(([l,v]) => (
                    <div key={l} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                      <p className="text-sm font-medium text-slate-800">{v || <span className="text-slate-300 italic">—</span>}</p>
                    </div>
                  ))}
                </div>
                {detail?.allergies && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-xs font-semibold text-red-600 mb-1">⚠ Known, Allergies</p>
                    <p className="text-sm text-slate-700">{detail.allergies}</p>
                  </div>
                )}
                {detail?.medicalHistory && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Medical, History</p>
                    <p className="text-sm text-slate-700">{detail.medicalHistory}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Medical, Records */}
            {detailTab === 'records' && (
              <div>
                {lr ? (
                  <p className="text-slate-400 text-sm text-center py-6">Loading, records…</p>
                ) : !patientRecords.length ? (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-2">📋</p>
                    <p className="text-slate-400 text-sm">No, medical, records
                    for  this, patient</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide pr-1">
                    {patientRecords.map(r => (
                      <div key={r.id} className="border border-slate-100 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-slate-800">{r.chiefComplaint}</p>
                          <span className="text-xs text-slate-400">{formatDate(r.visitDate)}</span>
                        </div>
                        {r.diagnosis && <p className="text-xs text-brand-600 font-medium">Dx: {r.diagnosis}</p>}
                        {r.symptoms   && <p className="text-xs text-slate-500">Sx: {r.symptoms}</p>}
                        {r.treatmentPlan && <p className="text-xs text-slate-500">Tx: {r.treatmentPlan}</p>}
                        {r.vitalSigns && <VitalSignsDisplay vitalSigns={r.vitalSigns}/>}
                        {r.followUpDate && (
                          <p className="text-xs text-emerald-600 font-medium">Follow-up: {formatDate(r.followUpDate)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Prescriptions */}
            {detailTab === 'prescriptions' && (
              <div>
                {lp ? (
                  <p className="text-slate-400 text-sm text-center py-6">Loading, prescriptions…</p>
                ) : !patientPrescriptions.length ? (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-2">💊</p>
                    <p className="text-slate-400 text-sm">No, prescriptions
                    for  this, patient</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide pr-1">
                    {patientPrescriptions.map(p => (
                      <div key={p.id} className={`flex items-start gap-3 p-3 rounded-xl border
                        ${p.isActive ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                        <div className="w-9 h-9 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-lg flex-shrink-0">💊</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-slate-800">{p.medicationName}</p>
                            <span className={`badge ${p.isActive ? 'badge-green' : 'badge-slate'}`}>{p.isActive ? 'Active' : 'Ended'}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{p.dosage} · {p.frequency} · {p.duration} days</p>
                          {p.instructions && <p className="text-xs text-slate-400 mt-0.5">{p.instructions}</p>}
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(p.prescriptionDate)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
