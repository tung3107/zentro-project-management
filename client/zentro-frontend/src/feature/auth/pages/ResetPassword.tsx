import React from 'react'
import { LoginBackGround, LoginMainPage } from './Login'
import Logo from '../../../components/Logo'
import ResetPasswordForm from '../components/ResetPasswordForm'

export default function ResetPassword() {
  return (
    <LoginBackGround>
      <LoginMainPage>
        <div className='auth-right'>
          <Logo />
          <div className='sec-title'>
            <h1>Mật khẩu mới</h1>
            <p>Nhập mật khẩu mới để bạn có thể truy cập website</p>
          </div>
          <ResetPasswordForm />
        </div>
      </LoginMainPage>
    </LoginBackGround>
  )
}
