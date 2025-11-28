import { useState, useEffect } from 'react'
import { X, FolderOpen } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { createTestSuiteAPI, updateTestSuiteAPI } from '../../service/testcase.service'
import type { TestSuite } from '../../../../types/testcase'

interface TestSuiteModalProps {
  isOpen: boolean
  suite?: TestSuite | null
  parentSuiteId?: number
  testSuites: TestSuite[]
  onClose: () => void
  onUpdate: () => void
}

export default function TestSuiteModal({
  isOpen,
  suite,
  parentSuiteId,
  testSuites,
  onClose,
  onUpdate
}: TestSuiteModalProps) {
  const { projectId } = useParams<{ projectId: string }>()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: suite?.name || '',
    description: suite?.description || '',
    parent_suite_id: parentSuiteId
  })

  useEffect(() => {
    if (suite) {
      setFormData({
        name: suite.name,
        description: suite.description || '',
        parent_suite_id: suite.parent_suite_id || undefined
      })
    } else {
      setFormData({
        name: '',
        description: '',
        parent_suite_id: parentSuiteId
      })
    }
  }, [suite, parentSuiteId])

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
        // Don't allow setting self as parent when editing
        if (!suite || child.suite_id !== suite.suite_id) {
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

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên bộ testcase')
      return
    }

    setIsSaving(true)
    try {
      if (suite) {
        // Update existing suite
        await updateTestSuiteAPI(suite.suite_id, formData)
      } else {
        // Create new suite
        await createTestSuiteAPI(projectId!, formData)
      }
      onUpdate()
      onClose()
    } catch (err) {
      console.error('Failed to save test suite:', err)
      alert(suite ? 'Cập nhật bộ testcase thất bại' : 'Tạo bộ testcase thất bại')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className='fixed inset-0 z-[999]' onClick={onClose} style={{ background: 'rgba(0, 0, 0, 0.4)' }}/>

      {/* Modal */}
      <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] w-[600px] max-w-[95%]'>
        <div className='bg-white rounded-xl shadow-2xl'>
          {/* Header */}
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-3'>
              <FolderOpen size={24} className='text-blue-600' />
              <h2 className='text-xl font-bold text-gray-900'>
                {suite ? 'Cập nhật bộ testcase' : 'Tạo bộ testcase mới'}
              </h2>
            </div>
            <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <X size={20} className='text-gray-600' />
            </button>
          </div>

          {/* Content */}
          <div className='p-6 space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Tên bộ testcase <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='Nhập tên bộ testcase...'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                autoFocus
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Bộ testcase cha</label>
              <select
                value={formData.parent_suite_id ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, parent_suite_id: e.target.value ? Number(e.target.value) : undefined })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                {suiteOptions.map((option) => (
                  <option key={option.value ?? 'root'} value={option.value ?? ''}>
                    {'└─'.repeat(option.depth)} {option.label}
                  </option>
                ))}
              </select>
              <p className='text-xs text-gray-500 mt-1'>Chọn một bộ testcase cha hoặc để ở mức gốc</p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder='Mô tả về bộ testcase...'
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
              />
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors'
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSaving ? 'Đang lưu...' : suite ? 'Cập nhật' : 'Tạo bộ testcase'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
