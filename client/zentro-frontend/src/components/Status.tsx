import React from 'react'
import styled from 'styled-components'

const StatusLayout = styled.span<{ status: string; center: boolean }>`
  display: inline-block;
  padding: 5px 10px;
  text-align: ${({ center }) => (center ? 'center' : 'left')};
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ status }) =>
    status === 'ĐANG DIỄN RA'
      ? '#EBFCFC'
      : status === 'ĐANG CHUẨN BỊ'
        ? '#EAF5FF'
        : status === 'BỊ HỦY'
          ? '#F7E2E2'
          : status === 'TẠM DỪNG'
            ? '#FFF5EB'
            : '#E9F7EF'};
  color: ${({ status }) =>
    status === 'ĐANG DIỄN RA'
      ? '#00D1D4'
      : status === 'ĐANG CHUẨN BỊ'
        ? '#0071D9'
        : status === 'BỊ HỦY'
          ? '#FF2222'
          : status === 'TẠM DỪNG'
            ? '#F15C1C'
            : '#20A756'};
`

export default function Status({ status, center }: { status: string; center: boolean }) {
  return (
    <StatusLayout status={status} center={center}>
      {status}
    </StatusLayout>
  )
}
