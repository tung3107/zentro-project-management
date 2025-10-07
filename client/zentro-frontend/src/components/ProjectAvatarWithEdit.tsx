import React, { useRef, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  name: string
  coverUrl?: string | File | null
  onCoverChange?: (file: File) => void
  height?: number
  rounded?: number
  className?: string
}

const MAX_SIZE_MB = 10
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/svg+xml']

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

const UploadBtn = styled.button`
  position: absolute;
  bottom: 12px;
  right: 20px;
  z-index: 3;
  background: #fff;
  border-radius: 50%;
  border: 1.5px solid #e2e6ea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 9px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: #e9f0fc;
  }
  display: flex;
  align-items: center;
  justify-content: center;
`
const LoadingWrap = styled.div`
  position: absolute;
  inset: 0;
  z-index: 5;
  background: rgba(250, 250, 250, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
`

// Giống avatar logic cũ
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

export default function ProjectAvatarWithEdit({
  name,
  coverUrl,
  onCoverChange,
  height = 160,
  rounded = 12,
  className
}: Props) {
  const [img, setImg] = useState<string | null>(typeof coverUrl === 'string' ? coverUrl : null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Preview khi chọn file mới
  useEffect(() => {
    if (!coverUrl || typeof coverUrl === 'string') return
    const file = coverUrl as File
    const url = URL.createObjectURL(file)
    setImg(url)
    return () => URL.revokeObjectURL(url)
  }, [coverUrl])

  const bg = getBgColor(name)
  const initial = getInitial(name)

  const handleBtnClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Định dạng ảnh không được chấp nhận!')
      setLoading(false)
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error('Ảnh không được quá 10MB')
      setLoading(false)
      return
    }
    // Hiển thị preview trước
    const localUrl = URL.createObjectURL(file)
    setImg(localUrl)
    // Callback ra ngoài
    onCoverChange?.(file)
    setTimeout(() => setLoading(false), 600)
  }

  return (
    <Wrapper h={height} r={rounded} className={className}>
      {img ? (
        <Img src={img} alt={name} />
      ) : (
        <Fallback bg={bg}>
          <Initial>{initial}</Initial>
        </Fallback>
      )}
      <UploadBtn type='button' onClick={handleBtnClick} aria-label='Thay đổi cover'>
        <Camera size={22} className='text-gray-700' />
      </UploadBtn>
      <input ref={fileInputRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={handleFileChange} />
      {loading && (
        <LoadingWrap>
          <div className='animate-spin rounded-full border-t-2 border-b-2 border-blue-500 w-8 h-8' />
        </LoadingWrap>
      )}
    </Wrapper>
  )
}
