import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { getTestCasesAPI, getTestSuitesAPI } from '../../service/testcase.service'
import { createTestRunAPI } from '../../service/testrun.service'
import TestRunSelectionTree from './TestRunSelectionTree'
import type { TestCase, TestSuite } from '../../../../types/testcase'

interface CreateTestRunModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectId: string
}

export default function CreateTestRunModal({ isOpen, onClose, onSuccess, projectId }: CreateTestRunModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && projectId) {
      fetchData()
    }
  }, [isOpen, projectId])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [casesRes, suitesRes] = await Promise.all([getTestCasesAPI(projectId), getTestSuitesAPI(projectId)])
      setTestCases(casesRes.data.data)
      setTestSuites(suitesRes.data.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất một test case')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createTestRunAPI(projectId, {
        name,
        description,
        testcaseIds: selectedIds
      })
      if (res.success) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to create test run:', error)
      alert('Có lỗi xảy ra khi tạo test run')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className='bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col'
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <h2 className='text-xl font-bold text-gray-900'>Tạo đợt kiểm thử mới</h2>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <X size={20} className='text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-hidden flex flex-col lg:flex-row'>
          {/* Form Side */}
          <div className='w-full lg:w-1/3 p-6 border-r border-gray-200 overflow-y-auto'>
            <form id='create-run-form' onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tên đợt kiểm thử <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Ví dụ: Regression Test Sprint 10'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Mô tả chi tiết về đợt test này...'
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none'
                />
              </div>

              <div className='pt-4 border-t border-gray-200'>
                <p className='text-sm font-medium text-gray-700 mb-2'>Tóm tắt lựa chọn</p>
                <div className='bg-blue-50 rounded-lg p-3 border border-blue-100'>
                  <p className='text-blue-800 text-sm'>
                    Đã chọn: <span className='font-bold'>{selectedIds.length}</span> test case
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Selection Side */}
          <div className='flex-1 flex flex-col h-full overflow-hidden bg-gray-50'>
            <div className='px-6 py-4 border-b border-gray-200 bg-white'>
              <h3 className='font-semibold text-gray-900'>Chọn Test Cases</h3>
              <p className='text-xs text-gray-500 mt-1'>Chọn các test case hoặc bộ test case để đưa vào run này</p>
            </div>
            <div className='flex-1 overflow-y-auto p-4'>
              {isLoading ? (
                <div className='flex justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                </div>
              ) : (
                <TestRunSelectionTree
                  testCases={testCases}
                  testSuites={testSuites}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors'
          >
            Hủy
          </button>
          <button
            type='submit'
            form='create-run-form'
            disabled={isSubmitting || selectedIds.length === 0}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          >
            {isSubmitting ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                <span>Đang tạo...</span>
              </>
            ) : (
              <span>Tạo đợt kiểm thử</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
