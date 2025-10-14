// src/util/GuestRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../feature/auth/stores/authStore'

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (isAuthenticated && user?.role_name) {
    const role = user.role_name.toLowerCase()
    const from = (location.state as any)?.from?.pathname

    if (from) return <Navigate to={from} replace />
    if (role.includes('admin')) return <Navigate to='/admin' replace />
    if (role.includes('member')) return <Navigate to='/member' replace />
    return <Navigate to='/' replace />
  }

  return <>{children}</>
}

export default GuestRoute
