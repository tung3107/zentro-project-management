import { X } from 'lucide-react'
import type { Status } from './types'

interface BulkStatusModalProps {
  isOpen: boolean
  onClose: () => void
  statuses: Status[]
  selectedCount: number
  onSelectStatus: (statusId: number) => void
}

export default function BulkStatusModal({
  isOpen,
  onClose,
  statuses,
  selectedCount,
  onSelectStatus
}: BulkStatusModalProps) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-md'>
        <div className='flex items-center justify-between p-5 border-b border-gray-200'>
          <h2 className='text-lg font-bold text-gray-900'>Cập nhật trạng thái hàng loạt</h2>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <X size={20} className='text-gray-600' />
          </button>
        </div>
        <div className='p-5'>
          <p className='text-sm text-gray-600 mb-4'>Chọn trạng thái mới cho {selectedCount} công việc đã chọn:</p>
          <div className='space-y-2'>
            {statuses.map((status) => (
              <button
                key={status.id}
                onClick={() => onSelectStatus(status.id)}
                className='w-full text-left px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-3'
              >
                <div className='w-4 h-4 rounded border border-gray-300' style={{ backgroundColor: status.color }} />
                <span className='text-base font-medium text-gray-900'>{status.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
