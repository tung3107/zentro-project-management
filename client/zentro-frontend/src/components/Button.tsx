import React from 'react'
import styled, { css } from 'styled-components'

type ButtonProps = {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const sizeType = {
  sm: css`
    padding: 6px 12px;
    font-size: 0.875rem;
  `,
  md: css`
    padding: 8px 16px;
    font-size: 1rem;
  `,
  lg: css`
    width: 100%;
    padding: 10px 20px;
    font-size: 0.85rem;
  `
}

const StyledButton = styled.button<{ size: ButtonProps['size'] }>`
  border: none;
  width: full;
  border-radius: 12px;
  cursor: pointer;
  background-color: var(--primary);
  color: #ffffff;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: rgb(204, 60, 60);
    outline-offset: 0;
    box-shadow: 0 0 0 0.2rem rgb(254, 191, 191);
  }
  ${({ size = 'md' }) => sizeType[size]}
`

export default function Button({
  children,
  type = 'button',
  size = 'md',
  onClick,
  disabled = false,
  className
}: ButtonProps) {
  return (
    <StyledButton className={className} type={type} size={size} onClick={onClick} disabled={disabled}>
      {children}
    </StyledButton>
  )
}
