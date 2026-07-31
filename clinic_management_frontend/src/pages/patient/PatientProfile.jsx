import { useState, useCallback } from 'react'
import { useApi, useMutation } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Avatar from '../../components/common/Avatar'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import patientService from '../../services/patientService'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { useTitle } from '../../hooks/useTitle'

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-slate-50 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-brand-700' : 'text-slate-800'}`}>
        {value || <span className="text-slate-300 italic font-normal">—</span>}
      </span>
    </div>
  )
}

export default function PatientProfile() {
  useTitle('My Profile')
  const { user }     = useAuth()
  const { addToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({})

  const { data: profile, loading, execute: reload } = useApi(
    useCallback(() => patientService.getProfile(), [])
  )

  const { mutate: save, loading: saving } = useMutation(
    useCallback(data => patientService.updateProfile(data), [])
  )

  const openEdit = () => {
    if (!profile) return
    setForm({
      phone:                profile.phone                || '',
      address:              profile.address              || '',
      emergencyContactName: profile.emergencyContactName || '',
      emergencyContact:     profile.emergencyContact     || '',
      medicalHistory:       profile.medicalHistory       || '',
      allergies:            profile.allergies            || '',
    })
    setEditing(true)
  }

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async e => {
    e.preventDefault()
    try {
      await save(form)
      addToast('Profile updated successfully', 'success')
      setEditing(false)
      reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-40 bg-slate-100 rounded-xl animate-pulse"/>
      <div className="grid lg:grid-cols-3 gap-5">
        {[1,2].map(i=><div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"/>)}
      </div>
    </div>
  )

  if (!profile) return (
    <div className="card text-center py-12">
      <p className="text-slate-400">Unable to load profile. Please try refreshing.</p>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="My Profile" subtitle="Your patient information and health details"/>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: identity */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="card text-center">
            <Avatar name={profile.name} size="xl" className="mx-auto mb-4"/>
            <h2 className="text-xl font-bold text-slate-800">{profile.name}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{profile.email}</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              <code className="badge-blue badge font-mono">{profile.patientNumber}</code>
              <span className={`badge ${profile.status==='ACTIVE'?'badge-green':'badge-red'}`}>{profile.status}</span>
            </div>
            <div className="flex justify-center gap-3 mt-3">
              {profile.bloodGroup && (
                <span className="badge bg-red-100 text-red-700 text-sm font-bold">🩸 {profile.bloodGroup}</span>
              )}
              {profile.gender && (
                <span className="badge-slate badge">{profile.gender}</span>
              )}
            </div>
            {!editing && (
              <Button onClick={openEdit} className="w-full mt-5" variant="secondary">Edit Profile</Button>
            )}
          </div>

          {/* Quick health info */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Quick Info</h3>
            {[
              { label:'Date of Birth', value: formatDate(profile.dateOfBirth) },
              { label:'Age',           value: profile.dateOfBirth ? `${Math.floor((new Date()-new Date(profile.dateOfBirth))/31557600000)} years` : null },
              { label:'Blood Group',   value: profile.bloodGroup },
              { label:'Joined',        value: formatDate(profile.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="text-xs font-semibold text-slate-700">{value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: details / edit */}
        <div className="lg:col-span-2 space-y-4">
          {!editing ? (
            <>
              {/* Contact info */}
              <div className="card">
                <h3 className="font-semibold text-slate-800 mb-2">Contact & Personal</h3>
                <InfoRow label="Phone"   value={profile.phone}/>
                <InfoRow label="Address" value={profile.address}/>
                <InfoRow label="Emergency Contact" value={
                  profile.emergencyContactName || profile.emergencyContact
                    ? `${profile.emergencyContactName || ''} ${profile.emergencyContact ? '· ' + profile.emergencyContact : ''}`.trim()
                    : null
                }/>
              </div>

              {/* Health info */}
              <div className="card">
                <h3 className="font-semibold text-slate-800 mb-2">Health Information</h3>
                {profile.allergies && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-xs font-bold text-red-600 mb-1">⚠ Known Allergies</p>
                    <p className="text-sm text-red-700">{profile.allergies}</p>
                  </div>
                )}
                <InfoRow label="Medical History" value={profile.medicalHistory}/>
                {!profile.allergies && !profile.medicalHistory && (
                  <p className="text-slate-400 text-sm py-3">No health information on file. <button onClick={openEdit} className="text-brand-600 hover:text-brand-700">Add it →</button></p>
                )}
              </div>

              {/* Account info */}
              <div className="card">
                <h3 className="font-semibold text-slate-800 mb-2">Account</h3>
                <InfoRow label="User ID"       value={`#${profile.userId}`}/>
                <InfoRow label="Patient Number" value={profile.patientNumber} highlight/>
                <InfoRow label="Account Status" value={profile.status}/>
                <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">Email and password changes</span> are managed through the clinic administration. Contact reception for help.
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Edit form */
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-800">Edit Profile</h3>
                <button onClick={() => setEditing(false)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Cancel ×</button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Phone" name="phone" value={form.phone} onChange={setF('phone')} placeholder="9876543216"/>
                  <Input label="Address" name="address" value={form.address} onChange={setF('address')} placeholder="Street City" className="sm:col-span-2"/>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <Input label="Emergency Contact Name" name="emergencyContactName" value={form.emergencyContactName} onChange={setF('emergencyContactName')} placeholder="John Anderson"/>
                  <Input label="Emergency Contact Phone" name="emergencyContact" value={form.emergencyContact} onChange={setF('emergencyContact')} placeholder="9999999991"/>
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="label">Known Allergies</label>
                    <textarea value={form.allergies} onChange={setF('allergies')} rows={2}
                      className="input resize-none" placeholder="e.g. Penicillin Aspirin (leave blank if none)"/>
                  </div>
                  <div>
                    <label className="label">Medical History</label>
                    <textarea value={form.medicalHistory} onChange={setF('medicalHistory')} rows={3}
                      className="input resize-none" placeholder="e.g. Hypertension Type-2 Diabetes (leave blank if none)"/>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setEditing(false)} type="button">Cancel</Button>
                  <Button type="submit" loading={saving}>Save Changes</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
