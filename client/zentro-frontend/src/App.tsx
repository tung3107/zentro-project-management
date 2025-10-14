import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import Dashboard from './feature/member/pages/Dashboard'
import ProjectViewModal from './feature/admin/pages/ProjectViewModal'
import Test from './feature/auth/components/Test'
import GuestRoute from './util/GuestRoute'
import MemberMainLayout from './feature/member/components/MemberMainLayout'
import ProjectView from './feature/member/pages/ProjectView'

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
            <Route
              path='login'
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path='forgot-password'
              element={
                <GuestRoute>
                  <ForgotPassword />
                </GuestRoute>
              }
            />
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
              <Route index element={<Navigate to='users' replace />} />
              <Route
                path='projects'
                element={
                  <Can resource='dashboard' action='read'>
                    <Project />
                  </Can>
                }
              />
              <Route
                path='projects/:projectId/*'
                element={
                  <Can resource='dashboard' action='read'>
                    <ProjectViewModal />
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
            <Route
              path='member'
              element={
                <ProtectedRoute>
                  <MemberMainLayout />
                </ProtectedRoute>
              }
            >
              <Route path='users' element={<Test />} />
              <Route path='projects/:projectId/*' element={<ProjectView />} />
            </Route>

            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
