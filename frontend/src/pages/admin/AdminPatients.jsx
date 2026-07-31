import { useState, useCallback, useMemo } from 'react'
import { useApi, useMutation } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Avatar from '../../components/common/Avatar'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StatusChip from '../../components/common/StatusChip'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import DetailDrawer, { DrawerRow } from '../../components/admin/DetailDrawer'
import { useToast } from '../../context/ToastContext'
import adminService from '../../services/adminService'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE = 10
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const GENDERS      = ['MALE','FEMALE','OTHER']

export default function AdminPatients() {
  useTitle('Patients')
  const { addToast } = useToast()
  const { data: all = [], loading, execute: reload } = useApi(useCallback(() => adminService.getPatients(), []), { initialData: [] })

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [gFilter,setGFilter]= useState('ALL')
  const [page,   setPage]   = useState(1)
  const [viewTarget,  setViewTarget]  = useState(null)
  const [confirmObj,  setConfirmObj]  = useState(null)

  const { mutate: toggle, loading: toggling } = useMutation(useCallback((id, action) =>
    action === 'activate' ? adminService.activatePatient(id) : adminService.deactivatePatient(id), []))

  const filtered = useMemo(() => {
    let list = (Array.isArray(all) ? all : [])
    if (filter  !== 'ALL') list = list.filter(p => p.status === filter)
    if (gFilter !== 'ALL') list = list.filter(p => p.gender === gFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.patientNumber?.toLowerCase().includes(q) ||
        p.phone?.includes(q)
      )
    }
    return list
  }, [all, search, filter, gFilter])

  const paginated = useMemo(() => filtered.slice((page-1)*PER_PAGE, page*PER_PAGE), [filtered, page])

  const handleToggle = async () => {
    try {
      await toggle(confirmObj.id, confirmObj.action)
      addToast(`Patient ${confirmObj.action === 'activate' ? 'activated' : 'deactivated'}`, 'success')
      setConfirmObj(null); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  // ── Summary stats ──
  const active   = useMemo(() => all.filter(p => p.status === 'ACTIVE').length,   [all])
  const inactive = useMemo(() => all.filter(p => p.status === 'INACTIVE').length, [all])
  const male     = useMemo(() => all.filter(p => p.gender === 'MALE').length,     [all])
  const female   = useMemo(() => all.filter(p => p.gender === 'FEMALE').length,   [all])

  return (
    <div className="space-y-5">
      <PageHeader title="Patients" subtitle={`${all.length} registered · ${active} active`}/>

      {/* Summary, cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Total',    value: all.length, color:'bg-brand-50 text-brand-700',    border:'border-brand-100' },
          { label:'Active',   value: active,     color:'bg-emerald-50 text-emerald-700', border:'border-emerald-100' },
          { label:'Inactive', value: inactive,   color:'bg-slate-50 text-slate-600',    border:'border-slate-200' },
          { label:'Male / Female', value:`${male} / ${female}`, color:'bg-violet-50 text-violet-700', border:'border-violet-100' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`${color} border ${border} rounded-xl px-4 py-3`}>
            <p className="text-2xl font-bold">{loading ? '…' : value}</p>
            <p className="text-xs mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      <SearchBar value={search} onChange={v=>{setSearch(v);setPage(1)}} onClear={()=>{setSearch('');setPage(1)}} placeholder="Search by name email patient number phone…">
        <div className="flex gap-2 flex-wrap">
          {['ALL','ACTIVE','INACTIVE'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${filter===f ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
          <div className="w-px bg-slate-200 self-stretch mx-1"/>
          <select value={gFilter} onChange={e=>{setGFilter(e.target.value);setPage(1)}}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-400">
            <option value="ALL">All genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </SearchBar>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Patient','Patient No.','DOB','Gender','Blood','Contact','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/>Loading…</div>
                </td></tr>
              ) : !paginated.length ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400">
                  {search||filter!=='ALL'||gFilter!=='ALL' ? 'No patients match your filters' : 'No patients found'}
                </td></tr>
              ) : paginated.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} size="sm"/>
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{p.patientNumber}</code></td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(p.dateOfBirth)}</td>
                  <td className="px-4 py-3 text-slate-600">{p.gender || '—'}</td>
                  <td className="px-4 py-3">
                    {p.bloodGroup
                      ? <span className="badge bg-red-100 text-red-700">{p.bloodGroup}</span>
                      : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.phone || '—'}</td>
                  <td className="px-4 py-3"><StatusChip status={p.status}/></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewTarget(p)} className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      {p.status === 'ACTIVE' ? (
                        <button onClick={() => setConfirmObj({ id:p.id, action:'deactivate', name:p.name })}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                        </button>
                      ) : (
                        <button onClick={() => setConfirmObj({ id:p.id, action:'activate', name:p.name })}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4"><Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage}/></div>
      </div>

      {/* Detail, Drawer */}
      <DetailDrawer open={!!viewTarget} onClose={() => setViewTarget(null)} title="Patient Profile">
        {viewTarget && (
          <div>
            <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-2">
              <Avatar name={viewTarget.name} size="xl"/>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{viewTarget.name}</h3>
                <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{viewTarget.patientNumber}</code>
                <div className="mt-1"><StatusChip status={viewTarget.status}/></div>
              </div>
            </div>
            <DrawerRow label="Email"            value={viewTarget.email}/>
            <DrawerRow label="Phone"            value={viewTarget.phone}/>
            <DrawerRow label="Date of Birth"    value={formatDate(viewTarget.dateOfBirth)}/>
            <DrawerRow label="Gender"           value={viewTarget.gender}/>
            <DrawerRow label="Blood Group"      value={viewTarget.bloodGroup}/>
            <DrawerRow label="Address"          value={viewTarget.address}/>
            <DrawerRow label="Emergency Contact" value={viewTarget.emergencyContactName ? `${viewTarget.emergencyContactName} · ${viewTarget.emergencyContact}` : null}/>
            <DrawerRow label="Allergies"        value={viewTarget.allergies}/>
            <DrawerRow label="Medical History"  value={viewTarget.medicalHistory}/>
            <DrawerRow label="Registered"       value={formatDate(viewTarget.createdAt)}/>
            <div className="pt-4">
              {viewTarget.status === 'ACTIVE'
                ? <Button onClick={() => { setViewTarget(null); setConfirmObj({id:viewTarget.id,action:'deactivate',name:viewTarget.name}) }} variant="danger" className="w-full">Deactivate Account</Button>
                : <Button onClick={() => { setViewTarget(null); setConfirmObj({id:viewTarget.id,action:'activate',name:viewTarget.name}) }} className="w-full">Activate Account</Button>
              }
            </div>
          </div>
        )}
      </DetailDrawer>

      <ConfirmDialog open={!!confirmObj} onClose={() => setConfirmObj(null)} onConfirm={handleToggle} loading={toggling}
        title={confirmObj?.action==='activate' ? 'Activate Patient' : 'Deactivate Patient'}
        message={`Are you sure you want to ${confirmObj?.action} ${confirmObj?.name}'s account?`}
        confirmLabel={confirmObj?.action==='activate' ? 'Activate' : 'Deactivate'}
        variant={confirmObj?.action==='activate' ? 'warning' : 'danger'}/>
    </div>
  )
}
