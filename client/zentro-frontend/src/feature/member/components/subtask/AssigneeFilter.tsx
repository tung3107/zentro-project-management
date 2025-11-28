import { Filter, X } from 'lucide-react'
import type { Member } from './types'

interface AssigneeFilterProps {
  members: Member[]
  selectedAssignee: string | null
  onSelect: (assigneeId: string | null) => void
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

export default function AssigneeFilter({
  members,
  selectedAssignee,
  onSelect,
  isOpen,
  onToggle,
  onClose
}: AssigneeFilterProps) {
  return (
    <div className='relative'>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
          selectedAssignee
            ? 'bg-blue-50 border-blue-400 text-blue-700'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        <Filter size={16} />
        Người phụ trách
        {selectedAssignee && <span className='px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full'>1</span>}
      </button>

      {isOpen && (
        <div
          className='absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50'
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <div className='p-3 border-b border-gray-200 flex items-center justify-between'>
            <span className='text-sm font-semibold text-gray-900'>Người phụ trách</span>
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
                !selectedAssignee ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Tất cả
            </button>
            {members.map((member) => {
              const isSelected = selectedAssignee === member.id
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    onSelect(member.id)
                    onClose()
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {member.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
