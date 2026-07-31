export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'clinic_token';
export const USER_KEY  = import.meta.env.VITE_USER_KEY  || 'clinic_user';
export const API_URL   = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const APP_NAME  = import.meta.env.VITE_APP_NAME || 'MediCure';

export const ROLES = { ADMIN:'ADMIN', DOCTOR:'DOCTOR', PATIENT:'PATIENT', RECEPTIONIST:'RECEPTIONIST' };

export const ROLE_META = {
  ADMIN:        { label:'Administrator', icon:'🛡️', color:'from-violet-500 to-purple-600', bg:'bg-violet-50', text:'text-violet-700', border:'border-violet-200' },
  DOCTOR:       { label:'Doctor',        icon:'🩺', color:'from-brand-500 to-brand-700',   bg:'bg-brand-50',  text:'text-brand-700',  border:'border-brand-200'  },
  PATIENT:      { label:'Patient',       icon:'🏥', color:'from-emerald-400 to-teal-600',  bg:'bg-emerald-50',text:'text-emerald-700',border:'border-emerald-200'},
  RECEPTIONIST: { label:'Receptionist',  icon:'💼', color:'from-amber-400 to-orange-500',  bg:'bg-amber-50',  text:'text-amber-700',  border:'border-amber-200'  },
};

export const ROLE_DASHBOARDS = {
  ADMIN:'/admin/dashboard', DOCTOR:'/doctor/dashboard',
  PATIENT:'/patient/dashboard', RECEPTIONIST:'/receptionist/dashboard',
};

export const APPOINTMENT_STATUS_COLORS = {
  SCHEDULED:'badge-blue', CONFIRMED:'badge-green', IN_PROGRESS:'badge-amber',
  COMPLETED:'badge-green', CANCELLED:'badge-red', NO_SHOW:'badge-slate',
};

export const BILL_STATUS_COLORS = {
  UNPAID:'badge-red', PARTIALLY_PAID:'badge-amber', PAID:'badge-green', CANCELLED:'badge-slate',
};
