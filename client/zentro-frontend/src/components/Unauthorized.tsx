import React from 'react'
import { NavLink } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'

/**
 * Unauthorized Page – 403
 * Giữ nguyên bảng màu (#d23232, #f37121, #153060) nhưng thiết kế mới hoàn toàn
 * - Hình nền gradient chéo
 * - Icon ổ khoá heartbeat
 * - Bubbles trôi ngược chiều để tạo chiều sâu
 */

// Gradient background slide
const slide = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const Page = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.8rem;
  min-height: 100vh;
  color: #153060;
  background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 35%, #ffffff 100%);
  background-size: 400% 400%;
  animation: ${slide} 12s ease infinite;
  overflow: hidden;
`

// Pulse animation for the lock icon
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
`

const LockCircle = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(145deg, #d23232, #f37121);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: ${pulse} 2.2s ease-in-out infinite;
`

const LockIcon = styled.i`
  display: block;
  width: 70px;
  height: 90px;
  position: relative;
  &:before,
  &:after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
  }
  /* thân ổ khoá */
  &:before {
    width: 50px;
    height: 55px;
    bottom: 0;
    border-radius: 8px;
  }
  /* vòng cung */
  &:after {
    width: 45px;
    height: 45px;
    top: -25px;
    border: 6px solid #fff;
    border-bottom: none;
    border-radius: 45px 45px 0 0;
    box-sizing: border-box;
  }
`

const Code = styled.h1`
  font-size: 5.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 4px;
  color: #d23232;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.18);
`

const Text = styled.p`
  font-size: 1.6rem;
  text-align: center;
  margin: 0 2rem;
  max-width: 440px;
  line-height: 1.45;
  opacity: 0.95;
`

const HomeLink = styled(NavLink)`
  font-size: 1.2rem;
  color: #fff;
  background: #f37121;
  padding: 0.9rem 2.8rem;
  border-radius: 40px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease;
  box-shadow: 0 8px 18px rgba(243, 113, 33, 0.35);

  &:hover {
    transform: translateY(-2px);
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
    transition: left 0.45s ease;
  }

  &:hover:after {
    left: 100%;
  }
`

// Floating bubbles
const float = keyframes`
  0%   { transform: translateY(0) scale(1);   opacity: 0.4; }
  50%  { transform: translateY(-120px) scale(1.15); opacity: 0.7; }
  100% { transform: translateY(-240px) scale(1);   opacity: 0.4; }
`

const Bubble = styled.span<{ left: number; size: number; delay: number }>`
  position: absolute;
  bottom: -100px;
  left: ${(p) => p.left}%;
  width: ${(p) => p.size}px;
  height: ${(p) => p.size}px;
  background: linear-gradient(45deg, #153060 0%, #d23232 100%);
  border-radius: 50%;
  opacity: 0.5;
  animation: ${float} 8s linear infinite;
  animation-delay: ${(p) => p.delay}s;
  filter: blur(1px);
`

const Unauthorized: React.FC = () => {
  const bubbles = [
    { left: 5, size: 28, delay: 0 },
    { left: 15, size: 36, delay: 0.8 },
    { left: 30, size: 22, delay: 1.6 },
    { left: 45, size: 32, delay: 0.4 },
    { left: 60, size: 26, delay: 1.2 },
    { left: 75, size: 38, delay: 0.2 },
    { left: 88, size: 24, delay: 1.4 }
  ]

  return (
    <Page>
      {bubbles.map((b, i) => (
        <Bubble key={i} left={b.left} size={b.size} delay={b.delay} />
      ))}

      <LockCircle>
        <LockIcon />
      </LockCircle>

      <Code>403</Code>
      <Text>
        Bạn không có quyền truy cập trang này.
        <br /> Vui lòng đăng nhập bằng tài khoản phù hợp.
      </Text>

      <HomeLink to='/login'>Đăng nhập</HomeLink>
    </Page>
  )
}

export default Unauthorized
