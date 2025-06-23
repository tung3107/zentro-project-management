// LoadingBlob.tsx
import React from 'react'
import styled, { keyframes } from 'styled-components'

// Animation: hai khối tròn chạy qua lại & phóng to/thu nhỏ nhẹ
const blobMove = keyframes`
  0%, 100% { transform: translateX(-60%) scale(1); }
  50%      { transform: translateX(60%)  scale(1.15); }
`

// Container chính
const GooeyWrapper = styled.div<{ size: number; color: string }>`
  --size: ${({ size }) => size}px;
  --clr: ${({ color }) => color};

  width: var(--size);
  height: var(--size);
  position: relative;
  filter: url('#gooey-filter'); /* tạo hiệu ứng dính */

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    translatey: 50%;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: var(--clr);
    animation: ${blobMove} 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  /* Khối thứ 2 lệch nhịp để không đồng pha */
  &::after {
    animation-delay: 0.6s;
  }
`

// Component SVG filter “gooey”
const GooeyFilter = () => (
  <svg width='0' height='0' style={{ position: 'absolute' }}>
    <filter id='gooey-filter'>
      <feGaussianBlur in='SourceGraphic' stdDeviation='6' result='blur' />
      <feColorMatrix
        in='blur'
        mode='matrix'
        values='
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          0 0 0 20 -10'
        result='goo'
      />
      <feComposite in='SourceGraphic' in2='goo' operator='atop' />
    </filter>
  </svg>
)

// Component xuất ra
export interface LoadingBlobProps {
  size?: number // px, mặc định 20
  color?: string // màu chính, mặc định #ff5f6d (gradient hồng‑cam)
  ariaLabel?: string // text trợ năng
}

export const LoadingBlob: React.FC<LoadingBlobProps> = ({ size = 20, color = '#ff5f6d', ariaLabel = 'Loading...' }) => (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    {/* SVG filter chỉ cần render 1 lần trong cây DOM */}
    <GooeyFilter />
    <GooeyWrapper size={size} color={color} role='status' aria-label={ariaLabel} />
  </div>
)
