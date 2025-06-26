import type { ReactNode } from 'react'
import { useAuthStore } from '../feature/auth/stores/authStore'
import Unauthorized from '../components/Unauthorized'
import Loading from '../components/Loading'

interface CanProps {
  resource: string
  action: string
  children: ReactNode
  fallback?: ReactNode // nếu không có quyền, render fallback (nếu muốn)
}

const Can = ({ resource, action, children, fallback = null }: CanProps) => {
  const { permissions, isPermLoading } = useAuthStore()

  fallback = <Unauthorized />

  const allowed = permissions.some((p) => p.resource === resource && p.action === action)

  return <>{allowed && !isPermLoading ? children : isPermLoading ? <Loading /> : fallback}</>
}

export default Can
