import { LoginBackGround, LoginMainPage } from './Login'
import Logo from '../../../components/Logo'
import Button from '../../../components/Button'
import { useNavigate } from 'react-router-dom'

export default function ResetSuccess() {
  const navigate = useNavigate()
  function handleClick() {
    navigate('/login', { replace: true })
  }
  return (
    <LoginBackGround>
      <LoginMainPage>
        <div className='auth-right'>
          <Logo width={50} />
          <img src='/upload.svg' className='success' width={'80'} />
          <div className='sec-title'>
            <h1>Thành công</h1>
            <p>Mật khẩu của bạn đã được đổi thành công</p>
          </div>
          <Button type='button' size='lg' onClick={handleClick}>
            Tiếp tục
          </Button>
        </div>
      </LoginMainPage>
    </LoginBackGround>
  )
}
