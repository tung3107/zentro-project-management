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
  permissions: Permission[]
  isPermLoading: boolean
  setPermLoading: (b: boolean) => void
  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  setPermission: (permissions: Permission[]) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isPermLoading: false,
      permissions: [],

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
          isAuthenticated: false
        })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
