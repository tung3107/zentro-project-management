import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  BarChart2,
  MoreVertical,
  Search,
  Filter,
  Copy,
  Edit2,
  Trash2
} from 'lucide-react'
import { getTestRunsAPI, duplicateTestRunAPI, deleteTestRunAPI, type TestRun } from '../../service/testrun.service'
import Avatar from '../../../../components/Avatar'
import CreateTestRunModal from './CreateTestRunModal'
import EditTestRunModal from './EditTestRunModal'
import TestRunDetail from './TestRunDetail'
import { Skeleton } from 'primereact/skeleton'
import ConfirmModal from '../../../../components/ConfirmModal'

export default function TestRunTab() {
  const { projectId } = useParams<{ projectId: string }>()
  const [testRuns, setTestRuns] = useState<TestRun[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [editingRun, setEditingRun] = useState<TestRun | null>(null)
  const [runToDelete, setRunToDelete] = useState<TestRun | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchTestRuns = async () => {
    if (!projectId) return
    setIsLoading(true)
    try {
      const res = await getTestRunsAPI(projectId)
      if (res.success) {
        setTestRuns(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch test runs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicate = async (run: TestRun) => {
    try {
      const res = await duplicateTestRunAPI(run.test_run_id)
      if (res.success) {
        await fetchTestRuns()
        alert(`Đã nhân bản "${run.name}" thành công!`)
      }
    } catch (error) {
      console.error('Failed to duplicate test run:', error)
      alert('Có lỗi xảy ra khi nhân bản đợt kiểm thử')
    }
  }

  const handleDeleteClick = (run: TestRun) => {
    setRunToDelete(run)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!runToDelete) return

    try {
      const res = await deleteTestRunAPI(runToDelete.test_run_id)
      if (res.success) {
        await fetchTestRuns()
        alert('Đã xóa đợt kiểm thử thành công!')
        setRunToDelete(null)
      }
    } catch (error) {
      console.error('Failed to delete test run:', error)
      alert('Có lỗi xảy ra khi xóa đợt kiểm thử')
    }
  }

  useEffect(() => {
    fetchTestRuns()
  }, [projectId])

  if (selectedRunId) {
    return (
      <TestRunDetail
        runId={selectedRunId}
        onBack={() => {
          setSelectedRunId(null)
          fetchTestRuns() // Refresh the list when going back
        }}
        projectId={projectId}
      />
    )
  }

  return (
    <div className='h-full flex flex-col' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <h2 className='text-xl font-bold text-gray-900'>Danh sách đợt kiểm thử</h2>
        </div>

        <div className='flex items-center gap-3'>
          {/* Search */}
          <div className='relative'>
            <Search size={16} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Tìm kiếm đợt kiểm thử...'
              className='pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
            />
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm'
          >
            <Plus size={18} />
            Tạo đợt kiểm thử
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 p-6 overflow-auto bg-gray-50'>
        {isLoading ? (
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <div className='grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200'>
              <div className='col-span-4 text-xs font-semibold text-gray-700'>Tiêu đề</div>
              <div className='col-span-1 text-xs font-semibold text-gray-700'>Trạng thái</div>
              <div className='col-span-2 text-xs font-semibold text-gray-700'>Người tạo</div>
              <div className='col-span-1 text-xs font-semibold text-gray-700'>Môi trường</div>
              <div className='col-span-1 text-xs font-semibold text-gray-700'>Tổng TG</div>
              <div className='col-span-1 text-xs font-semibold text-gray-700'>Đã chạy</div>
              <div className='col-span-2 text-xs font-semibold text-gray-700'>Thống kê</div>
            </div>
            <div className='divide-y divide-gray-200'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='grid grid-cols-12 gap-4 px-6 py-4 items-center'>
                  <div className='col-span-4'>
                    <Skeleton width='80%' height='1.25rem' className='mb-2' />
                    <Skeleton width='50%' height='0.875rem' />
                  </div>
                  <div className='col-span-1'>
                    <Skeleton width='70px' height='1.5rem' />
                  </div>
                  <div className='col-span-2'>
                    <Skeleton width='100px' height='1.5rem' />
                  </div>
                  <div className='col-span-1'>
                    <Skeleton width='30px' height='1rem' />
                  </div>
                  <div className='col-span-1'>
                    <Skeleton width='30px' height='1rem' />
                  </div>
                  <div className='col-span-1'>
                    <Skeleton width='30px' height='1rem' />
                  </div>
                  <div className='col-span-2'>
                    <Skeleton width='100%' height='0.5rem' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : testRuns.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-64'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
              <Play size={32} className='text-gray-300' />
            </div>
            <p className='text-lg font-semibold text-gray-600'>Không tìm thấy đợt kiểm thử nào</p>
            <p className='text-sm mt-1 text-gray-500'>Tạo đợt kiểm thử mới để bắt đầu</p>
          </div>
        ) : (
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            {/* Table Header */}
            <div className='grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200'>
              <div className='col-span-4 text-xs font-semibold text-gray-700'>Tiêu đề</div>
              <div className='col-span-1 text-xs font-semibold text-gray-700'>Trạng thái</div>
              <div className='col-span-2 text-xs font-semibold text-gray-700'>Người tạo</div>
              <div className='col-span-1 text-xs font-semibold text-gray-700'>Môi trường</div>
              <div className='col-span-1 text-xs font-semibold text-gray-700'>Tổng TG</div>
              <div className='col-span-1 text-xs font-semibold text-gray-700'>Đã chạy</div>
              <div className='col-span-2 text-xs font-semibold text-gray-700'>Thống kê</div>
            </div>

            {/* Table Body */}
            <div className='divide-y divide-gray-200' style={{ height: '100vh' }}>
              {testRuns.map((run) => {
                const passed = run.stats?.passed || 0
                const failed = run.stats?.failed || 0
                const total = run.stats?.total || 0
                const passedPercent = total > 0 ? (passed / total) * 100 : 0
                const failedPercent = total > 0 ? (failed / total) * 100 : 0
                const otherPercent = 100 - passedPercent - failedPercent

                return (
                  <div
                    key={run.test_run_id}
                    className='grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer group'
                    onClick={() => setSelectedRunId(run.test_run_id)}
                  >
                    {/* Title */}
                    <div className='col-span-4 flex items-start gap-3'>
                      <div>
                        <h3 className='text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors'>
                          {run.name}
                        </h3>
                        <p className='text-xs text-gray-500 mt-1'>
                          Bắt đầu {new Date(run.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className='col-span-1'>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                          run.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {run.status === 'completed' ? 'Hoàn thành' : 'Đang chạy'}
                      </span>
                    </div>

                    {/* Author */}
                    <div className='col-span-2 flex items-center gap-2'>
                      <Avatar
                        avatarUrl={run.creator?.avatar}
                        name={`${run.creator?.first_name} ${run.creator?.last_name}`}
                        size={24}
                      />
                      <span className='text-sm text-gray-700 truncate'>{run.creator?.last_name || 'Unknown'}</span>
                    </div>

                    {/* Environment (Mock) */}
                    <div className='col-span-1 text-sm text-gray-500'>-</div>

                    {/* Total Time (Mock) */}
                    <div className='col-span-1 text-sm text-gray-500'>-</div>

                    {/* Elapsed Time (Mock) */}
                    <div className='col-span-1 text-sm text-gray-500'>-</div>

                    {/* Stats */}
                    <div className='col-span-2 flex items-center gap-3'>
                      <div className='flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex'>
                        {passed > 0 && <div className='bg-green-500' style={{ width: `${passedPercent}%` }} />}
                        {failed > 0 && <div className='bg-red-500' style={{ width: `${failedPercent}%` }} />}
                        {otherPercent > 0 && <div className='bg-gray-300' style={{ width: `${otherPercent}%` }} />}
                      </div>
                      <div className='text-xs font-medium text-gray-700 min-w-[35px] text-right'>
                        {Math.round(passedPercent)}%
                      </div>

                      {/* 3-dot menu */}
                      <div className='relative'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(openMenuId === run.test_run_id ? null : run.test_run_id)
                          }}
                          className='p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100'
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenuId === run.test_run_id && (
                          <>
                            <div className='absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-99'>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuId(null)
                                  handleDuplicate(run)
                                }}
                                className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer'
                              >
                                <Copy size={16} />
                                Nhân bản đợt kiểm thử
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuId(null)
                                  setEditingRun(run)
                                }}
                                className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer'
                              >
                                <Edit2 size={16} />
                                Sửa đợt kiểm thử
                              </button>
                              <div className='h-px bg-gray-200 my-1' />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuId(null)
                                  handleDeleteClick(run)
                                }}
                                className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer'
                              >
                                <Trash2 size={16} />
                                Xóa
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTestRunModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchTestRuns()
          }}
          projectId={projectId || ''}
        />
      )}

      {editingRun && (
        <EditTestRunModal
          isOpen={!!editingRun}
          onClose={() => setEditingRun(null)}
          onSuccess={() => {
            setEditingRun(null)
            fetchTestRuns()
          }}
          testRun={editingRun}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title='Xóa đợt kiểm thử'
        message={`Bạn có chắc chắn muốn xóa "${runToDelete?.name}"?`}
        confirmText='Xóa'
        confirmButtonColor='bg-red-600 hover:bg-red-700'
      />
    </div>
  )
}
