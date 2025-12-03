// TaskListView.tsx - FIXED VERSION

import { useState, useEffect, useRef } from 'react'
import { Toast } from 'primereact/toast'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, List, LayoutGrid, Upload, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../../../../../util/axiosClient'
import type { Task } from '../../../../../types/task'
import { getTasksListAPI, updateTaskAPI, deleteTask } from '../../../service/task.service'
import AddTaskCom from '../../../components/task/AddTaskCom'
import TaskDetailModal from '../../../components/task/TaskDetailModal'
import ConfirmModal from '../../../../../components/ConfirmModal'

// Subtask components
import SearchBar from '../../../components/subtask/SearchBar'
import StatusFilter from '../../../components/subtask/StatusFilter'
import AssigneeFilter from '../../../components/subtask/AssigneeFilter'
import TypeFilter from '../../../components/subtask/TypeFilter'
import ExportMenu from '../../../components/subtask/ExportMenu'
import BulkActionsBar from '../../../components/subtask/BulkActionsBar'
import BulkStatusModal from '../../../components/subtask/BulkStatusModal'
import TaskTable from '../../../components/subtask/TaskTable'
import TaskCard from '../../../components/subtask/TaskCard'
import type { Status, Member, ViewMode } from '../../../components/subtask/types'
import { useProjectRole } from '../../../hooks/useProjectRole'

export default function TaskListView() {
  const { projectId } = useParams<{ projectId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toastRef = useRef<Toast>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | null>(null)
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<any>({})
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addModalContent, setAddModalContent] = useState<React.ReactNode | null>(null)
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [showAssigneeFilter, setShowAssigneeFilter] = useState(false)
  const [showTypeFilter, setShowTypeFilter] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([])

  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

  const { permissions } = useProjectRole()

  // Fetch statuses
  const { data: statusesData } = useQuery({
    queryKey: ['statuses', projectId],
    queryFn: async () => {
      const res = await api.get(`/status/${projectId}`)
      return res.data.data as Status[]
    },
    enabled: !!projectId
  })

  const statuses = statusesData || []

  // Fetch members
  const { data: membersData } = useQuery({
    queryKey: ['members', projectId],
    queryFn: async () => {
      const res = await api.get(`/members/dropdown/${projectId}`)
      return res.data.data as Member[]
    },
    enabled: !!projectId
  })

  const members = membersData || []

  // Fetch tasks
  const {
    data: tasksData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['tasks-list', projectId, searchQuery, statusFilter, assigneeFilter, typeFilter],
    queryFn: async () => {
      const res = await getTasksListAPI(projectId || '', searchQuery, {
        ...(statusFilter && { status_id: statusFilter }),
        ...(assigneeFilter && { assignee_id: assigneeFilter }),
        ...(typeFilter && { type: typeFilter })
      })
      return res.data as Task[]
    },
    enabled: !!projectId
  })

  const tasks = tasksData || []

  // Handle task from query params
  const taskIdFromQuery = searchParams.get('task')
  useEffect(() => {
    if (taskIdFromQuery && tasks.length > 0) {
      const task = tasks.find((t) => t.task_id?.toString() === taskIdFromQuery)
      if (task) {
        setSelectedTask(task)
        setIsTaskDetailOpen(true)
      }
    }
  }, [taskIdFromQuery, tasks])

  const handleSelectionChange = (selected: Task[]) => {
    setSelectedTasks(selected)
  }

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      return await updateTaskAPI(task)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-list'] })
      toast.success('Cập nhật thành công')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Cập nhật thất bại')
    }
  })

  // Bulk update status mutation
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ taskIds, statusId }: { taskIds: number[]; statusId: number }) => {
      const promises = taskIds.map((taskId) => {
        const task = tasks.find((t) => t.task_id === taskId)
        if (task) {
          return updateTaskAPI({ ...task, status_id: statusId } as Task)
        }
        return Promise.resolve()
      })
      await Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-list'] })
      setSelectedTasks([])
      setShowBulkStatusModal(false)
      toast.success('Cập nhật trạng thái thành công')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Cập nhật thất bại')
    }
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (taskIds: number[]) => {
      const promises = taskIds.map((taskId) => deleteTask(taskId))
      await Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-list'] })
      setSelectedTasks([])
      toast.success('Xóa thành công')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Xóa thất bại')
    }
  })

  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
    navigate(`?task=${task.task_id}`)
  }

  // Handle inline edit
  const handleInlineEdit = async (task: Task, field: keyof Task, value: any) => {
    const updated = { ...task, [field]: value }
    await updateTaskMutation.mutateAsync(updated)
  }

  // Handle create new task
  const handleCreateTask = () => {
    setIsAddModalOpen(true)
    setAddModalContent(
      <AddTaskCom
        setAddModalOpen={setIsAddModalOpen}
        setAddModalContent={setAddModalContent}
        onSuccess={() => {
          refetch()
          setIsAddModalOpen(false)
          setAddModalContent(null)
        }}
        projectId={projectId || ''}
      />
    )
  }

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedTasks.length === 0) return
    setShowBulkDeleteConfirm(true)
  }

  const handleConfirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedTasks.map((t) => t.task_id!))
    setShowBulkDeleteConfirm(false)
  }

  // Handle bulk status update
  const handleBulkStatusUpdate = (statusId: number) => {
    if (selectedTasks.length === 0) return
    bulkUpdateStatusMutation.mutate({ taskIds: selectedTasks.map((t) => t.task_id!), statusId })
  }

  // Import functions
  const handleImport = async (file: File) => {
    if (!file) return

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (fileExtension !== 'csv' && fileExtension !== 'xls' && fileExtension !== 'xlsx') {
      toast.error('Chỉ hỗ trợ file CSV hoặc Excel')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('project_id', projectId || '')

      toast.success('Đang xử lý file import...')
      // await api.post('/tasks/import', formData)
      refetch()
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Import thất bại')
    }
  }

  return (
    <div className='h-full flex flex-col' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm'>
        <div className='flex items-center gap-4 flex-1'>
          {/* Search */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* Filters */}
          <div className='flex items-center gap-2'>
            <StatusFilter
              statuses={statuses}
              selectedStatus={statusFilter}
              onSelect={setStatusFilter}
              isOpen={showStatusFilter}
              onToggle={() => {
                setShowStatusFilter(!showStatusFilter)
                setShowAssigneeFilter(false)
                setShowTypeFilter(false)
              }}
              onClose={() => setShowStatusFilter(false)}
            />

            <AssigneeFilter
              members={members}
              selectedAssignee={assigneeFilter}
              onSelect={setAssigneeFilter}
              isOpen={showAssigneeFilter}
              onToggle={() => {
                setShowAssigneeFilter(!showAssigneeFilter)
                setShowStatusFilter(false)
                setShowTypeFilter(false)
              }}
              onClose={() => setShowAssigneeFilter(false)}
            />

            <TypeFilter
              selectedType={typeFilter}
              onSelect={setTypeFilter}
              isOpen={showTypeFilter}
              onToggle={() => {
                setShowTypeFilter(!showTypeFilter)
                setShowStatusFilter(false)
                setShowAssigneeFilter(false)
              }}
              onClose={() => setShowTypeFilter(false)}
            />

            {/* View Mode Toggle */}
            <div className='flex items-center gap-1 border-l border-gray-200 pl-3 ml-3'>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
                title='Danh sách'
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('detail')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'detail' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
                title='Chi tiết'
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-2'>
          {/* Export/Import */}
          <div className='flex items-center gap-2'>
            <ExportMenu tasks={tasks} statuses={statuses} />

            {permissions.canCreateTask && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className='flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium'
                >
                  <Upload size={16} />
                  Nhập
                </button>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.csv,.xls,.xlsx'
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleImport(file)
                    }
                  }}
                />
              </>
            )}
          </div>

          {/* Add Task Button */}
          {permissions.canCreateTask && (
            <button
              onClick={handleCreateTask}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
            >
              <Plus size={18} />
              Công việc mới
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 p-6 overflow-auto bg-gray-50' style={{ overflow: 'auto' }}>
        {viewMode === 'list' ? (
          <TaskTable
            tasks={tasks}
            projectId={projectId || ''}
            isLoading={isLoading}
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data as any)}
            selectedTasks={selectedTasks}
            onTaskClick={handleTaskClick}
            onUpdate={handleInlineEdit}
            onSelectionChange={handleSelectionChange}
          />
        ) : (
          <div className='flex h-full gap-6'>
            {/* Task Cards Column */}
            <div className='w-[400px] bg-white rounded-xl border border-gray-200 overflow-y-auto shadow-sm'>
              <div className='p-4 space-y-3'>
                {tasks.filter((t) => !t.parent_id).length === 0 ? (
                  <div className='text-center text-gray-400 py-8 text-base'>Không có công việc nào</div>
                ) : (
                  tasks
                    .filter((t) => !t.parent_id)
                    .map((task) => (
                      <TaskCard
                        key={task.task_id}
                        task={task}
                        projectId={projectId || ''}
                        isSelected={selectedTask?.task_id === task.task_id}
                        onClick={() => {
                          setSelectedTask(task)
                          setIsTaskDetailOpen(true)
                          navigate(`?task=${task.task_id}`)
                        }}
                      />
                    ))
                )}
              </div>
            </div>

            {/* Task Detail Column */}
            <div className='flex-1 bg-white rounded-xl border border-gray-200 overflow-y-auto shadow-sm'>
              {selectedTask && isTaskDetailOpen && viewMode === 'detail' ? (
                <div className='h-full'>
                  <TaskDetailModal
                    isOpen={isTaskDetailOpen}
                    onClose={() => {
                      setIsTaskDetailOpen(false)
                      setSelectedTask(null)
                      const newSearchParams = new URLSearchParams(searchParams)
                      newSearchParams.delete('task')
                      const newQueryString = newSearchParams.toString()
                      navigate(newQueryString ? `list?${newQueryString}` : 'list', { replace: true })
                    }}
                    onUpdate={() => {
                      refetch()
                    }}
                  />
                </div>
              ) : (
                <div className='flex items-center justify-center h-full text-gray-400 text-base'>
                  Chọn một công việc để xem chi tiết
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Status Update Modal */}
      <BulkStatusModal
        isOpen={showBulkStatusModal}
        onClose={() => setShowBulkStatusModal(false)}
        statuses={statuses}
        selectedCount={selectedTasks.length}
        onSelectStatus={handleBulkStatusUpdate}
      />

      {/* Task Detail Modal */}
      {(selectedTask || taskIdFromQuery) && isTaskDetailOpen && viewMode === 'list' && (
        <TaskDetailModal
          isOpen={isTaskDetailOpen}
          onClose={() => {
            setIsTaskDetailOpen(false)
            setSelectedTask(null)
            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.delete('task')
            const newQueryString = newSearchParams.toString()
            navigate(newQueryString ? `list?${newQueryString}` : 'list', { replace: true })
          }}
          onUpdate={() => {
            refetch()
          }}
        />
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && addModalContent && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
            <div className='flex items-center justify-between p-5 border-b border-gray-200'>
              <h2 className='text-lg font-bold text-gray-900'>Tạo công việc mới</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setAddModalContent(null)
                }}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X size={20} className='text-gray-600' />
              </button>
            </div>
            <div className='h-[calc(90vh-80px)] overflow-auto'>{addModalContent}</div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar - Fixed at bottom */}
      <BulkActionsBar
        selectedCount={selectedTasks.length}
        onBulkEdit={() => setShowBulkStatusModal(true)}
        onBulkDelete={handleBulkDeleteClick}
      />

      <Toast ref={toastRef} />

      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleConfirmBulkDelete}
        title='Xóa nhiều công việc'
        message={`Bạn có chắc chắn muốn xóa ${selectedTasks.length} công việc? Hành động này không thể hoàn tác.`}
        confirmText='Xóa'
        confirmButtonColor='bg-red-600 hover:bg-red-700'
      />
    </div>
  )
}
