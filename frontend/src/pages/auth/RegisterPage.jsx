import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import { useToast } from '../../context/ToastContext'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { APP_NAME } from '../../utils/constants'
import { validate, required, isEmail, minLen, isPhone, isPastDate } from '../../utils/validation'
import { passwordStrength } from '../../utils/validation'
import { getErrorMessage } from '../../utils/helpers'
import { useTitle } from '../../hooks/useTitle'

// ─── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${i < current  ? 'bg-emerald-500 text-white' :
                i === current ? 'bg-brand-600 text-white ring-4 ring-brand-100' :
                                'bg-slate-100 text-slate-400'}
            `}>
              {i < current
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                : i + 1
              }
            </div>
            <span className={`text-[10px] font-semibold mt-1 whitespace-nowrap
              ${i === current ? 'text-brand-600' : i < current ? 'text-emerald-600' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-10 sm:w-16 mx-1 mb-5 transition-all duration-300 ${i < current ? 'bg-emerald-400' : 'bg-slate-200'}`}/>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Password strength bar ─────────────────────────────────────────────────────
function PasswordStrengthBar({ password }) {
  const { score, label, color } = passwordStrength(password)
  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300
            ${i <= score ? color : 'bg-slate-200'}`}/>
        ))}
      </div>
      <p className={`text-xs font-medium ${
        score <= 1 ? 'text-red-500' : score === 2 ? 'text-amber-500' :
        score === 3 ? 'text-brand-600' : 'text-emerald-600'
      }`}>
        {label && `Password strength: ${label}`}
        {score <= 2 && password && <span className="text-slate-400 font-normal"> — try adding uppercase, numbers, or symbols</span>}
      </p>
    </div>
  )
}

// ─── Validation rules per step ─────────────────────────────────────────────────
const STEP_RULES = [
  // Step 0 — Account
  {
    name:     [required('Name'), minLen(3, 'Name')],
    email:    [required('Email'), isEmail],
    password: [required('Password'), minLen(6, 'Password')],
  },
  // Step 1 — Personal
  {
    phone:       [required('Phone'), isPhone],
    dateOfBirth: [required('Date of birth'), isPastDate],
    gender:      [required('Gender')],
  },
  // Step 2 — Optional (no required fields)
  {},
]

const GENDER_OPTS   = [{ value:'MALE',label:'Male' },{ value:'FEMALE',label:'Female' },{ value:'OTHER',label:'Other' }]
const BLOOD_OPTS    = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v=>({value:v,label:v}))
const STEPS         = ['Account', 'Personal', 'Medical']

// ─── Initial form state ────────────────────────────────────────────────────────
const INITIAL = {
  name:'', email:'', password:'',
  phone:'', dateOfBirth:'', gender:'', address:'',
  bloodGroup:'', emergencyContactName:'', emergencyContact:'',
  medicalHistory:'', allergies:'',
}

export default function RegisterPage() {
  useTitle('Create Account')
  const [step,    setStep]    = useState(0)
  const [form,    setForm]    = useState(INITIAL)
  const [errors,  setErrors]  = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  const { addToast } = useToast()
  const navigate     = useNavigate()

  const set = (field) => (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(er => { const n = { ...er }; delete n[field]; return n })
  }

  const blur = (field) => () => {
    setTouched(t => ({ ...t, [field]: true }))
    const errs = validate(form, STEP_RULES[step])
    if (errs[field]) setErrors(er => ({ ...er, [field]: errs[field] }))
  }

  // Validate current step fields and touch all of them
  const validateStep = useCallback(() => {
    const rules = STEP_RULES[step]
    const errs  = validate(form, rules)
    const allTouched = Object.keys(rules).reduce((a, k) => ({ ...a, [k]: true }), {})
    setTouched(t => ({ ...t, ...allTouched }))
    setErrors(er => ({ ...er, ...errs }))
    return Object.keys(errs).length === 0
  }, [step, form])

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1)
  }

  const handleBack = () => {
    setStep(s => s - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Final step has no required fields — submit directly
    setLoading(true)
    try {
      await authService.register({
        name:                 form.name,
        email:                form.email,
        password:             form.password,
        phone:                form.phone,
        dateOfBirth:          form.dateOfBirth,
        gender:               form.gender,
        address:              form.address         || undefined,
        bloodGroup:           form.bloodGroup       || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContact:     form.emergencyContact || undefined,
        medicalHistory:       form.medicalHistory   || undefined,
        allergies:            form.allergies        || undefined,
      })
      setDone(true)
      addToast('Account created! Please sign in.', 'success')
    } catch (err) {
      const msg = getErrorMessage(err)
      // Handle email-already-exists from backend
      if (err?.response?.status === 409 || msg.toLowerCase().includes('email')) {
        setStep(0)
        setErrors({ email: 'This email is already registered' })
        addToast('Email already exists. Please use a different one.', 'error')
      } else {
        addToast(msg, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Account created!</h2>
          <p className="text-slate-500 mb-1">Welcome, <span className="font-semibold text-slate-700">{form.name}</span>!</p>
          <p className="text-slate-400 text-sm mb-8">
            Your patient account has been registered. You can now sign in with your credentials.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full btn-lg">
            Go to Sign In
          </Button>
          <div className="mt-6 p-4 bg-white border border-slate-200 rounded-xl text-left shadow-card">
            <p className="text-xs font-semibold text-slate-500 mb-2">Your login credentials</p>
            <div className="space-y-1 text-sm">
              <p><span className="text-slate-400">Email:</span> <span className="font-mono text-slate-700">{form.email}</span></p>
              <p><span className="text-slate-400">Role:</span> <span className="font-semibold text-emerald-600">Patient</span></p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[38%] bg-gradient-to-br from-emerald-700 via-teal-600 to-brand-600 relative overflow-hidden p-12">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full"/>
        <div className="absolute bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full"/>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2.5 mb-auto">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span className="text-white font-bold text-lg">{APP_NAME}</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Join our<br/>clinic network.
            </h2>
            <p className="text-emerald-100 leading-relaxed mb-8">
              Create your patient account in under 2 minutes and get access to online appointment booking, medical records, and more.
            </p>
            <div className="space-y-3">
              {[
                ['📅','Book appointments online 24/7'],
                ['📋','Access your complete medical history'],
                ['💊','View and track your prescriptions'],
                ['💳','See billing history and outstanding dues'],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="text-base">{icon}</span>
                  <span className="text-emerald-100 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/20 pt-6">
            <p className="text-emerald-200 text-sm">Already have an account?</p>
            <Link to="/login" className="text-white font-semibold text-sm underline underline-offset-2 hover:text-emerald-100 transition-colors">
              Sign in instead →
            </Link>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-10 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Mobile back link */}
          <div className="lg:hidden mb-6 flex items-center gap-2">
            <Link to="/login" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Back to login
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create patient account</h2>
            <p className="text-slate-400 text-sm mt-1">Fill in {STEPS.length} quick steps • takes about 2 minutes</p>
          </div>

          <StepIndicator current={step} steps={STEPS}/>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">

            {/* ── STEP 0: Account ── */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-0.5">Account details</h3>
                  <p className="text-xs text-slate-400">These are your login credentials</p>
                </div>

                <Input
                  label="Full name"
                  name="name"
                  value={form.name}
                  onChange={set('name')}
                  onBlur={blur('name')}
                  error={touched.name && errors.name}
                  placeholder="Alice Anderson"
                  required
                  autoComplete="name"
                />
                <Input
                  label="Email address"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={set('email')}
                  onBlur={blur('email')}
                  error={touched.email && errors.email}
                  placeholder="alice@example.com"
                  required
                  autoComplete="email"
                />
                <div>
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={set('password')}
                    onBlur={blur('password')}
                    error={touched.password && errors.password}
                    placeholder="Min. 6 characters"
                    required
                    autoComplete="new-password"
                  />
                  <PasswordStrengthBar password={form.password}/>
                </div>
              </div>
            )}

            {/* ── STEP 1: Personal ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-0.5">Personal information</h3>
                  <p className="text-xs text-slate-400">Required for your patient profile</p>
                </div>

                <Input
                  label="Phone number"
                  name="phone"
                  value={form.phone}
                  onChange={set('phone')}
                  onBlur={blur('phone')}
                  error={touched.phone && errors.phone}
                  placeholder="9876543210"
                  required
                  autoComplete="tel"
                />
                <Input
                  label="Date of birth"
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={set('dateOfBirth')}
                  onBlur={blur('dateOfBirth')}
                  error={touched.dateOfBirth && errors.dateOfBirth}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
                <Select
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={set('gender')}
                  error={touched.gender && errors.gender}
                  options={GENDER_OPTS}
                  required
                />
                <Input
                  label="Home address"
                  name="address"
                  value={form.address}
                  onChange={set('address')}
                  placeholder="Street City State"
                  autoComplete="street-address"
                />
              </div>
            )}

            {/* ── STEP 2: Medical (all optional) ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-0.5">Medical information</h3>
                  <p className="text-xs text-slate-400">All fields optional — helps doctors treat you better</p>
                </div>

                <Select
                  label="Blood group"
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={set('bloodGroup')}
                  options={BLOOD_OPTS}
                  placeholder="Select blood group"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Emergency contact name"
                    name="emergencyContactName"
                    value={form.emergencyContactName}
                    onChange={set('emergencyContactName')}
                    placeholder="John Anderson"
                  />
                  <Input
                    label="Emergency phone"
                    name="emergencyContact"
                    value={form.emergencyContact}
                    onChange={set('emergencyContact')}
                    placeholder="9999999991"
                  />
                </div>
                <div>
                  <label className="label">Known allergies</label>
                  <textarea
                    name="allergies"
                    value={form.allergies}
                    onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))}
                    rows={2}
                    placeholder="e.g. Penicillin Aspirin (leave blank if none)"
                    className="input resize-none"
                  />
                </div>
                <div>
                  <label className="label">Medical history</label>
                  <textarea
                    name="medicalHistory"
                    value={form.medicalHistory}
                    onChange={e => setForm(f => ({ ...f, medicalHistory: e.target.value }))}
                    rows={3}
                    placeholder="e.g. Hypertension Type-2 Diabetes (leave blank if none)"
                    className="input resize-none"
                  />
                </div>
              </div>
            )}

            {/* ── Navigation buttons ── */}
            <div className={`flex gap-3 mt-6 pt-5 border-t border-slate-100 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
              {step > 0 && (
                <Button variant="secondary" onClick={handleBack} type="button">
                  ← Back
                </Button>
              )}

              {step < STEPS.length - 1 ? (
                <Button onClick={handleNext} type="button">
                  Continue →
                </Button>
              ) : (
                <Button onClick={handleSubmit} loading={loading} type="button">
                  {loading ? 'Creating account…' : 'Create account ✓'}
                </Button>
              )}
            </div>
          </div>

          {/* Fine print */}
          <p className="text-center text-xs text-slate-400 mt-5">
            By creating an account you agree to our{' '}
            <span className="text-brand-500 cursor-pointer">Terms of Service</span> and{' '}
            <span className="text-brand-500 cursor-pointer">Privacy Policy</span>.
          </p>
          <p className="text-center text-sm text-slate-400 mt-3">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
