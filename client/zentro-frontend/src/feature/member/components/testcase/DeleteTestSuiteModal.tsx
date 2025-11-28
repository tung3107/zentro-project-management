import { useState, useEffect } from 'react'
import { X, AlertTriangle, MoveRight } from 'lucide-react'
import type { TestSuite } from '../../../../types/testcase'
import { deleteTestSuiteAPI, getSuiteChildrenAPI } from '../../service/testcase.service'

interface DeleteTestSuiteModalProps {
  isOpen: boolean
  suite: TestSuite
  testSuites: TestSuite[]
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteTestSuiteModal({
  isOpen,
  suite,
  testSuites,
  onClose,
  onSuccess
}: DeleteTestSuiteModalProps) {
  const [hasChildren, setHasChildren] = useState(false)
  const [childInfo, setChildInfo] = useState({ testCaseCount: 0, childSuiteCount: 0 })
  const [moveToSuiteId, setMoveToSuiteId] = useState<number | undefined>(undefined)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      checkChildren()
    }
  }, [isOpen, suite])

  const checkChildren = async () => {
    setIsLoading(true)
    try {
      const res = await getSuiteChildrenAPI(suite.suite_id)
      const { hasChildren: has, testCaseCount, childSuiteCount } = res.data.data
      setHasChildren(has)
      setChildInfo({ testCaseCount, childSuiteCount })
      setMoveToSuiteId(undefined)
    } catch (err) {
      console.error('Failed to check suite children:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (hasChildren && !moveToSuiteId) {
      alert('Vui lòng chọn một bộ testcase để di chuyển các mục con đến')
      return
    }

    setIsDeleting(true)
    try {
      await deleteTestSuiteAPI(suite.suite_id, moveToSuiteId)
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to delete test suite:', err)
      alert('Xóa bộ testcase thất bại')
    } finally {
      setIsDeleting(false)
    }
  }

  const buildSuiteOptions = () => {
    const options: { value: number; label: string; depth: number }[] = []

    const buildRecursive = (parentId: number | null | undefined, depth: number = 0) => {
      const children = testSuites.filter((s) => {
        if (parentId === null || parentId === undefined) {
          return s.parent_suite_id === null || s.parent_suite_id === undefined
        }
        return s.parent_suite_id === parentId
      })

      children.forEach((child) => {
        // Don't allow moving to itself
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

      <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] w-[550px] max-w-[95%]'>
        <div className='bg-white rounded-xl shadow-2xl'>
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-3'>
              <AlertTriangle size={24} className='text-red-600' />
              <h2 className='text-xl font-bold text-gray-900'>Xóa bộ testcase</h2>
            </div>
            <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <X size={20} className='text-gray-600' />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            {isLoading ? (
              <div className='text-center py-4 text-gray-500'>Đang kiểm tra nội dung bộ testcase...</div>
            ) : (
              <>
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <p className='text-sm font-semibold text-gray-900 mb-1'>
                    Bạn có chắc chắn muốn xóa bộ testcase này không?
                  </p>
                  <p className='text-sm text-gray-700'>
                    <span className='font-semibold'>Tên bộ testcase:</span> {suite.name}
                  </p>
                </div>

                {hasChildren && (
                  <>
                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                      <p className='text-sm font-semibold text-yellow-900 mb-2'>⚠️ Bộ testcase này chứa:</p>
                      <ul className='text-sm text-yellow-800 space-y-1'>
                        <li>• {childInfo.testCaseCount} testcase</li>
                        <li>• {childInfo.childSuiteCount} bộ testcase con</li>
                      </ul>
                      <p className='text-sm text-yellow-900 mt-3 font-medium'>
                        Vui lòng chọn một bộ testcase đích để di chuyển tất cả các mục con trước khi xóa.
                      </p>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Di chuyển các mục con đến <span className='text-red-500'>*</span>
                      </label>
                      <div className='flex items-center gap-2'>
                        <select
                          value={moveToSuiteId ?? ''}
                          onChange={(e) => setMoveToSuiteId(e.target.value ? Number(e.target.value) : undefined)}
                          className='flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                          <option value=''>-- Chọn một bộ testcase --</option>
                          {suiteOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {'└─'.repeat(option.depth)} {option.label}
                            </option>
                          ))}
                        </select>
                        <MoveRight size={20} className='text-gray-400' />
                      </div>
                    </div>
                  </>
                )}

                {!hasChildren && (
                  <div className='bg-gray-50 rounded-lg p-3 text-sm text-gray-600'>
                    Bộ testcase này trống và có thể xóa an toàn.
                  </div>
                )}
              </>
            )}
          </div>

          <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={onClose}
              disabled={isDeleting || isLoading}
              className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50'
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || isLoading || (hasChildren && !moveToSuiteId)}
              className='px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa bộ testcase'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
