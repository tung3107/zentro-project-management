import { Filter, X } from 'lucide-react'
import type { Status } from './types'

interface StatusFilterProps {
  statuses: Status[]
  selectedStatus: number | null
  onSelect: (statusId: number | null) => void
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

export default function StatusFilter({
  statuses,
  selectedStatus,
  onSelect,
  isOpen,
  onToggle,
  onClose
}: StatusFilterProps) {
  return (
    <div className='relative'>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
          selectedStatus
            ? 'bg-blue-50 border-blue-400 text-blue-700'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        <Filter size={16} />
        Trạng thái
        {selectedStatus && <span className='px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full'>1</span>}
      </button>

      {isOpen && (
        <div
          className='absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50'
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <div className='p-3 border-b border-gray-200 flex items-center justify-between'>
            <span className='text-sm font-semibold text-gray-900'>Trạng thái</span>
            <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded'>
              <X size={16} className='text-gray-600' />
            </button>
          </div>
          <div className='p-2 max-h-64 overflow-y-auto'>
            <button
              onClick={() => {
                onSelect(null)
                onClose()
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                !selectedStatus ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Tất cả
            </button>
            {statuses.map((status) => {
              const isSelected = selectedStatus === status.id
              return (
                <button
                  key={status.id}
                  onClick={() => {
                    onSelect(status.id)
                    onClose()
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                    isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className='w-3 h-3 rounded border border-gray-300' style={{ backgroundColor: status.color }} />
                  {status.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
