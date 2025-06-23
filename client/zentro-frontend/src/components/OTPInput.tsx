import React, { useRef } from 'react'
import styled from 'styled-components'
import Input from './Input'

export interface OTPInputProps {
  length: number
  onChange?: (val: string) => void
  onComplete?: (val: string) => void
  isInvalid?: boolean
}

const OTPWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  max-height: 50px;

  input {
    text-align: center;
    height: 50px;
    width: 50px;
  }
`

export default function OTPInput({ length, onChange, onComplete, isInvalid = true }: OTPInputProps) {
  /// mảng ref
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  //// di chuyển focus đến vị trí tiếp
  const focusInput = (index: number) => {
    inputs.current[index]?.focus()
    inputs.current[index]?.select()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const alphaRegex = /[^0-9]/g
    // loai bo chu cai
    let value = e.target.value

    if (alphaRegex.test(value)) {
      const el = inputs.current[index]
      if (el) el.value = el.value.replace(/[^0-9]/g, '').slice(-1)
    }

    if (value.length >= 2) {
      const el = inputs.current[index]
      if (el) el.value = el.value.slice(0, 1)
    }
    value = value.replace(/[^0-9]/g, '').slice(-1)

    const currentValues = inputs.current.map((el) => el?.value ?? '').join('')

    onChange?.(currentValues)

    /// chuyen o tiep
    if (value && index < length - 1) {
      focusInput(index + 1)
    }

    if (value && currentValues.length === length) onComplete?.(currentValues)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    /// Neu bam backspace va o hien tai da xoa
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      focusInput(index - 1)
    }
  }
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const paste = e.clipboardData
      .getData('text')
      .replace(/[^0-9]/g, '')
      .slice(0, length)

    paste.split('').forEach((char, i) => {
      const el = inputs.current[i]
      if (el) el.value = char
    })

    const currentValues = inputs.current.map((el) => el?.value ?? '').join('')
    onChange?.(currentValues)

    if (paste.length === length) onComplete?.(paste)

    focusInput(Math.min(paste.length, length - 1))
  }

  return (
    <OTPWrapper>
      {Array.from({ length }).map((_, i) => (
        <Input
          name='otp'
          type='text'
          inputMode='numeric'
          key={i}
          isInvalid={isInvalid}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          ref={(el) => {
            inputs.current[i] = el
          }}
        />
      ))}
    </OTPWrapper>
  )
}
