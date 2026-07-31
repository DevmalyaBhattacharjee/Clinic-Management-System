import Avatar from '../common/Avatar'

export default function DoctorCard({ doctor, onBook, selected, compact = false }) {
  const days = doctor.availableDays?.split(',').slice(0,3).join(', ')
  return (
    <div className={`bg-white rounded-2xl border-2 transition-all duration-150 overflow-hidden
      ${selected ? 'border-brand-400 shadow-card-hover' : 'border-slate-100 hover:border-slate-200 shadow-card'}`}>
      {/* Colour band */}
      <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-400"/>
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar name={doctor.name} size="lg"/>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 truncate">{doctor.name}</p>
            <p className="text-xs font-semibold text-brand-600">{doctor.specialization}</p>
            <p className="text-xs text-slate-400 mt-0.5">{doctor.qualification}</p>
          </div>
        </div>
        {!compact && (
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="text-slate-300">⏰</span>
              <span>{doctor.availableFrom?.slice(0,5)} – {doctor.availableTo?.slice(0,5)}</span>
            </div>
            {days && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="text-slate-300">📅</span>
                <span>{days}{doctor.availableDays?.split(',').length > 3 ? ` +${doctor.availableDays.split(',').length - 3}` : ''}</span>
              </div>
            )}
            {doctor.yearsOfExperience && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="text-slate-300">🏅</span>
                <span>{doctor.yearsOfExperience} years experience</span>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            {doctor.consultationFee && (
              <p className="text-base font-black text-slate-800">₹{doctor.consultationFee}</p>
            )}
            <p className="text-[10px] text-slate-400">per consultation</p>
          </div>
          {onBook && (
            <button
              onClick={() => onBook(doctor)}
              className="btn btn-primary btn-sm"
            >
              Book
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
