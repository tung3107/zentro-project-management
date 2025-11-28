import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Permission, User } from '../../../types/auth'
import { permission } from 'process'

// interface User {
//   first_name: string
//   last_name: string
//   email: string
//   role_id: number
// }

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isUnauthorized: boolean
  setUnauthorized: (v: boolean) => void
  permissions: Permission[]
  isPermLoading: boolean
  is_change_password: boolean
  setPermLoading: (b: boolean) => void
  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  setPermission: (permissions: Permission[]) => void
  setIsChangePassword: (b: boolean) => void
  projectPermissions: Record<string, any>
  setProjectPermissions: (projectPermissions: Record<string, any>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isUnauthorized: false,
      isPermLoading: false,
      permissions: [],
      is_change_password: true,
      projectPermissions: {},

      setProjectPermissions: (projectPermissions) => set({ projectPermissions }),
      setUnauthorized: (v) => set({ isUnauthorized: v }),
      setIsChangePassword: (b) => set({ is_change_password: b }),

      setPermLoading: (b) => set({ isPermLoading: b }),

      setUser: (user) => set({ user, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      setPermission: (permissions) => set({ permissions }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          permissions: undefined,
          refreshToken: null,
          isAuthenticated: false,
          projectPermissions: {}
        })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        is_change_password: state.is_change_password,
        permissions: state.permissions,
        projectPermissions: state.projectPermissions,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
