import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter:   { opacity: 1, y: 0, transition: { duration: .3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -4, transition: { duration: .15 } },
}

export default function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)}/>
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="p-4 md:p-6 max-w-screen-xl mx-auto"
            >
              <Outlet/>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
