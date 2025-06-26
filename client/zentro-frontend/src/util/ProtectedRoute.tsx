import React, { type JSX, type ReactNode } from 'react'
import { useAuthStore } from '../feature/auth/stores/authStore'
import Loading from '../components/Loading'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  const { accessToken, isPermLoading, isAuthenticated } = useAuthStore()

  const hasHydrated = useAuthStore.persist.hasHydrated()

  if (!hasHydrated) return <Loading />

  // 1️⃣ Đang load quyền / token → chờ
  if (isPermLoading) {
    return <Loading />
  }

  // 2️⃣ Đã xác thực & có token → cho vào
  if (isAuthenticated && accessToken) {
    return <Outlet />
  }

  // 3️⃣ Mọi trường hợp còn lại → đá về login
  return <Navigate to='/login' replace />
}
