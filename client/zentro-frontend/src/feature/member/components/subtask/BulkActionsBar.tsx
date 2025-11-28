import { Edit, Trash2 } from 'lucide-react'
import { useProjectRole } from '../../hooks/useProjectRole'

interface BulkActionsBarProps {
  selectedCount: number
  onBulkEdit: () => void
  onBulkDelete: () => void
}

export default function BulkActionsBar({ selectedCount, onBulkEdit, onBulkDelete }: BulkActionsBarProps) {
  const { permissions } = useProjectRole()

  if (selectedCount === 0) return null

  return (
    <div
      className='fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-xl px-4 py-2.5'
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <span className='text-sm font-semibold text-gray-900 mr-2'>{selectedCount} đã chọn</span>
      {permissions.canEdit && (
        <button
          onClick={onBulkEdit}
          className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
        >
          <Edit size={18} />
          Sửa trạng thái
        </button>
      )}
      {permissions.canDelete && (
        <button
          onClick={onBulkDelete}
          className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
        >
          <Trash2 size={18} />
          Xóa
        </button>
      )}
    </div>
  )
}
