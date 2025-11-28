import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDeleting = false
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className='fixed inset-0 z-[1001]' onClick={onCancel} style={{ background: 'rgba(0, 0, 0, 0.4)' }} />

      {/* Modal */}
      <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1002] w-[480px] max-w-[95%]'>
        <div className='bg-white rounded-xl shadow-2xl'>
          {/* Header */}
          <div className='flex items-center gap-3 px-6 py-4 border-b border-gray-200'>
            <AlertTriangle size={24} className='text-red-600' />
            <h2 className='text-xl font-bold text-gray-900'>{title}</h2>
          </div>

          {/* Content */}
          <div className='p-6'>
            <p className='text-gray-700'>{message}</p>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50'
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className='px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
