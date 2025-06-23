import React from 'react'
import styled from 'styled-components'

// Define props interface for the Dot component
interface DotProps {
  color: string
  delay: string
}

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #fff;
`

const LoadingDots = styled.div`
  display: flex;
  gap: 8px;
`

const Dot = styled.div<DotProps>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  animation: bounce 0.6s infinite ease-in-out;
  animation-delay: ${(props) => props.delay};

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }
`

function Loading() {
  return (
    <LoadingContainer>
      <LoadingDots>
        <Dot color='#d23232' delay='0s' />
        <Dot color='#f37121' delay='0.2s' />
        <Dot color='#153060' delay='0.4s' />
      </LoadingDots>
    </LoadingContainer>
  )
}

export default Loading
