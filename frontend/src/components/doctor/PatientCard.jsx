import Avatar from '../common/Avatar'
import { formatDate } from '../../utils/helpers'

export default function PatientCard({ patient, onClick, selected }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
        ${selected
          ? 'border-brand-300 bg-brand-50 shadow-sm'
          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}`}
    >
      <Avatar name={patient.name} size="md"/>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-800 truncate">{patient.name}</p>
        <p className="text-xs text-slate-400 truncate">{patient.patientNumber}</p>
        {patient.bloodGroup && (
          <span className="inline-block mt-0.5 px-1.5 py-0 text-[10px] font-bold bg-red-100 text-red-600 rounded">
            {patient.bloodGroup}
          </span>
        )}
      </div>
      <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  )
}
