import { useState, useEffect } from 'react'
import { X, Clock, User } from 'lucide-react'
import type { TestCaseVersion } from '../../../../types/testcase'
import { getVersionHistoryAPI } from '../../service/testcase.service'
import Avatar from '../../../../components/Avatar'

interface VersionHistoryProps {
  testcaseId: number
  isOpen: boolean
  onClose: () => void
}

export default function VersionHistory({ testcaseId, isOpen, onClose }: VersionHistoryProps) {
  const [versions, setVersions] = useState<TestCaseVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<TestCaseVersion | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadVersions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, testcaseId])

  const loadVersions = async () => {
    setIsLoading(true)
    try {
      const res = await getVersionHistoryAPI(testcaseId)
      setVersions(res.data.data || [])
    } catch (err) {
      console.error('Failed to load version history:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'Nghiêm trọng'
      case 'high':
        return 'Cao'
      case 'medium':
        return 'Trung bình'
      case 'low':
        return 'Thấp'
      default:
        return priority
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt'
      case 'active':
        return 'Đang hoạt động'
      case 'deprecated':
        return 'Ngưng sử dụng'
      case 'draft':
        return 'Nháp'
      default:
        return status
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className='fixed inset-0 z-[999]' onClick={onClose} style={{ background: 'rgba(0, 0, 0, 0.4)' }} />

      {/* Modal */}
      <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] w-[900px] max-w-[95%] max-h-[80vh]'>
        <div className='bg-white rounded-xl shadow-2xl flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-3'>
              <Clock size={24} className='text-blue-600' />
              <h2 className='text-xl font-bold text-gray-900'>Lịch sử phiên bản</h2>
            </div>
            <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <X size={20} className='text-gray-600' />
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-hidden'>
            {isLoading ? (
              <div className='flex items-center justify-center h-full'>
                <div className='text-gray-500'>Đang tải...</div>
              </div>
            ) : versions.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-gray-500'>
                <Clock size={48} className='mb-3 opacity-50' />
                <p>Chưa có lịch sử phiên bản</p>
              </div>
            ) : (
              <div className='flex h-full'>
                {/* Version list */}
                <div className='w-80 border-r border-gray-200 overflow-auto'>
                  <div className='p-4 space-y-2'>
                    {versions.map((version) => (
                      <button
                        key={version.version_id}
                        onClick={() => setSelectedVersion(version)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedVersion?.version_id === version.version_id
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-sm font-semibold text-gray-900'>
                            Phiên bản {version.version_number}
                          </span>
                          <span className='text-xs text-gray-500'>
                            {new Date(version.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {version.updater && (
                          <div className='flex items-center gap-2 mt-2'>
                            <Avatar
                              avatarUrl={version.updater.avatar}
                              name={`${version.updater.first_name || ''} ${version.updater.last_name || ''}`.trim()}
                              size={20}
                            />
                            <span className='text-xs text-gray-600'>
                              {`${version.updater.first_name || ''} ${version.updater.last_name || ''}`.trim()}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Version details */}
                <div className='flex-1 overflow-auto'>
                  {selectedVersion ? (
                    <div className='p-6 space-y-6'>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>{selectedVersion.name}</h3>
                        {selectedVersion.description && <p className='text-gray-600'>{selectedVersion.description}</p>}
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <p className='text-sm font-medium text-gray-700'>Độ ưu tiên</p>
                          <p className='text-gray-900'>{getPriorityLabel(selectedVersion.priority)}</p>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-700'>Trạng thái</p>
                          <p className='text-gray-900'>{getStatusLabel(selectedVersion.status)}</p>
                        </div>
                      </div>

                      {selectedVersion.pre_condition && (
                        <div>
                          <p className='text-sm font-medium text-gray-700 mb-1'>Điều kiện tiên quyết</p>
                          <p className='text-gray-900 bg-gray-50 p-3 rounded-lg'>{selectedVersion.pre_condition}</p>
                        </div>
                      )}

                      <div>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Các bước thực hiện</p>
                        <div className='space-y-3'>
                          {selectedVersion.steps.map((step, idx) => (
                            <div key={idx} className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                              <div className='flex items-center gap-2 mb-2'>
                                <span className='text-sm font-semibold text-gray-700 bg-blue-100 px-2 py-0.5 rounded'>
                                  {step.step_number}
                                </span>
                              </div>
                              <div className='space-y-2'>
                                <div>
                                  <p className='text-xs font-medium text-gray-600'>Hành động:</p>
                                  <div
                                    className='text-sm text-gray-900'
                                    dangerouslySetInnerHTML={{
                                      __html: step.description
                                        .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
                                        .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
                                        .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
                                    }}
                                  />
                                </div>
                                {step.data && (
                                  <div>
                                    <p className='text-xs font-medium text-gray-600'>Dữ liệu:</p>
                                    <div
                                      className='text-sm text-gray-900'
                                      dangerouslySetInnerHTML={{
                                        __html: step.data
                                          .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
                                          .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
                                          .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
                                      }}
                                    />
                                  </div>
                                )}
                                {step.expected_result && (
                                  <div>
                                    <p className='text-xs font-medium text-gray-600'>Kết quả mong đợi:</p>
                                    <div
                                      className='text-sm text-gray-900'
                                      dangerouslySetInnerHTML={{
                                        __html: step.expected_result
                                          .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
                                          .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
                                          .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedVersion.expected_result && (
                        <div>
                          <p className='text-sm font-medium text-gray-700 mb-1'>Kết quả mong đợi</p>
                          <p className='text-gray-900 bg-gray-50 p-3 rounded-lg'>{selectedVersion.expected_result}</p>
                        </div>
                      )}

                      {selectedVersion.actual_result && (
                        <div>
                          <p className='text-sm font-medium text-gray-700 mb-1'>Kết quả thực tế</p>
                          <p className='text-gray-900 bg-gray-50 p-3 rounded-lg'>{selectedVersion.actual_result}</p>
                        </div>
                      )}

                      <div className='pt-4 border-t border-gray-200'>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <User size={16} />
                          <span>
                            Cập nhật bởi{' '}
                            <span className='font-medium text-gray-900'>
                              {selectedVersion.updater
                                ? `${selectedVersion.updater.first_name || ''} ${selectedVersion.updater.last_name || ''}`.trim()
                                : 'Unknown'}
                            </span>
                          </span>
                          <span>•</span>
                          <span>{new Date(selectedVersion.created_at).toLocaleString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center justify-center h-full text-gray-500'>
                      <p>Chọn một phiên bản để xem chi tiết</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
