import React, { type JSX } from 'react'
import { useAuthStore } from '../feature/auth/stores/authStore'
import Loading from '../components/Loading'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { accessToken, isPermLoading, isAuthenticated } = useAuthStore()

  const hasHydrated = useAuthStore.persist.hasHydrated()

  if (!hasHydrated) return <Loading />

  // 1️⃣ Đang load quyền / token → chờ
  if (isPermLoading) {
    return <Loading />
  }

  // 2️⃣ Đã xác thực & có token → cho vào
  if (isAuthenticated && accessToken) {
    return children
  }

  // 3️⃣ Mọi trường hợp còn lại → đá về login
  return <Navigate to='/login' replace />
}
