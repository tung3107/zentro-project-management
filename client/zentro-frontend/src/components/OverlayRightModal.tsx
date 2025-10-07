import { X } from 'lucide-react'
import React, { type ReactNode, useEffect } from 'react'
import styled from 'styled-components'

interface Modal {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  modalTitle: string
}

const Overlay = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
`

const SlideIn = styled.div<{ isOpen: boolean }>`
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 0;
  right: 0;
  width: 40%;
  height: 100%;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  background: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
  transform: translateX(${({ isOpen }) => (isOpen ? '0' : '100%')});
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 1000;

  @media (max-width: 768px) {
    width: 90%;
  }

  @media (max-width: 480px) {
    width: 100%;
    border-radius: 0;
  }
`

const Header = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid #e7e7e7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background: #fff;

  h2 {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 20px;
    line-height: 150%;
    margin: 0;
    color: #1a1a1a;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 100px;
`

export default function OverlayRightModal({ isOpen, onClose, children, modalTitle }: Modal) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <SlideIn isOpen={isOpen}>
        <Header>
          <h2>{modalTitle}</h2>
          <CloseButton onClick={onClose}>
            <X strokeWidth={1.5} color='#717D84' size={20} />
          </CloseButton>
        </Header>
        <Content>{children}</Content>
      </SlideIn>
    </>
  )
}
