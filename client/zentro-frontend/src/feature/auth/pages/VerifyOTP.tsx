import React from 'react'
import { LoginBackGround, LoginMainPage } from './Login'
import Logo from '../../../components/Logo'
import VerifyOTPForm from '../components/VerifyOTPForm'

export default function VerifyOTP() {
  return (
    <LoginBackGround>
      <LoginMainPage>
        <div className='auth-right'>
          <Logo />
          <div className='sec-title'>
            <h1>Xác thực</h1>
            <p>Nhập OTP gồm 6 số được gửi đến email của bạn</p>
          </div>
          <VerifyOTPForm />
        </div>
      </LoginMainPage>
    </LoginBackGround>
  )
}
