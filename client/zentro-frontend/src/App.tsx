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

            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
