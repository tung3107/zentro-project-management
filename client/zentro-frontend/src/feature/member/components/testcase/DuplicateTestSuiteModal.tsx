import { useState, useEffect } from 'react'
import { X, Copy, FolderOpen, ChevronRight } from 'lucide-react'
import type { TestSuite } from '../../../../types/testcase'
import { duplicateTestSuiteAPI } from '../../service/testcase.service'

interface DuplicateTestSuiteModalProps {
  isOpen: boolean
  suite: TestSuite
  testSuites: TestSuite[]
  onClose: () => void
  onSuccess: () => void
}

export default function DuplicateTestSuiteModal({
  isOpen,
  suite,
  testSuites,
  onClose,
  onSuccess
}: DuplicateTestSuiteModalProps) {
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>(undefined)
  const [isDuplicating, setIsDuplicating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSelectedParentId(undefined)
    }
  }, [isOpen])

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      await duplicateTestSuiteAPI(suite.suite_id, selectedParentId)
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to duplicate test suite:', err)
      alert('Duplicate test suite thất bại')
    } finally {
      setIsDuplicating(false)
    }
  }

  const buildSuiteOptions = () => {
    const options: { value: number | undefined; label: string; depth: number }[] = [
      { value: undefined, label: 'Mức gốc (không có cha)', depth: 0 }
    ]

    const buildRecursive = (parentId: number | null | undefined, depth: number = 0) => {
      const children = testSuites.filter((s) => {
        if (parentId === null || parentId === undefined) {
          return s.parent_suite_id === null || s.parent_suite_id === undefined
        }
        return s.parent_suite_id === parentId
      })

      children.forEach((child) => {
        // Don't allow duplicating into itself or its children
        if (child.suite_id !== suite.suite_id) {
          options.push({
            value: child.suite_id,
            label: child.name,
            depth
          })
          buildRecursive(child.suite_id, depth + 1)
        }
      })
    }

    buildRecursive(null)
    return options
  }

  const suiteOptions = buildSuiteOptions()

  if (!isOpen) return null

  return (
    <>
      <div className='fixed inset-0 z-[999]' onClick={onClose} style={{ background: 'rgba(0, 0, 0, 0.4)' }} />

      <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] w-[500px] max-w-[95%]'>
        <div className='bg-white rounded-xl shadow-2xl'>
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-3'>
              <Copy size={24} className='text-blue-600' />
              <h2 className='text-xl font-bold text-gray-900'>Sao chép bộ testcase</h2>
            </div>
            <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <X size={20} className='text-gray-600' />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-sm text-gray-700'>
                <span className='font-semibold'>Đang sao chép:</span> {suite.name}
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Chọn bộ testcase cha <span className='text-gray-500'>(Nơi đặt bản sao)</span>
              </label>
              <select
                value={selectedParentId ?? ''}
                onChange={(e) => setSelectedParentId(e.target.value ? Number(e.target.value) : undefined)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                {suiteOptions.map((option) => (
                  <option key={option.value ?? 'root'} value={option.value ?? ''}>
                    {'└─'.repeat(option.depth)} {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className='bg-gray-50 rounded-lg p-3 text-xs text-gray-600'>
              <p className='font-medium mb-1'>Lưu ý:</p>
              <ul className='list-disc list-inside space-y-1'>
                <li>Tất cả các testcase sẽ được sao chép</li>
                <li>Tất cả các bộ testcase con sẽ được sao chép đệ quy</li>
                <li>Mã testcase mới sẽ được tạo</li>
              </ul>
            </div>
          </div>

          <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={onClose}
              disabled={isDuplicating}
              className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              {isDuplicating ? 'Đang sao chép...' : 'Sao chép'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
