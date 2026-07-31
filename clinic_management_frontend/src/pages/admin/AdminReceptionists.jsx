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
const BLANK_C = { name:'', email:'', password:'', phone:'', address:'', employeeId:'', shiftStart:'08:00', shiftEnd:'16:00' }
const BLANK_U = { name:'', phone:'', address:'', shiftStart:'08:00', shiftEnd:'16:00' }
const createRules = { name:[required('Name')], email:[required('Email'), isEmail], password:[required('Password'), minLen(6,'Password')] }
const updateRules = { name:[required('Name')] }

export default function AdminReceptionists() {
  useTitle('Receptionists')
  const { addToast } = useToast()
  const { data: all = [], loading, execute: reload } = useApi(
    useCallback(async () => {
      try { return await adminService.getReceptionists() }
      catch { return await adminService.getActiveReceptionists() }
    }, []), { initialData: [] })

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [page,   setPage]   = useState(1)
  const [createOpen,  setCreateOpen]  = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [viewTarget,  setViewTarget]  = useState(null)
  const [confirmObj,  setConfirmObj]  = useState(null)
  const [form,    setForm]    = useState(BLANK_C)
  const [editForm,setEditForm]= useState(BLANK_U)
  const [errors,  setErrors]  = useState({})
  const [editErr, setEditErr] = useState({})

  const { mutate: create,  loading: creating } = useMutation(useCallback(d => adminService.createReceptionist(d), []))
  const { mutate: update,  loading: updating } = useMutation(useCallback((id,d) => adminService.updateReceptionist(id,d), []))
  const { mutate: toggle,  loading: toggling } = useMutation(useCallback((id, action) =>
    action === 'activate' ? adminService.activateReceptionist(id) : adminService.deactivateReceptionist(id), []))

  const filtered = useMemo(() => {
    let list = (Array.isArray(all) ? all : [])
    if (filter !== 'ALL') list = list.filter(r => r.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r => r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.employeeId?.toLowerCase().includes(q))
    }
    return list
  }, [all, search, filter])

  const paginated = useMemo(() => filtered.slice((page-1)*PER_PAGE, page*PER_PAGE), [filtered, page])

  const setF  = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setEF = k => e => setEditForm(f => ({ ...f, [k]: e.target.value }))

  const openEdit = r => {
    setEditTarget(r)
    setEditForm({ name:r.name||'', phone:r.phone||'', address:r.address||'',
      shiftStart:r.shiftStart?.slice(0,5)||'08:00', shiftEnd:r.shiftEnd?.slice(0,5)||'16:00' })
    setEditErr({})
  }

  const handleCreate = async e => {
    e.preventDefault()
    const errs = validate(form, createRules)
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await create(form)
      addToast('Receptionist created', 'success')
      setCreateOpen(false); setForm(BLANK_C); setErrors({}); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const handleUpdate = async e => {
    e.preventDefault()
    const errs = validate(editForm, updateRules)
    if (Object.keys(errs).length) { setEditErr(errs); return }
    try {
      await update(editTarget.id, editForm)
      addToast('Receptionist updated', 'success')
      setEditTarget(null); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const handleToggle = async () => {
    try {
      await toggle(confirmObj.id, confirmObj.action)
      addToast(`Receptionist ${confirmObj.action === 'activate' ? 'activated' : 'deactivated'}`, 'success')
      setConfirmObj(null); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Receptionists" subtitle={`${all.length} total · ${all.filter(r=>r.status==='ACTIVE').length} active`}
        action={<Button onClick={() => { setCreateOpen(true); setForm(BLANK_C); setErrors({}) }}>+ Add Receptionist</Button>}/>

      <SearchBar value={search} onChange={v=>{setSearch(v);setPage(1)}} onClear={()=>{setSearch('');setPage(1)}} placeholder="Search by name email employee ID…">
        <div className="flex gap-2">
          {['ALL','ACTIVE','INACTIVE'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${filter===f ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
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
                {['Receptionist','Employee ID','Shift','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/>Loading…</div>
                </td></tr>
              ) : !paginated.length ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-400">
                  {search||filter!=='ALL' ? 'No results match your filters' : 'No receptionists found'}
                </td></tr>
              ) : paginated.map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} size="sm"/>
                      <div>
                        <p className="font-semibold text-slate-800">{r.name}</p>
                        <p className="text-xs text-slate-400">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{r.employeeId || '—'}</code>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {r.shiftStart?.slice(0,5) || '—'} – {r.shiftEnd?.slice(0,5) || '—'}
                  </td>
                  <td className="px-4 py-3"><StatusChip status={r.status}/></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewTarget(r)} className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      {r.status === 'ACTIVE' ? (
                        <button onClick={() => setConfirmObj({ id:r.id, action:'deactivate', name:r.name })} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                        </button>
                      ) : (
                        <button onClick={() => setConfirmObj({ id:r.id, action:'activate', name:r.name })} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
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

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Receptionist">
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" name="name" value={form.name} onChange={setF('name')} error={errors.name} required className="sm:col-span-2"/>
          <Input label="Email" type="email" name="email" value={form.email} onChange={setF('email')} error={errors.email} required/>
          <Input label="Password" type="password" name="password" value={form.password} onChange={setF('password')} error={errors.password} required/>
          <Input label="Phone" name="phone" value={form.phone} onChange={setF('phone')} placeholder="9876543214"/>
          <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={setF('employeeId')} placeholder="EMP-REC-001"/>
          <Input label="Shift start" type="time" name="shiftStart" value={form.shiftStart} onChange={setF('shiftStart')}/>
          <Input label="Shift end"   type="time" name="shiftEnd"   value={form.shiftEnd}   onChange={setF('shiftEnd')}/>
          <Input label="Address" name="address" value={form.address} onChange={setF('address')} className="sm:col-span-2"/>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateOpen(false)} type="button">Cancel</Button>
            <Button type="submit" loading={creating}>Create</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`}>
        <form onSubmit={handleUpdate} className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name"   name="name"       value={editForm.name}       onChange={setEF('name')}       error={editErr.name} required className="sm:col-span-2"/>
          <Input label="Phone"       name="phone"      value={editForm.phone}      onChange={setEF('phone')}/>
          <Input label="Address"     name="address"    value={editForm.address}    onChange={setEF('address')}/>
          <Input label="Shift start" type="time" name="shiftStart" value={editForm.shiftStart} onChange={setEF('shiftStart')}/>
          <Input label="Shift end"   type="time" name="shiftEnd"   value={editForm.shiftEnd}   onChange={setEF('shiftEnd')}/>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setEditTarget(null)} type="button">Cancel</Button>
            <Button type="submit" loading={updating}>Save</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Drawer */}
      <DetailDrawer open={!!viewTarget} onClose={() => setViewTarget(null)} title="Receptionist Details">
        {viewTarget && (
          <div>
            <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-2">
              <Avatar name={viewTarget.name} size="xl"/>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{viewTarget.name}</h3>
                <p className="text-sm text-amber-600 font-medium">Receptionist</p>
                <StatusChip status={viewTarget.status}/>
              </div>
            </div>
            <DrawerRow label="Email"       value={viewTarget.email}/>
            <DrawerRow label="Phone"       value={viewTarget.phone}/>
            <DrawerRow label="Employee ID" value={viewTarget.employeeId} mono/>
            <DrawerRow label="Shift"       value={`${viewTarget.shiftStart?.slice(0,5)||'—'} – ${viewTarget.shiftEnd?.slice(0,5)||'—'}`}/>
            <DrawerRow label="Address"     value={viewTarget.address}/>
            <DrawerRow label="Joined"      value={formatDate(viewTarget.createdAt)}/>
            <div className="pt-4 flex gap-3">
              <Button onClick={() => { setViewTarget(null); openEdit(viewTarget) }} variant="secondary" className="flex-1">Edit</Button>
              {viewTarget.status==='ACTIVE'
                ? <Button onClick={() => { setViewTarget(null); setConfirmObj({id:viewTarget.id,action:'deactivate',name:viewTarget.name}) }} variant="danger" className="flex-1">Deactivate</Button>
                : <Button onClick={() => { setViewTarget(null); setConfirmObj({id:viewTarget.id,action:'activate',name:viewTarget.name}) }} className="flex-1">Activate</Button>
              }
            </div>
          </div>
        )}
      </DetailDrawer>

      <ConfirmDialog open={!!confirmObj} onClose={() => setConfirmObj(null)} onConfirm={handleToggle} loading={toggling}
        title={confirmObj?.action==='activate' ? 'Activate Receptionist' : 'Deactivate Receptionist'}
        message={`${confirmObj?.action==='activate' ? 'Activate' : 'Deactivate'} ${confirmObj?.name}?`}
        confirmLabel={confirmObj?.action==='activate' ? 'Activate' : 'Deactivate'}
        variant={confirmObj?.action==='activate' ? 'warning' : 'danger'}/>
    </div>
  )
}
