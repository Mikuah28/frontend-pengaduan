// src/app/layout.jsx
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'AduLink — Platform Pengaduan Masyarakat',
  description: 'Sampaikan aduan, wujudkan perubahan.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '13px',
                borderRadius: '12px',
                border: '0.5px solid #D3D1C7',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
