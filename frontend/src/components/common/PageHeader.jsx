import { motion } from 'framer-motion'
import Breadcrumb from './Breadcrumb'

export default function PageHeader({ title, subtitle, action, breadcrumbs }) {
  return (
    <motion.div
      initial={{ opacity:0, y:-8 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:.3 }}
      className="mb-6"
    >
      {breadcrumbs && <Breadcrumb items={breadcrumbs}/>}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </motion.div>
  )
}
