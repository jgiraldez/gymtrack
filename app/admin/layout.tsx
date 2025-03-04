import { Metadata } from 'next'
import AdminDashboard from './page'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing users, exercises, and statistics',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#000000',
}

export default function AdminLayout() {
  return <AdminDashboard />
} 