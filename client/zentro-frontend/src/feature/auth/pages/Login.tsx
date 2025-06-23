import React from 'react'
import Logo from '../../../components/Logo'
import styled from 'styled-components'
import LoginForm from '../components/LoginForm'

const LoginBackGround = styled.div`
  background-image: url(/LOGIN.png);
  background-size: cover;
  background-repeat: no-repeat;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

const LoginMainPage = styled.div`
    background-color: #fff;
    border: none;
    border-radius: 1rem;
    padding: 2.625rem 4rem; 
    width: fit-content;
    height: fit-content;
    border-radius; 15px;
    min-width: auto;
    display: flex;
    align-items: center;
    gap: 7.375rem;
    flex-direction: row;
    color: #030303;

    .illustration {
        max-width:600px;
        min-width: auto;

    }

        .auth-right {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 8px 0 8px;
            align-items: center;
            gap: 1.5rem;
            max-width: 400px;
        }
            .sec-title {
                display: flex;
                flex-direction: column;
                align-items: center;
                
                h1 {
                    font-size: 2.5rem;  
                    color: var(--text);
                }
                p {
                    font-size: 1.25rem;
                    color: #636364;
                    align-content: center;
                }
            }

            @media(min-width: 768px) and (max-width: 1400px) {
        .illustration {
        max-width:400px;
        min-width: auto;

    }
        .auth-right {
            gap: 1rem;
        }
        .sec-title {
            
            h1 {
                font-size: 1.5rem; 
            }
            p {
                font-size: 0.95rem;
            }
        }
    }
    
`

export default function Login() {
  return (
    <LoginBackGround>
      <LoginMainPage>
        <div>
          <img src='/Illustra_1.svg' alt='illu' className='illustration' />
        </div>
        <div className='auth-right'>
          <Logo />
          <div className='sec-title'>
            <h1>XIN CHÀO!</h1>
            <p>Chào mừng bạn! Đăng nhập để sử dụng</p>
          </div>
          <LoginForm />
        </div>
      </LoginMainPage>
    </LoginBackGround>
  )
}

export { LoginBackGround, LoginMainPage }
