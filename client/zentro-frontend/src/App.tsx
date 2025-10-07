import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import NotFoundPage from './components/NotFoundPage'
import Loading from './components/Loading'
import { usePermission } from './util/usePermission'
import ProtectedRoute from './util/ProtectedRoute'
import Can from './util/Can'
import ResetPassword from './feature/auth/pages/ResetPassword'
import ResetSuccess from './feature/auth/pages/ResetSuccess'
import Project from './feature/admin/pages/Project'
import AdminMainLayout from './feature/admin/components/AdminMainLayout'
import User from './feature/admin/pages/User'
import ResetPasswordFirstLogin from './feature/auth/pages/ResetPasswordFirstLogin'
import Role from './feature/admin/pages/Role'
import Dashboard from './feature/admin/pages/Dashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0
    }
  }
})
const Login = lazy(() => import('./feature/auth/pages/Login'))
const ForgotPassword = lazy(() => import('./feature/auth/pages/ForgotPassword'))
const VerifyOTP = lazy(() => import('./feature/auth/pages/VerifyOTP'))

function App() {
  usePermission()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path='login' element={<Login />} />
            <Route path='forgot-password' element={<ForgotPassword />} />
            <Route path='verify-otp' element={<VerifyOTP />} />
            <Route path='reset-password' element={<ResetPassword />} />
            <Route path='reset-success' element={<ResetSuccess />} />

            <Route
              path='reset-password-first-login'
              element={
                <ProtectedRoute>
                  <ResetPasswordFirstLogin />
                </ProtectedRoute>
              }
            />

            <Route
              path='admin'
              element={
                <ProtectedRoute>
                  <AdminMainLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path='projects'
                element={
                  <Can resource='dashboard' action='read'>
                    <Project />
                  </Can>
                }
              />
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='roles' element={<Role />} />
              <Route
                path='users'
                element={
                  <Can resource='user' action='read'>
                    <User />
                  </Can>
                }
              />
            </Route>

            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
