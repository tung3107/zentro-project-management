import React, { useEffect } from 'react'
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageViewerModal({
  imageUrl,
  onClose,
  onPrev,
  onNext,
  hasNext,
  hasPrev
}: {
  imageUrl: string
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  hasNext?: boolean
  hasPrev?: boolean
}) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // ESC to close, arrow keys for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        onPrev()
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onPrev, onNext, hasNext, hasPrev])

  return (
    <div
      onClick={handleBackdropClick}
      className='fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center p-4'
    >
      <button
        onClick={onClose}
        className='absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors'
      >
        <X size={24} className='text-white' />
      </button>

      <button
        onClick={handleDownload}
        className='absolute top-4 right-16 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors'
      >
        <Download size={24} className='text-white' />
      </button>

      {/* Previous Button */}
      {hasPrev && onPrev && (
        <button
          onClick={onPrev}
          className='absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors'
        >
          <ChevronLeft size={32} className='text-white' />
        </button>
      )}

      {/* Next Button */}
      {hasNext && onNext && (
        <button
          onClick={onNext}
          className='absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors'
        >
          <ChevronRight size={32} className='text-white' />
        </button>
      )}

      <img
        src={imageUrl}
        alt='Full size'
        className='max-w-full max-h-full object-contain cursor-pointer'
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
