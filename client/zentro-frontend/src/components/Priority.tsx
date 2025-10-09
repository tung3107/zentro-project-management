import { ArrowDown, ArrowUp, Flame, Minus } from 'lucide-react'
import React from 'react'
import styled from 'styled-components'

const PriorityLayout = styled.span<{ priority: number; center: boolean }>`
  display: flex;
  padding: 5px 0px;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  text-align: ${({ center }) => (center ? 'center' : 'left')};
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;

  color: ${({ priority }) =>
    priority === 3 ? '#ef4444' : priority === 2 ? '#fa7115ff' : priority === 1 ? '#facc15' : '#22c55e'};
`

export default function Priority({
  priority,
  center,
  className
}: {
  priority: number
  center: boolean
  className: string
}) {
  return (
    <PriorityLayout priority={priority} center={center} className={className}>
      {priority === 3 ? (
        <>
          <Flame size={16} color='#ef4444' />
          Cần gấp
        </>
      ) : priority === 2 ? (
        <>
          <ArrowUp size={16} color='#fa7115ff' />
          Cao
        </>
      ) : priority === 1 ? (
        <>
          <Minus size={16} color='#facc15' />
          Trung bình
        </>
      ) : (
        <>
          <ArrowDown size={16} color='#22c55e' />
          Thấp
        </>
      )}
    </PriorityLayout>
  )
}
