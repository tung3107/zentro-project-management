import { useState, useEffect, useRef } from 'react'
import { X, Save, Trash2, Upload, History, Download, FileText } from 'lucide-react'
import { useParams, useSearchParams } from 'react-router-dom'
import StepsEditor from './StepsEditor'
import DeleteConfirmModal from './DeleteConfirmModal'
import type { TestCase, TestSuite, TestCaseStep } from '../../../../types/testcase'
import {
  getTestCaseByIdAPI,
  createTestCaseAPI,
  updateTestCaseAPI,
  deleteTestCaseAPI,
  uploadAttachmentAPI,
  deleteAttachmentAPI
} from '../../service/testcase.service'
import Avatar from '../../../../components/Avatar'
import VersionHistory from './VersionHistory'

interface TestCaseDetailModalProps {
  isOpen: boolean
  testCase?: TestCase | null
  testSuites: TestSuite[]
  selectedSuiteId?: number
  onClose: () => void
  onUpdate: () => void
}

export default function TestCaseDetailModal({
  isOpen,
  testCase: initialTestCase,
  testSuites,
  selectedSuiteId,
  onClose,
  onUpdate
}: TestCaseDetailModalProps) {
  const { projectId } = useParams<{ projectId: string }>()
  const [searchParams] = useSearchParams()
  const testcaseIdFromQuery = searchParams.get('testcase')

  const [testCase, setTestCase] = useState<TestCase | null>(initialTestCase || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [modalWidth, setModalWidth] = useState(900)
  const [isResizing, setIsResizing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const resizeStartX = useRef(0)
  const resizeStartWidth = useRef(0)

  // Form state
  const [formData, setFormData] = useState({
    suite_id: testCase?.suite_id || selectedSuiteId || undefined,
    name: testCase?.name || '',
    description: testCase?.description || '',
    priority: testCase?.priority || ('medium' as 'low' | 'medium' | 'high' | 'critical'),
    pre_condition: testCase?.pre_condition || '',
    steps: testCase?.steps || ([] as TestCaseStep[]),
    expected_result: testCase?.expected_result || '',
    status: testCase?.status || ('draft' as 'draft' | 'approved' | 'deprecated' | 'active'),
    related_tasks: [] as number[]
  })

  useEffect(() => {
    if (testcaseIdFromQuery && !initialTestCase) {
      loadTestCase(Number(testcaseIdFromQuery))
    } else if (initialTestCase) {
      setTestCase(initialTestCase)
      setFormData({
        suite_id: initialTestCase.suite_id,
        name: initialTestCase.name,
        description: initialTestCase.description || '',
        priority: initialTestCase.priority,
        pre_condition: initialTestCase.pre_condition || '',
        steps: initialTestCase.steps || [],
        expected_result: initialTestCase.expected_result || '',
        status: initialTestCase.status,
        related_tasks: initialTestCase.taskRelations?.map((r) => r.task_id!).filter((id) => id !== undefined) || []
      })
    } else if (selectedSuiteId) {
      // Pre-fill suite_id when creating new test case from suite
      setFormData((prev) => ({ ...prev, suite_id: selectedSuiteId }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testcaseIdFromQuery, initialTestCase, selectedSuiteId])

  const loadTestCase = async (id: number) => {
    setIsLoading(true)
    try {
      const res = await getTestCaseByIdAPI(id)
      const tc = res.data.data
      setTestCase(tc)
      setFormData({
        suite_id: tc.suite_id,
        name: tc.name,
        description: tc.description || '',
        priority: tc.priority,
        pre_condition: tc.pre_condition || '',
        steps: tc.steps || [],
        expected_result: tc.expected_result || '',
        status: tc.status,
        related_tasks: tc.taskRelations?.map((r: any) => r.task_id).filter((id: any) => id !== undefined) || []
      })
    } catch (err) {
      console.error('Failed to load test case:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên testcase')
      return
    }

    if (formData.steps.length === 0) {
      alert('Vui lòng thêm ít nhất một bước')
      return
    }

    setIsSaving(true)
    try {
      if (testCase) {
        await updateTestCaseAPI(testCase.testcase_id, formData)
      } else {
        await createTestCaseAPI(projectId!, formData)
      }
      onUpdate()
      onClose()
    } catch (err) {
      console.error('Failed to save test case:', err)
      alert('Lưu testcase thất bại')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!testCase) return

    setIsDeleting(true)
    try {
      await deleteTestCaseAPI(testCase.testcase_id)
      onUpdate()
      onClose()
    } catch (err) {
      console.error('Failed to delete test case:', err)
      alert('Xóa testcase thất bại')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!testCase) return

    const file = event.target.files?.[0]
    if (!file) return

    try {
      await uploadAttachmentAPI(testCase.testcase_id, file)
      loadTestCase(testCase.testcase_id)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Failed to upload file:', err)
      alert('Upload file thất bại')
    }
  }

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa file đính kèm này?')) {
      return
    }

    try {
      await deleteAttachmentAPI(attachmentId)
      if (testCase) {
        loadTestCase(testCase.testcase_id)
      }
    } catch (err) {
      console.error('Failed to delete attachment:', err)
      alert('Xóa file đính kèm thất bại')
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    resizeStartX.current = e.clientX
    resizeStartWidth.current = modalWidth
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const diff = resizeStartX.current - e.clientX
      const newWidth = Math.min(Math.max(600, resizeStartWidth.current + diff), window.innerWidth - 100)
      setModalWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className='fixed inset-0 z-[999]' onClick={onClose} style={{ background: 'rgba(0, 0, 0, 0.4)' }} />

      {/* Modal with Resize Handle */}
      <div
        className='fixed top-0 right-0 h-full bg-white shadow-2xl z-[1000] flex'
        style={{ width: `${modalWidth}px` }}
      >
        {/* Resize Handle */}
        <div
          className='w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0'
          onMouseDown={handleMouseDown}
        />

        {/* Modal Content */}
        <div className='flex flex-col flex-1 h-full'>
          {/* Header */}
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0'>
            <div className='flex items-center gap-3 flex-1 min-w-0'>
              <FileText size={24} className='text-blue-600 flex-shrink-0' />
              <div className='min-w-0'>
                <h2 className='text-xl font-bold text-gray-900 truncate'>
                  {testCase ? `${testCase.testcase_code} - ${testCase.name}` : 'Tạo testcase mới'}
                </h2>
                {testCase && (
                  <p className='text-sm text-gray-600'>
                    Phiên bản {testCase.version} • Cập nhật {new Date(testCase.updated_at).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2 flex-shrink-0'>
              {testCase && (
                <>
                  <button
                    onClick={() => setShowVersionHistory(true)}
                    className='flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors'
                  >
                    <History size={18} />
                    Lịch sử
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className='flex items-center gap-2 px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors'
                  >
                    <Trash2 size={18} />
                    Xóa
                  </button>
                </>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <Save size={18} />
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                <X size={20} className='text-gray-600' />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-auto p-6 bg-gray-50'>
            {isLoading ? (
              <div className='flex items-center justify-center h-full'>
                <div className='text-gray-500'>Đang tải...</div>
              </div>
            ) : (
              <div className='max-w-[1600px] mx-auto'>
                {/* Name Input - Full Width */}
                <div className='mb-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
                  <label className='block text-sm font-bold text-gray-700 mb-2'>
                    Tên testcase <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='Nhập tên testcase...'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                  {/* Left Column - Main Content (Span 2) */}
                  <div className='lg:col-span-2 space-y-6'>
                    {/* Description & Pre-condition */}
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6'>
                      <div>
                        <label className='block text-sm font-bold text-gray-700 mb-2'>Mô tả</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder='Mô tả chi tiết về testcase...'
                          rows={3}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-bold text-gray-700 mb-2'>
                          Điều kiện tiên quyết
                        </label>
                        <textarea
                          value={formData.pre_condition}
                          onChange={(e) => setFormData({ ...formData, pre_condition: e.target.value })}
                          placeholder='Các điều kiện cần có trước khi thực hiện test...'
                          rows={2}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                        />
                      </div>
                    </div>

                    {/* Steps Section */}
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
                      <h3 className='text-lg font-bold text-gray-900 mb-4'>
                        Các bước thực hiện <span className='text-red-500'>*</span>
                      </h3>
                      <StepsEditor steps={formData.steps} onChange={(steps) => setFormData({ ...formData, steps })} />
                    </div>

                    {/* Expected Result */}
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
                      <h3 className='text-lg font-bold text-gray-900 mb-4'>Kết quả mong đợi (Chung)</h3>
                      <textarea
                        value={formData.expected_result}
                        onChange={(e) => setFormData({ ...formData, expected_result: e.target.value })}
                        placeholder='Mô tả kết quả mong đợi sau khi thực hiện test...'
                        rows={4}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                      />
                    </div>
                  </div>

                  {/* Right Column - Options & Meta (Span 1) */}
                  <div className='space-y-6'>
                    {/* Settings Panel */}
                    <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5'>
                      <h3 className='text-lg font-bold text-gray-900 border-b border-gray-100 pb-3'>Cài đặt</h3>
                      
                      {/* Test Suite */}
                      <div>
                        <label className='block text-sm font-bold text-gray-700 mb-2'>Bộ testcase</label>
                        <select
                          value={formData.suite_id || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, suite_id: e.target.value ? Number(e.target.value) : undefined })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                          <option value=''>Không thuộc bộ testcase nào</option>
                          {testSuites.map((suite) => (
                            <option key={suite.suite_id} value={suite.suite_id}>
                              {suite.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className='block text-sm font-bold text-gray-700 mb-2'>Độ ưu tiên</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                          <option value='low'>Thấp</option>
                          <option value='medium'>Trung bình</option>
                          <option value='high'>Cao</option>
                          <option value='critical'>Nghiêm trọng</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className='block text-sm font-bold text-gray-700 mb-2'>Trạng thái</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                          <option value='draft'>Nháp</option>
                          <option value='active'>Đang hoạt động</option>
                          <option value='approved'>Đã duyệt</option>
                          <option value='deprecated'>Ngưng sử dụng</option>
                        </select>
                      </div>
                    </div>

                    {/* Attachments Section */}
                    {testCase && (
                      <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
                        <div className='flex items-center justify-between mb-4 border-b border-gray-100 pb-3'>
                          <h3 className='text-lg font-bold text-gray-900'>File đính kèm</h3>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className='p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors'
                            title="Tải lên"
                          >
                            <Upload size={18} />
                          </button>
                          <input ref={fileInputRef} type='file' onChange={handleFileUpload} className='hidden' />
                        </div>

                        {testCase.attachments && testCase.attachments.length > 0 ? (
                          <div className='space-y-3'>
                            {testCase.attachments.map((att) => (
                              <div
                                key={att.attachment_id}
                                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 group'
                              >
                                <div className='flex items-center gap-3 min-w-0'>
                                  <FileText size={20} className='text-blue-600 flex-shrink-0' />
                                  <div className='min-w-0'>
                                    <p className='text-sm font-medium text-gray-900 truncate'>{att.file_name}</p>
                                    <p className='text-xs text-gray-500'>
                                      {att.file_size ? `${(att.file_size / 1024).toFixed(2)} KB` : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                  <button className='p-1.5 hover:bg-gray-200 rounded text-gray-600'>
                                    <Download size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAttachment(att.attachment_id)}
                                    className='p-1.5 hover:bg-red-100 rounded text-red-600'
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className='text-sm text-gray-500 text-center py-4 italic'>Chưa có file đính kèm</p>
                        )}
                      </div>
                    )}

                    {/* Creator/Updater Info */}
                    {testCase && (
                      <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4'>
                        <h3 className='text-lg font-bold text-gray-900 border-b border-gray-100 pb-3'>Thông tin</h3>
                        
                        {/* Creator */}
                        {testCase.creator && (
                          <div>
                            <p className='text-xs font-semibold text-gray-500 uppercase mb-2'>Người tạo</p>
                            <div className='flex items-center gap-3'>
                              <Avatar
                                avatarUrl={testCase.creator.avatar}
                                name={`${testCase.creator.first_name || ''} ${testCase.creator.last_name || ''}`.trim()}
                                size={32}
                              />
                              <div>
                                <p className='text-sm font-medium text-gray-900'>
                                  {`${testCase.creator.first_name || ''} ${testCase.creator.last_name || ''}`.trim()}
                                </p>
                                <p className='text-xs text-gray-500'>
                                  {new Date(testCase.created_at).toLocaleString('vi-VN')}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Updater */}
                        {testCase.updater && (
                          <div>
                            <p className='text-xs font-semibold text-gray-500 uppercase mb-2 mt-4'>Cập nhật lần cuối</p>
                            <div className='flex items-center gap-3'>
                              <Avatar
                                avatarUrl={testCase.updater.avatar}
                                name={`${testCase.updater.first_name || ''} ${testCase.updater.last_name || ''}`.trim()}
                                size={32}
                              />
                              <div>
                                <p className='text-sm font-medium text-gray-900'>
                                  {`${testCase.updater.first_name || ''} ${testCase.updater.last_name || ''}`.trim()}
                                </p>
                                <p className='text-xs text-gray-500'>
                                  {new Date(testCase.updated_at).toLocaleString('vi-VN')}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {testCase && showVersionHistory && (
        <VersionHistory
          testcaseId={testCase.testcase_id}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title='Xóa testcase'
        message={`Bạn có chắc chắn muốn xóa testcase "${testCase?.name}" không? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDeleting={isDeleting}
      />
    </>
  )
}
