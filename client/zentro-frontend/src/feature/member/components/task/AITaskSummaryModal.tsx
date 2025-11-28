import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import aiChatService from '../../service/aichat.service'
import type { TaskSummaryResponse } from '../../service/aichat.service'

interface AITaskSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  taskId: string
}

export default function AITaskSummaryModal({ isOpen, onClose, projectId, taskId }: AITaskSummaryModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [summaryData, setSummaryData] = useState<TaskSummaryResponse | null>(null)

  useEffect(() => {
    if (isOpen && taskId && projectId) {
      fetchSummary()
    }
  }, [isOpen, taskId, projectId])

  const fetchSummary = async () => {
    setIsLoading(true)
    try {
      const data = await aiChatService.generateTaskSummary(projectId, taskId)
      setSummaryData(data)
    } catch (error) {
      console.error('Failed to generate task summary:', error)
      toast.error('Không thể tạo tóm tắt. Vui lòng thử lại.')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />

      <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <Sparkles size={20} className='text-purple-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>AI Task Summary</h2>
              <p className='text-sm text-gray-600'>Tóm tắt thông minh về task</p>
            </div>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-white/50 rounded-lg transition-colors' title='Đóng'>
            <X size={20} className='text-gray-600' />
          </button>
        </div>

        {/* Content */}
        <div className='overflow-y-auto p-6' style={{ maxHeight: 'calc(80vh - 80px)' }}>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <svg className='w-12 h-12 animate-spin text-purple-600 mb-4' viewBox='0 0 24 24' fill='none'>
                <circle cx='12' cy='12' r='10' stroke='rgba(147,51,234,0.2)' strokeWidth='4'></circle>
                <path d='M4 12a8 8 0 018-8' stroke='rgb(147,51,234)' strokeWidth='4' strokeLinecap='round'></path>
              </svg>
              <p className='text-gray-600 font-medium'>AI đang phân tích task...</p>
              <p className='text-sm text-gray-500 mt-1'>Vui lòng chờ trong giây lát</p>
            </div>
          ) : summaryData ? (
            <div className='space-y-6'>
              {/* Task Info Cards */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200'>
                  <div className='text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1'>Trạng thái</div>
                  <div className='text-lg font-bold text-blue-900'>{summaryData.taskInfo.status}</div>
                </div>
                <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200'>
                  <div className='text-xs font-semibold text-green-700 uppercase tracking-wide mb-1'>Tiến độ</div>
                  <div className='text-lg font-bold text-green-900'>{summaryData.taskInfo.progress}</div>
                </div>
                <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200'>
                  <div className='text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1'>Ưu tiên</div>
                  <div className='text-lg font-bold text-purple-900'>{summaryData.taskInfo.priority}</div>
                </div>
                <div
                  className={`bg-gradient-to-br rounded-lg p-4 border ${
                    summaryData.taskInfo.isOverdue
                      ? 'from-red-50 to-red-100 border-red-200'
                      : 'from-gray-50 to-gray-100 border-gray-200'
                  }`}
                >
                  <div
                    className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                      summaryData.taskInfo.isOverdue ? 'text-red-700' : 'text-gray-700'
                    }`}
                  >
                    Deadline
                  </div>
                  <div
                    className={`text-lg font-bold ${summaryData.taskInfo.isOverdue ? 'text-red-900' : 'text-gray-900'}`}
                  >
                    {summaryData.taskInfo.deadline}
                    {summaryData.taskInfo.isOverdue && <span className='ml-2'>⚠️</span>}
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className='bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200'>
                <div className='flex items-center gap-2 mb-4'>
                  <Sparkles size={18} className='text-purple-600' />
                  <h3 className='text-sm font-bold text-purple-900 uppercase tracking-wide'>Tóm tắt AI</h3>
                </div>
                <div className='prose prose-sm max-w-none text-gray-800'>
                  <ReactMarkdown>{summaryData.summary}</ReactMarkdown>
                </div>
              </div>

              {/* Additional Info */}
              <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='font-semibold text-gray-700'>Task ID:</span>
                    <span className='ml-2 text-gray-900'>{summaryData.taskInfo.task_id}</span>
                  </div>
                  <div>
                    <span className='font-semibold text-gray-700'>Người thực hiện:</span>
                    <span className='ml-2 text-gray-900'>{summaryData.taskInfo.assignee}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className='border-t border-gray-200 p-4 bg-gray-50 flex justify-end'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
