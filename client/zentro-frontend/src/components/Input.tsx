import React, { forwardRef, useState } from 'react'
import styled, { css } from 'styled-components'

type InputProps = {
  label?: string
  name: string
  type?: string
  placeholder?: string
  value?: string
  isInvalid?: boolean
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'search' | 'email' | 'url'
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onInput?: (e: React.InputEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void
  required?: boolean
  className?: string
  sizes?: 'sm' | 'md' | 'lg'
  showIcon?: boolean // Thêm prop để hiển thị icon
  errors?: Record<string, string>
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
    padding: 10px 20px;
    font-size: 1.175rem;
  `
}

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text);
    display: block;
  }
`

const InputWrapper = styled.div<{ isInvalid: InputProps['isInvalid'] }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px solid ${({ isInvalid = true }) => (isInvalid ? '#e74c3c' : 'var(--var-input-border)')};
  border-radius: 0.313rem;
  transition: all 0.2s ease;

  &:focus-within {
    outline: none;
    border-color: #153060;
    box-shadow: 0 0 0 3px rgba(21, 48, 96, 0.2);
  }
`

const StyledInput = styled.input<{ sizes: InputProps['sizes']; hasIcon: boolean }>`
  border: none;
  outline: none;
  border-radius: 0.313rem;
  width: 100%;

  ${({ hasIcon, sizes = 'md' }) =>
    hasIcon && sizes === 'sm'
      ? css`
          padding-right: 35px;
        `
      : hasIcon && sizes === 'md'
        ? css`
            padding-right: 40px;
          `
        : hasIcon && sizes === 'lg'
          ? css`
              padding-right: 45px;
            `
          : ''}
  ${({ sizes = 'md' }) => sizeType[sizes]}
`

const IconWrapper = styled.div<{ sizes: InputProps['sizes'] }>`
  cursor: pointer;
  background-color: white;
  width: 100%;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;

  ${({ sizes = 'md' }) =>
    sizes === 'sm'
      ? css`
          width: 16px;
          height: 16px;
        `
      : sizes === 'md'
        ? css`
            width: 18px;
            height: 18px;
          `
        : sizes === 'lg'
          ? css`
              width: 20px;
              height: 20px;
            `
          : ''}

  &:hover {
    color: #333;
  }
`

// Email Icon Component
const EmailIcon = () => (
  <svg width='100%' height='100%' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
    <polyline points='22,6 12,13 2,6' />
  </svg>
)

// Eye Icon Component
const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  <svg width='100%' height='100%' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    {isVisible ? (
      <>
        <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
        <circle cx='12' cy='12' r='3' />
      </>
    ) : (
      <>
        <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
        <line x1='1' y1='1' x2='23' y2='23' />
      </>
    )}
  </svg>
)

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    name,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    onInput,
    onKeyDown,
    onPaste,
    isInvalid,
    inputMode,
    required = false,
    className = '',
    sizes = 'md',
    showIcon = true,
    errors = {}
  },
  ref // React.Ref<HTMLInputElement>
) {
  const [showPassword, setShowPassword] = useState(false)

  const isPasswordType = type === 'password' || (type === 'text' && name.toLowerCase().includes('password'))
  const isEmailType = type === 'email' || name.toLowerCase().includes('email')
  const shouldShowIcon = showIcon && (isPasswordType || isEmailType)

  const togglePasswordVisibility = () => {
    if (isPasswordType) setShowPassword((v) => !v)
  }

  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type

  return (
    <InputGroup>
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}

      <InputWrapper isInvalid={!!isInvalid}>
        <StyledInput
          ref={ref} /* ✅ forward DOM ref ra ngoài */
          sizes={sizes}
          name={name}
          type={inputType}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          className={className}
          hasIcon={shouldShowIcon}
          required={required}
        />

        {shouldShowIcon && (
          <IconWrapper sizes={sizes} onClick={togglePasswordVisibility}>
            {isPasswordType ? <EyeIcon isVisible={showPassword} /> : isEmailType ? <EmailIcon /> : null}
          </IconWrapper>
        )}
      </InputWrapper>

      {errors?.[name] && (
        <p style={{ color: 'red', fontSize: '0.75rem' }} id={`${name}-error`}>
          {errors[name]}
        </p>
      )}
    </InputGroup>
  )
})

export default Input
