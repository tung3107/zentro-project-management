import React, { type JSX, type ReactNode } from 'react'
import { useAuthStore } from '../feature/auth/stores/authStore'
import Loading from '../components/Loading'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { accessToken, isPermLoading, isAuthenticated, is_change_password, user } = useAuthStore()

  const hasHydrated = useAuthStore.persist.hasHydrated()

  if (!hasHydrated) return <Loading />

  // 1️⃣ Đang load quyền / token → chờ
  if (isPermLoading) {
    return <Loading />
  }

  if (location.pathname !== '/reset-password-first-login' && is_change_password && isAuthenticated && accessToken)
    return <Navigate to='/reset-password-first-login' replace state={{ email: user?.email }} />

  if (location.pathname === '/reset-password-first-login' && is_change_password && isAuthenticated && accessToken) {
    return children
  }

  const role = user?.role_name?.toLowerCase() || ''

  // 🔒 Member không được vào admin
  if (role.includes('member') && location.pathname.startsWith('/admin')) {
    return <Navigate to='/member' replace />
  }

  // 🔒 Admin không được vào member
  if (role.includes('admin') && location.pathname.startsWith('/member')) {
    return <Navigate to='/admin' replace />
  }

  // 2️⃣ Đã xác thực & có token → cho vào
  if (isAuthenticated && accessToken) {
    return children
  }

  // 3️⃣ Mọi trường hợp còn lại → đá về login
  return <Navigate to='/login' replace />
}
