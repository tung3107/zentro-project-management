import React, { useMemo, useEffect } from 'react'
import styled from 'styled-components'

interface ProjectCoverProps {
  name: string
  coverUrl?: string | File | null
  height?: number
  rounded?: number
  className?: string
}

const Wrapper = styled.div<{ h: number; r: number }>`
  width: 100%;
  height: ${(p) => p.h}px;
  border-radius: ${(p) => p.r}px;
  overflow: hidden;
  border: 1px solid #e7edf3;
  background: #f6f8fa;
  position: relative;
  transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
`

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const Fallback = styled.div<{ bg: string }>`
  width: 100%;
  height: 100%;
  background: ${(p) => p.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
`

const Initial = styled.span`
  font-weight: 800;
  letter-spacing: 0.5px;
  font-size: clamp(24px, 8vw, 56px);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
`

const getBgColor = (name: string) => {
  const colors = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFEB3B',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#795548',
    '#607D8B'
  ]
  if (!name) return '#607D8B'
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const getInitial = (name: string) => name?.trim()?.charAt(0)?.toUpperCase() || '?'

export default function ProjectAvatar({ name, coverUrl, height = 160, rounded = 12, className }: ProjectCoverProps) {
  const previewUrl = useMemo(() => {
    if (!coverUrl) return null
    if (typeof coverUrl === 'string') return coverUrl
    try {
      return URL.createObjectURL(coverUrl)
    } catch {
      return null
    }
  }, [coverUrl])

  useEffect(() => {
    if (coverUrl && typeof coverUrl !== 'string') {
      const url = URL.createObjectURL(coverUrl)
      return () => URL.revokeObjectURL(url)
    }
  }, [coverUrl])

  const bg = getBgColor(name)
  const initial = getInitial(name)

  return (
    <Wrapper h={height} r={rounded} className={className}>
      {previewUrl ? (
        <Img src={previewUrl} alt={name} />
      ) : (
        <Fallback bg={bg}>
          <Initial>{initial}</Initial>
        </Fallback>
      )}
    </Wrapper>
  )
}
