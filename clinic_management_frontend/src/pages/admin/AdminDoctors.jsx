import { useState, useCallback, useMemo } from 'react'
import { useApi, useMutation } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Avatar from '../../components/common/Avatar'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StatusChip from '../../components/common/StatusChip'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import DetailDrawer, { DrawerRow } from '../../components/admin/DetailDrawer'
import { useToast } from '../../context/ToastContext'
import adminService from '../../services/adminService'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { validate, required, isEmail, minLen } from '../../utils/validation'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE = 10

const DAY_OPTS = ['MON','TUE','WED','THU','FRI','SAT','SUN']

const BLANK_CREATE = {
  name:'', email:'', password:'', phone:'', address:'',
  specialization:'', qualification:'', licenseNumber:'',
  yearsOfExperience:'', consultationFee:'',
  availableFrom:'09:00', availableTo:'17:00',
  availableDays:'MON,TUE,WED,THU,FRI', biography:'',
}
const BLANK_UPDATE = {
  name:'', phone:'', address:'', specialization:'', qualification:'',
  yearsOfExperience:'', consultationFee:'',
  availableFrom:'09:00', availableTo:'17:00',
  availableDays:'MON,TUE,WED,THU,FRI', biography:'',
}
const createRules = {
  name:          [required('Name'), minLen(3,'Name')],
  email:         [required('Email'), isEmail],
  password:      [required('Password'), minLen(6,'Password')],
  specialization:[required('Specialization')],
  qualification: [required('Qualification')],
  licenseNumber: [required('License number')],
}
const updateRules = {
  name:          [required('Name')],
  specialization:[required('Specialization')],
}

export default function AdminDoctors() {
  useTitle('Doctors')
  const { addToast } = useToast()

  // ── Data ──
  const { data: all = [], loading, execute: reload } = useApi(
    useCallback(() => adminService.getDoctors(), [])
  , { initialData: [] })

  // ── Local state ──
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('ALL')   // ALL | ACTIVE | INACTIVE
  const [page,    setPage]    = useState(1)
  const [createOpen,  setCreateOpen]  = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)  // doctor object
  const [viewTarget,  setViewTarget]  = useState(null)  // doctor object
  const [confirmObj,  setConfirmObj]  = useState(null)  // { id, action:'deactivate'|'activate' }
  const [form,    setForm]    = useState(BLANK_CREATE)
  const [editForm,setEditForm]= useState(BLANK_UPDATE)
  const [errors,  setErrors]  = useState({})
  const [editErr, setEditErr] = useState({})

  // ── Mutations ──
  const { mutate: createDoctor, loading: creating } = useMutation(
    useCallback(data => adminService.createDoctor(data), [])
  )
  const { mutate: updateDoctor, loading: updating } = useMutation(
    useCallback((id, d) => adminService.updateDoctor(id, d), [])
  )
  const { mutate: toggleStatus, loading: toggling } = useMutation(
    useCallback((id, action) =>
      action === 'activate' ? adminService.activateDoctor(id) : adminService.deactivateDoctor(id)
    , [])
  )

  // ── Filtered + searched + paginated list ──
  const filtered = useMemo(() => {
    let list = (Array.isArray(all) ? all : [])
    if (filter !== 'ALL') list = list.filter(d => d.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.licenseNumber?.toLowerCase().includes(q)
      )
    }
    return list
  }, [all, search, filter])

  const paginated = useMemo(() =>
    filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  , [filtered, page])

  const resetPage = () => setPage(1)

  // ── Handlers ──
  const setF  = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setEF = k => e => setEditForm(f => ({ ...f, [k]: e.target.value }))

  const openEdit = (doc) => {
    setEditTarget(doc)
    setEditForm({
      name: doc.name || '', phone: doc.phone || '', address: doc.address || '',
      specialization: doc.specialization || '', qualification: doc.qualification || '',
      yearsOfExperience: doc.yearsOfExperience || '', consultationFee: doc.consultationFee || '',
      availableFrom: doc.availableFrom?.slice(0,5) || '09:00',
      availableTo: doc.availableTo?.slice(0,5) || '17:00',
      availableDays: doc.availableDays || 'MON,TUE,WED,THU,FRI',
      biography: doc.biography || '',
    })
    setEditErr({})
  }

  const handleCreate = async e => {
    e.preventDefault()
    const errs = validate(form, createRules)
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await createDoctor({
        ...form,
        yearsOfExperience: form.yearsOfExperience ? +form.yearsOfExperience : undefined,
        consultationFee:   form.consultationFee   ? +form.consultationFee   : undefined,
      })
      addToast('Doctor created successfully', 'success')
      setCreateOpen(false); setForm(BLANK_CREATE); setErrors({}); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const handleUpdate = async e => {
    e.preventDefault()
    const errs = validate(editForm, updateRules)
    if (Object.keys(errs).length) { setEditErr(errs); return }
    try {
      await updateDoctor(editTarget.id, {
        ...editForm,
        yearsOfExperience: editForm.yearsOfExperience ? +editForm.yearsOfExperience : undefined,
        consultationFee:   editForm.consultationFee   ? +editForm.consultationFee   : undefined,
      })
      addToast('Doctor updated successfully', 'success')
      setEditTarget(null); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const handleConfirmToggle = async () => {
    if (!confirmObj) return
    try {
      await toggleStatus(confirmObj.id, confirmObj.action)
      addToast(`Doctor ${confirmObj.action === 'activate' ? 'activated' : 'deactivated'}`, 'success')
      setConfirmObj(null); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const fe = (name, err) => err?.[name]
    ? <p className="mt-1 text-xs text-red-500">⚠ {err[name]}</p> : null

  return (
    <div className="space-y-5">
      <PageHeader
        title="Doctors"
        subtitle={`${all.length} total · ${all.filter(d=>d.status==='ACTIVE').length} active`}
        action={<Button onClick={() => { setCreateOpen(true); setForm(BLANK_CREATE); setErrors({}) }}>+ Add Doctor</Button>}
      />

      {/* Search + filters */}
      <SearchBar
        value={search}
        onChange={v => { setSearch(v); resetPage() }}
        onClear={() => { setSearch(''); resetPage() }}
        placeholder="Search by name email specialization license…"
      >
        <div className="flex gap-2 flex-wrap">
          {['ALL','ACTIVE','INACTIVE'].map(f => (
            <button key={f} onClick={() => { setFilter(f); resetPage() }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${filter === f ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </SearchBar>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Doctor','Specialization','License','Experience','Fee','Schedule','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/>
                    Loading doctors…
                  </div>
                </td></tr>
              ) : !paginated.length ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <p className="text-slate-400">{search || filter !== 'ALL' ? 'No doctors match your filters' : 'No doctors found'}</p>
                  {(search || filter !== 'ALL') && (
                    <button onClick={() => { setSearch(''); setFilter('ALL') }} className="text-brand-600 text-sm mt-1 hover:text-brand-700">
                      Clear filters
                    </button>
                  )}
                </td></tr>
              ) : paginated.map(doc => (
                <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={doc.name} size="sm"/>
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">{doc.name}</p>
                        <p className="text-xs text-slate-400">{doc.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{doc.specialization}</p>
                    <p className="text-xs text-slate-400">{doc.qualification}</p>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{doc.licenseNumber}</code>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{doc.yearsOfExperience ? `${doc.yearsOfExperience} yrs` : '—'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{doc.consultationFee ? `₹${doc.consultationFee}` : '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {doc.availableFrom?.slice(0,5)}–{doc.availableTo?.slice(0,5)}<br/>
                    <span className="text-slate-400">{doc.availableDays}</span>
                  </td>
                  <td className="px-4 py-3"><StatusChip status={doc.status}/></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewTarget(doc)} title="View details"
                        className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      <button onClick={() => openEdit(doc)} title="Edit"
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      {doc.status === 'ACTIVE' ? (
                        <button onClick={() => setConfirmObj({ id: doc.id, action:'deactivate', name: doc.name })} title="Deactivate"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                        </button>
                      ) : (
                        <button onClick={() => setConfirmObj({ id: doc.id, action:'activate', name: doc.name })} title="Activate"
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

      {/* ── Create, Modal ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Doctor" size="xl">
        <form onSubmit={handleCreate} className="space-y-0">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Input label="Full name" name="name" value={form.name} onChange={setF('name')} error={errors.name} required placeholder="Dr. John Smith"/>
              {fe('name', errors)}
            </div>
            <div>
              <Input label="Email" type="email" name="email" value={form.email} onChange={setF('email')} error={errors.email} required placeholder="john@clinic.com"/>
            </div>
            <div>
              <Input label="Password" type="password" name="password" value={form.password} onChange={setF('password')} error={errors.password} required placeholder="Min. 6 characters"/>
            </div>
            <div>
              <Input label="Phone" name="phone" value={form.phone} onChange={setF('phone')} placeholder="9876543211"/>
            </div>
            <div>
              <Input label="Specialization" name="specialization" value={form.specialization} onChange={setF('specialization')} error={errors.specialization} required placeholder="Cardiology"/>
            </div>
            <div>
              <Input label="Qualification" name="qualification" value={form.qualification} onChange={setF('qualification')} error={errors.qualification} required placeholder="MD Cardiology"/>
            </div>
            <div>
              <Input label="License number" name="licenseNumber" value={form.licenseNumber} onChange={setF('licenseNumber')} error={errors.licenseNumber} required placeholder="MED-CARD-001"/>
            </div>
            <div>
              <Input label="Years of experience" type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={setF('yearsOfExperience')} placeholder="15"/>
            </div>
            <div>
              <Input label="Consultation fee (₹)" type="number" name="consultationFee" value={form.consultationFee} onChange={setF('consultationFee')} placeholder="1500"/>
            </div>
            <div>
              <Input label="Address" name="address" value={form.address} onChange={setF('address')} placeholder="456 Medical Ave"/>
            </div>
            <div>
              <Input label="Available from" type="time" name="availableFrom" value={form.availableFrom} onChange={setF('availableFrom')}/>
            </div>
            <div>
              <Input label="Available to" type="time" name="availableTo" value={form.availableTo} onChange={setF('availableTo')}/>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Available days</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DAY_OPTS.map(d => {
                  const sel = form.availableDays.split(',').includes(d)
                  return (
                    <button key={d} type="button"
                      onClick={() => {
                        const days = form.availableDays.split(',').filter(Boolean)
                        const next = sel ? days.filter(x => x !== d) : [...days, d]
                        setForm(f => ({ ...f, availableDays: next.join(',') }))
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border
                        ${sel ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Biography</label>
              <textarea name="biography" value={form.biography} onChange={e => setForm(f => ({ ...f, biography: e.target.value }))}
                rows={2} placeholder="Brief bio…" className="input resize-none"/>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateOpen(false)} type="button">Cancel</Button>
            <Button type="submit" loading={creating}>Create Doctor</Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit, Modal ── */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`} size="xl">
        <form onSubmit={handleUpdate} className="space-y-0">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Input label="Full name" name="name" value={editForm.name} onChange={setEF('name')} error={editErr.name} required/>
            <Input label="Phone" name="phone" value={editForm.phone} onChange={setEF('phone')}/>
            <Input label="Specialization" name="specialization" value={editForm.specialization} onChange={setEF('specialization')} error={editErr.specialization} required/>
            <Input label="Qualification" name="qualification" value={editForm.qualification} onChange={setEF('qualification')}/>
            <Input label="Years of experience" type="number" name="yearsOfExperience" value={editForm.yearsOfExperience} onChange={setEF('yearsOfExperience')}/>
            <Input label="Consultation fee (₹)" type="number" name="consultationFee" value={editForm.consultationFee} onChange={setEF('consultationFee')}/>
            <Input label="Available from" type="time" name="availableFrom" value={editForm.availableFrom} onChange={setEF('availableFrom')}/>
            <Input label="Available to" type="time" name="availableTo" value={editForm.availableTo} onChange={setEF('availableTo')}/>
            <Input label="Address" name="address" value={editForm.address} onChange={setEF('address')} className="sm:col-span-2"/>
            <div className="sm:col-span-2">
              <label className="label">Available days</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DAY_OPTS.map(d => {
                  const sel = editForm.availableDays.split(',').includes(d)
                  return (
                    <button key={d} type="button"
                      onClick={() => {
                        const days = editForm.availableDays.split(',').filter(Boolean)
                        const next = sel ? days.filter(x => x !== d) : [...days, d]
                        setEditForm(f => ({ ...f, availableDays: next.join(',') }))
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border
                        ${sel ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Biography</label>
              <textarea value={editForm.biography} onChange={e => setEditForm(f => ({ ...f, biography: e.target.value }))}
                rows={2} className="input resize-none"/>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setEditTarget(null)} type="button">Cancel</Button>
            <Button type="submit" loading={updating}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* ── Detail, Drawer ── */}
      <DetailDrawer open={!!viewTarget} onClose={() => setViewTarget(null)} title="Doctor Profile">
        {viewTarget && (
          <div className="space-y-1">
            <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-2">
              <Avatar name={viewTarget.name} size="xl"/>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{viewTarget.name}</h3>
                <p className="text-sm text-brand-600 font-medium">{viewTarget.specialization}</p>
                <StatusChip status={viewTarget.status}/>
              </div>
            </div>
            <DrawerRow label="Email"         value={viewTarget.email}/>
            <DrawerRow label="Phone"         value={viewTarget.phone}/>
            <DrawerRow label="Qualification" value={viewTarget.qualification}/>
            <DrawerRow label="License No."   value={viewTarget.licenseNumber} mono/>
            <DrawerRow label="Experience"    value={viewTarget.yearsOfExperience ? `${viewTarget.yearsOfExperience} years` : null}/>
            <DrawerRow label="Consult. Fee"  value={viewTarget.consultationFee  ? `₹${viewTarget.consultationFee}` : null}/>
            <DrawerRow label="Available"     value={`${viewTarget.availableFrom?.slice(0,5) || '—'} – ${viewTarget.availableTo?.slice(0,5) || '—'}`}/>
            <DrawerRow label="Days"          value={viewTarget.availableDays}/>
            <DrawerRow label="Address"       value={viewTarget.address}/>
            <DrawerRow label="Biography"     value={viewTarget.biography}/>
            <DrawerRow label="Joined"        value={formatDate(viewTarget.createdAt)}/>
            <div className="pt-4 flex gap-3">
              <Button onClick={() => { setViewTarget(null); openEdit(viewTarget) }} variant="secondary" className="flex-1">Edit</Button>
              {viewTarget.status === 'ACTIVE' ? (
                <Button onClick={() => { setViewTarget(null); setConfirmObj({ id: viewTarget.id, action:'deactivate', name: viewTarget.name }) }} variant="danger" className="flex-1">Deactivate</Button>
              ) : (
                <Button onClick={() => { setViewTarget(null); setConfirmObj({ id: viewTarget.id, action:'activate', name: viewTarget.name }) }} className="flex-1">Activate</Button>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* ── Confirm, Modal ── */}
      <ConfirmDialog
        open={!!confirmObj}
        onClose={() => setConfirmObj(null)}
        onConfirm={handleConfirmToggle}
        loading={toggling}
        title={confirmObj?.action === 'activate' ? 'Activate Doctor' : 'Deactivate Doctor'}
        message={confirmObj?.action === 'activate'
          ? `Activate Dr. ${confirmObj?.name}? They will be able to receive appointments again.`
          : `Deactivate Dr. ${confirmObj?.name}? They will no longer appear in booking lists.`
        }
        confirmLabel={confirmObj?.action === 'activate' ? 'Activate' : 'Deactivate'}
        variant={confirmObj?.action === 'activate' ? 'warning' : 'danger'}
      />
    </div>
  )
}
