import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonColor?: string
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message,
  confirmText = 'Xóa',
  cancelText = 'Hủy',
  confirmButtonColor = 'bg-red-600 hover:bg-red-700'
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div 
        className='absolute inset-0 bg-black/50 transition-opacity' 
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
          <button 
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500 transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='p-6'>
          <p className='text-gray-600'>{message}</p>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors'
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${confirmButtonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
