import { motion } from 'framer-motion'

export default function StatCard({ title, value, sub, trend, icon, color='bg-brand-500', suffix='', index=0 }) {
  const isPos = trend?.startsWith('+') || (typeof trend==='string' && trend.includes('↑'))
  return (
    <motion.div
      initial={{ opacity:0, y:16 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:.35, delay: index * 0.07, ease:'easeOut' }}
      className="card flex flex-col gap-3 hover:shadow-card-hover transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-white text-lg shadow-sm`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{value}{suffix}</p>
        {trend && (
          <p className={`text-xs font-medium mt-0.5 ${isPos?'text-emerald-600':'text-red-500'}`}>
            {trend} <span className="text-slate-400 font-normal">{sub}</span>
          </p>
        )}
        {!trend && sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}
