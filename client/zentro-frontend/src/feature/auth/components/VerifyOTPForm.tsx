import React, { useState } from 'react'
import Button from '../../../components/Button'
import { type ApiErrorResponse } from '../hooks/useAuth'
import { LoadingBlob } from '../../../components/LoadingBlob'
import { useLocation, useNavigate } from 'react-router-dom'
import { forgotPasswordAPI, verifyOTPAPI } from '../services/auth.service'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import OTPInput from '../../../components/OTPInput'

export default function VerifyOTPForm() {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [isInvalid, setIsInvalid] = useState(false)
  const { state } = useLocation() as { state: { email: string } }

  const email = state?.email

  const resendEmail = async () => {
    try {
      const res = await forgotPasswordAPI(email)
      toast.success(res.data.message.message)
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      toast.error(error.response?.data.error.message ?? 'Lỗi khi gửi OTP!')
    }
  }
  //// ON SUBMIT
  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const res = await verifyOTPAPI(email, otp)
      toast.success(res.data.response.message)

      navigate('/reset-password', {
        state: { email: email, tempResetToken: res.data.response.resetToken },
        replace: true
      })
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      toast.error(error.response?.data.error.message ?? 'Lỗi khi xác thực OTP')
      setIsInvalid(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0 8px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1.25rem',
        maxWidth: '400px',
        width: '100%'
      }}
    >
      <OTPInput
        length={6}
        onChange={(el) => {
          setOtp(el)
          setIsInvalid(false)
        }}
        isInvalid={isInvalid}
      />
      <Button type='submit' size='lg' disabled={isLoading}>
        {isLoading ? <LoadingBlob size={18} /> : 'Tiếp tục'}
      </Button>
      <div>
        <label
          style={{
            color: 'var(--text)',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
        >
          Chưa nhận được mã?{' '}
        </label>
        <button
          onClick={resendEmail}
          style={{
            color: 'var(--primary)',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer'
          }}
          type='button'
        >
          {'Gửi lại mã'}
        </button>
      </div>
    </form>
  )
}
