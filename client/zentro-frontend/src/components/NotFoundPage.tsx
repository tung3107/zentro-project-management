import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%);
  color: #153060;
  position: relative;
  overflow: hidden;
  animation: fadeIn 1.2s ease-in-out;

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const Title = styled.h1`
  font-size: 7rem;
  font-weight: 700;
  margin: 0;
  color: #d23232;
  letter-spacing: 3px;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.8s ease-out;

  @keyframes slideIn {
    0% {
      transform: translateX(-30px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
`

const Message = styled.p`
  font-size: 1.8rem;
  font-weight: 400;
  margin: 1.5rem 0;
  color: #153060;
  opacity: 0.9;
  animation: slideIn 1s ease-out 0.2s forwards;
  opacity: 0;

  @keyframes slideIn {
    0% {
      transform: translateX(-30px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 0.9;
    }
  }
`

const Link = styled(NavLink)`
  font-size: 1.3rem;
  color: #f37121;
  text-decoration: none;
  padding: 0.8rem 2.5rem;
  border: 2px solid #f37121;
  border-radius: 50px;
  background: transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f37121, #d23232);
    transition: left 0.3s ease;
    z-index: -1;
  }

  &:hover {
    color: #fff;
    border-color: transparent;
    &:before {
      left: 0;
    }
  }
`

const Shape = styled.div<{ x: number; y: number; size: number; delay: string }>`
  position: absolute;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  background: linear-gradient(45deg, #d23232, #f37121, #153060);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  opacity: 0.2;
  top: ${(props) => props.y}%;
  left: ${(props) => props.x}%;
  animation: float 5s infinite ease-in-out;
  animation-delay: ${(props) => props.delay};

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
  }
`

const NotFoundPage = () => {
  const shapes = [
    { x: 10, y: 20, size: 50, delay: '0s' },
    { x: 80, y: 30, size: 40, delay: '1s' },
    { x: 20, y: 70, size: 60, delay: '2s' },
    { x: 90, y: 80, size: 30, delay: '0.5s' },
    { x: 70, y: 10, size: 50, delay: '0.3s' },
    { x: 90, y: 80, size: 30, delay: '0.5s' },
    { x: 120, y: 40, size: 30, delay: '0.4s' },
    { x: 60, y: 80, size: 50, delay: '2s' }
  ]

  return (
    <PageContainer>
      {shapes.map((shape, index) => (
        <Shape key={index} x={shape.x} y={shape.y} size={shape.size} delay={shape.delay} />
      ))}
      <Title>404</Title>
      <Message>Page Not Found</Message>
      <Link to='/login'>Return to Home</Link>
    </PageContainer>
  )
}

export default NotFoundPage
