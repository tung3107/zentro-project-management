import { X, Check } from 'lucide-react'
import React, { type ReactNode, useEffect } from 'react'
import styled from 'styled-components'
import Button from './Button'
import { LoadingBlob } from './LoadingBlob'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  modalTitle?: string
  isLoading?: boolean
  children: ReactNode
  setModalOpen: (open: boolean) => void
  setModalContent: (content: ReactNode | null) => void
  onSubmit?: () => void
  title: string
  formable: boolean
  width?: string
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(${({ isOpen }) => (isOpen ? '1' : '0')});
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transition: all 0.4s ease-in-out;
  width: 500px;
  max-width: 90%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 80vh;
`

const Header = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e7e7e7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;

  h2 {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 18px;
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
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`

const Content = styled.div`
  padding: 12px 24px;
  font-family: 'Inter', sans-serif;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;

  .title {
    font-size: 20px;
    font-weight: 600;
    text-align: center;
  }

  .subtitle {
    font-size: 16px;
    text-align: center;
    color: #555;
  }
`

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e7e7e7;
  display: flex;
  justify-content: center;
  gap: 16px;
  background: #fff;
`

export default function OverlayCenterModal({
  isOpen,
  onClose,
  children,
  isLoading = false,
  setModalOpen,
  setModalContent,
  onSubmit,
  title,
  formable,
  width
}: ModalProps) {
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
      <SlideIn isOpen={isOpen} style={{ width: `${width}` }}>
        <Header>
          <h2>{title}</h2>
          <CloseButton onClick={onClose}>
            <X strokeWidth={1.5} color='#717D84' size={20} />
          </CloseButton>
        </Header>

        <Content>{children}</Content>

        {!formable && (
          <Footer>
            <Button className='flex items-center gap-2' type='button' onClick={onSubmit}>
              {isLoading ? (
                <LoadingBlob />
              ) : (
                <>
                  <Check strokeWidth={1.5} size={18} />
                  <span className='text-md'>Xác nhận</span>
                </>
              )}
            </Button>
            <button
              className='px-4 py-2 flex items-center gap-2 hover:underline cursor-pointer'
              type='button'
              onClick={() => {
                setModalOpen(false)
                setModalContent(null)
              }}
            >
              <span className='text-md text-gray-600'>Hủy bỏ</span>
            </button>
          </Footer>
        )}
      </SlideIn>
    </>
  )
}
