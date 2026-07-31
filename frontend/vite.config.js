import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages':      resolve(__dirname, 'src/pages'),
        '@hooks':      resolve(__dirname, 'src/hooks'),
        '@utils':      resolve(__dirname, 'src/utils'),
        '@services':   resolve(__dirname, 'src/services'),
        '@context':    resolve(__dirname, 'src/context'),
      },
    },

    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true,
          pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
        },
      },
      rollupOptions: {
        output: {
          // Manual code splitting — each role gets its own chunk
          manualChunks: {
            'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
            'vendor-charts':   ['recharts'],
            'vendor-motion':   ['framer-motion'],
            'vendor-axios':    ['axios'],
            'pages-auth':      [
              './src/pages/auth/LoginPage.jsx',
              './src/pages/auth/RegisterPage.jsx',
              './src/pages/auth/ForgotPasswordPage.jsx',
            ],
            'pages-admin':     [
              './src/pages/admin/AdminDashboard.jsx',
              './src/pages/admin/AdminDoctors.jsx',
              './src/pages/admin/AdminPatients.jsx',
              './src/pages/admin/AdminReceptionists.jsx',
              './src/pages/admin/AdminAppointments.jsx',
              './src/pages/admin/AdminSettings.jsx',
            ],
            'pages-doctor':    [
              './src/pages/doctor/DoctorDashboard.jsx',
              './src/pages/doctor/DoctorAppointments.jsx',
              './src/pages/doctor/DoctorPatients.jsx',
              './src/pages/doctor/DoctorRecords.jsx',
              './src/pages/doctor/DoctorPrescriptions.jsx',
              './src/pages/doctor/DoctorAvailability.jsx',
            ],
            'pages-patient':   [
              './src/pages/patient/PatientDashboard.jsx',
              './src/pages/patient/PatientAppointments.jsx',
              './src/pages/patient/PatientRecords.jsx',
              './src/pages/patient/PatientPrescriptions.jsx',
              './src/pages/patient/PatientBills.jsx',
            ],
            'pages-receptionist': [
              './src/pages/receptionist/ReceptionistDashboard.jsx',
              './src/pages/receptionist/ReceptionistPatients.jsx',
              './src/pages/receptionist/ReceptionistAppointments.jsx',
              './src/pages/receptionist/ReceptionistBilling.jsx',
              './src/pages/receptionist/ReceptionistDoctors.jsx',
            ],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios', 'recharts', 'framer-motion'],
    },
  }
})
