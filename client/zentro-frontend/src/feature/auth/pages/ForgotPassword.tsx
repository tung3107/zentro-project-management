import React from 'react'
import { LoginBackGround, LoginMainPage } from './Login'
import Logo from '../../../components/Logo'
import ForgotPasswordForm from '../components/ForgotPasswordForm'

export default function ForgotPassword() {
  return (
    <LoginBackGround>
      <LoginMainPage>
        <div className='auth-right'>
          <Logo />
          <div className='sec-title'>
            <h1>Quên mật khẩu</h1>
            <p>Hãy nhập email để chúng tôi xác minh</p>
            <p>Chúng tôi sẽ gửi mã OTP cho bạn đến email của bạn</p>
          </div>
          <ForgotPasswordForm />
        </div>
      </LoginMainPage>
    </LoginBackGround>
  )
}
