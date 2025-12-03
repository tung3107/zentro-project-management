import React, { useEffect, useState } from 'react'
import DragnDropColumn, { type Column } from './DragnDropColumn'
import { ChartColumnIncreasing, ListFilter, Plus, Repeat, Search, X } from 'lucide-react'
import { Tooltip } from 'primereact/tooltip'
import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Skeleton } from 'primereact/skeleton'
import socketClient from '../../../../util/socketClient'
import type { Sprint } from '../../../../types/sprint'
import type { Task } from '../../../../types/task'
import { useProjectRole } from '../../hooks/useProjectRole'
import { getCurrentSprintDetails } from '../../service/sprint.service'
import { getBoard, getBurndownChart, searchBoard } from '../../service/task.service'
import api from '../../../../util/axiosClient'
import AddTaskCom from '../task/AddTaskCom'
import { toast } from 'sonner'
import FilterMenu from '../modal/FilterMenu'
import BurndownModal from '../modal/BurndownModal'
import OverlayCenterModal from '../../../../components/OverlayCenterModal'
import TaskDetailModal from '../task/TaskDetailModal'
import CompleteSprintModal from '../sprint/CompleteSprintModal'
import { completeSprintAPI, getAllSprintsAPI } from '../../service/sprint.service'
import type { ApiErrorResponse } from '../../../auth/hooks/useAuth'
import type { AxiosError } from 'axios'
import SprintBoardHeader from './SprintBoardHeader'

export default function BoardTab() {
  const [query, setQuery] = useState('')
  const [columns, setColumns] = useState<Column[]>([])
  const [sprint, setSprint] = useState<Sprint>()
  const [isLoading, setLoading] = useState(false)
  const [showSprintDetail, setShowSprintDetail] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showBurndown, setShowBurndown] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [addTaskModalContent, setAddTaskModalContent] = useState<React.ReactNode | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState<{ assignee_id?: string; priority?: number; type?: string }>({})
  const [members, setMembers] = useState<any[]>([])
  const [statuses, setStatuses] = useState<any[]>([])
  const [burndownData, setBurndownData] = useState<any>(null)
  const [sprintToComplete, setSprintToComplete] = useState<Sprint | null>(null)
  const [allSprints, setAllSprints] = useState<Sprint[]>([])
  const [completedStatusIds, setCompletedStatusIds] = useState<number[]>([])
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const taskIdFromQuery = searchParams.get('task')
  const { permissions } = useProjectRole()

  //// Fetch Data for sprint

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await getCurrentSprintDetails(projectId)
        setSprint(res.data)

        const res_2 = await getBoard(projectId)
        setColumns(res_2.data)

        // Load members for filter
        const membersRes = await api.get(`/members/project/${projectId}`)
        const membersList = membersRes.data.data.map((m: any) => ({
          ...m,
          name: `${m.first_name} ${m.last_name}`
        }))
        setMembers(membersList)

        // Load statuses for task detail modal
        const statusesRes = await api.get(`/status/project/${projectId}`)
        const statusesData = statusesRes.data.data || []
        setStatuses(statusesData)

        // Load all sprints for the complete sprint modal
        const allSprintsRes = await getAllSprintsAPI(projectId)
        setAllSprints(allSprintsRes.data || [])

        // Find "done" or "completed" status IDs
        const completedIds = statusesData
          .filter((s: any) => s.name?.toLowerCase().includes('done') || s.name?.toLowerCase().includes('hoàn thành'))
          .map((s: any) => s.status_id)
        setCompletedStatusIds(completedIds)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [projectId])

  // Search function
  const handleSearch = async () => {
    if (!query.trim() && Object.keys(filters).length === 0) {
      // No search or filters, reload board
      try {
        const res = await getBoard(projectId)
        setColumns(res.data)
      } catch (err) {
        console.error(err)
      }
      return
    }

    try {
      const res = await searchBoard(projectId, query, filters)
      setColumns(res.data)
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  /// Search
  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch()
    }, 400)
    return () => clearTimeout(delay)
  }, [query, filters])

  // Socket
  useEffect(() => {
    if (projectId) {
      console.log('🔌 [Socket] Joining project:', projectId)
      socketClient.joinProject(projectId)
    }

    const handleTaskCreated = (task: any) => {
      console.log('✅ [Socket] Task created:', task)
      setColumns((prev) => {
        const newCols = [...prev]
        const col = newCols.find((c) => c.id === task.status_id)
        if (col) col.tasks = [task, ...col.tasks]
        return newCols
      })
    }

    const handleTaskUpdated = (updatedTask: any) => {
      console.log('🔄 [Socket] Task updated:', updatedTask)
      setColumns((prev) => {
        const newCols = prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.task_id !== updatedTask.task_id)
        }))
        const targetCol = newCols.find((c) => c.id === updatedTask.status_id)
        if (targetCol) targetCol.tasks = [updatedTask, ...targetCol.tasks]
        return newCols
      })
    }

    const handleTaskDeleted = ({ task_id }: { task_id: string }) => {
      console.log('🗑️ [Socket] Task deleted:', task_id)
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.task_id !== task_id)
        }))
      )
    }

    console.log('👂 [Socket] Registering event listeners...')
    socketClient.onTaskCreated(handleTaskCreated)
    socketClient.onTaskUpdated(handleTaskUpdated)
    socketClient.onTaskDeleted(handleTaskDeleted)

    return () => {
      console.log('🔌 [Socket] Leaving project:', projectId)
      if (projectId) {
        socketClient.leaveProject(projectId)
      }
      socketClient.offTaskCreated()
      socketClient.offTaskUpdated()
      socketClient.offTaskDeleted()
    }
  }, [projectId])

  /// Handle change function for input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
  }

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const handleLoadBurndown = async () => {
    try {
      const res = await getBurndownChart(projectId!)
      setBurndownData(res.data)
      setShowBurndown(true)
    } catch (err) {
      console.error('Failed to load burndown:', err)
    }
  }

  const handleOpenAddTaskWithStatus = (statusId: number) => {
    if (!permissions.canCreateTask) {
      toast.error('Bạn không có quyền tạo công việc')
      return
    }

    setAddTaskModalContent(
      <AddTaskCom
        setAddModalOpen={setShowAddTask}
        setAddModalContent={setAddTaskModalContent}
        onSuccess={async () => {
          const res = await getBoard(projectId)
          setColumns(res.data)
        }}
        projectId={projectId!}
        initialStatusId={statusId}
        initialSprintId={sprint?.sprint_id}
      />
    )
    setShowAddTask(true)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    navigate(`board?task=${task.task_id}`, { replace: true })
  }

  const handleTaskUpdate = async () => {
    // Reload board after task update/delete
    try {
      const res = await getBoard(projectId)
      setColumns(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const calcDaysLeft = () => {
    if (!sprint?.end_date) return ''
    const today = new Date()
    const end = new Date(sprint.end_date)
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? `${diff} ngày còn lại` : diff === 0 ? 'Hôm nay là ngày cuối' : 'Đã kết thúc'
  }

  const handleCompleteSprintClick = () => {
    if (sprint) {
      setSprintToComplete(sprint)
    }
  }

  const handleCompleteSprintConfirm = async (
    incompleteTasks: { taskId: string; action: 'backlog' | 'nextSprint'; targetSprintId?: number | null }[]
  ) => {
    if (!sprintToComplete) return

    try {
      if (!permissions.canCompleteSprint) {
        toast.error('Bạn không có quyền hoàn thành giai đoạn!')
        return
      }
      await completeSprintAPI(sprintToComplete.sprint_id, incompleteTasks)
      toast.success('Đã hoàn thành giai đoạn thành công!')

      setSprintToComplete(null)
      // Reload board
      const res = await getCurrentSprintDetails(projectId)
      setSprint(res.data)
      const res_2 = await getBoard(projectId)
      setColumns(res_2.data)
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      toast.error(error.response?.data.error.message ?? 'Lỗi khi hoàn thành giai đoạn!')
    }
  }

  const renderSkeleton = () => {
    const skeletonCols = Array.from({ length: 4 })
    return (
      <div className='w-full'>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex gap-3'>
            <Skeleton width='250px' height='36px' borderRadius='8px' />
            <Skeleton width='90px' height='36px' borderRadius='8px' />
          </div>
          <div className='flex gap-3'>
            <Skeleton width='130px' height='36px' borderRadius='8px' />
            <Skeleton width='40px' height='36px' borderRadius='8px' />
            <Skeleton width='40px' height='36px' borderRadius='8px' />
          </div>
        </div>

        <div className='flex gap-4 overflow-x-auto items-stretch'>
          {skeletonCols.map((_, idx) => (
            <div key={idx} className='w-[280px] bg-white border border-gray-200 rounded-lg p-4 flex-shrink-0 shadow-sm'>
              <Skeleton width='60%' height='20px' className='mb-4' />
              <div className='flex flex-col gap-3'>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className='border border-gray-200 rounded-lg p-3 shadow-sm bg-gray-50'>
                    <Skeleton width='80%' height='16px' className='mb-2' />
                    <Skeleton width='40%' height='14px' />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-5 gap-6'>
      <div className='col-span-5' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {isLoading ? (
          renderSkeleton()
        ) : (
          <>
            {/* New Sprint Header */}
            {/* New Sprint Header */}
            {sprint && (
              <SprintBoardHeader
                sprint={sprint}
                columns={columns}
                query={query}
                setQuery={setQuery}
                filters={filters}
                onOpenFilter={() => setShowFilterMenu(true)}
                onCompleteSprint={handleCompleteSprintClick}
                onShowBurndown={handleLoadBurndown}
                permissions={permissions}
                completedStatusIds={completedStatusIds}
              />
            )}

            {!sprint ? (
              <div className='w-full flex flex-col items-center justify-center mt-20 text-center text-gray-600'>
                <Repeat size={48} className='text-gray-500 mb-3' />
                <p className='text-lg font-medium mb-4'>
                  Hãy lên kế hoạch và khởi tạo một giai đoạn mới ở tab <strong>Kho công việc</strong> 💡
                </p>
                <NavLink
                  to={`backlog`}
                  className='px-5 py-2 bg-[var(--color-lowest)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition'
                >
                  Đi đến Kho công việc
                </NavLink>
              </div>
            ) : (
              <>
                {/* Board columns */}
                <div className='flex gap-4 mb-[20px]'>
                  <DragnDropColumn
                    columns={columns}
                    setColumns={setColumns}
                    onTaskClick={handleTaskClick}
                    onAddTask={handleOpenAddTaskWithStatus}
                    onTaskUpdate={handleTaskUpdate}
                    canDelete={permissions.canDelete}
                    canEdit={permissions.canEdit}
                  />
                </div>
              </>
            )}

            {/* Filter Menu */}
            <FilterMenu
              project_id={projectId}
              isOpen={showFilterMenu}
              onClose={() => setShowFilterMenu(false)}
              onApply={handleApplyFilters}
              currentFilters={filters}
            />

            {/* Burndown Modal */}
            <BurndownModal isOpen={showBurndown} onClose={() => setShowBurndown(false)} data={burndownData} />

            {/* Add Task Modal */}
            {showAddTask && (
              <OverlayCenterModal
                isOpen={showAddTask}
                formable={true}
                onClose={() => {
                  setShowAddTask(false)
                  setAddTaskModalContent(null)
                }}
                title='Tạo công việc mới'
                width='50%'
                height='90%'
              >
                {addTaskModalContent}
              </OverlayCenterModal>
            )}

            {/* Task Detail Modal */}
            {(selectedTask || taskIdFromQuery) && (
              <TaskDetailModal
                isOpen={true}
                onClose={() => {
                  setSelectedTask(null)
                  const newSearchParams = new URLSearchParams(searchParams)
                  newSearchParams.delete('task')
                  const newQueryString = newSearchParams.toString()
                  navigate(newQueryString ? `board?${newQueryString}` : 'board', { replace: true })
                }}
                onUpdate={handleTaskUpdate}
                members={members}
                statuses={statuses}
              />
            )}

            {/* Complete Sprint Modal */}
            {sprintToComplete && (
              <CompleteSprintModal
                isOpen={true}
                onClose={() => setSprintToComplete(null)}
                sprint={sprintToComplete}
                onConfirm={handleCompleteSprintConfirm}
                availableSprints={allSprints.filter(
                  (s) => s.status === 'planned' && s.sprint_id !== sprintToComplete.sprint_id
                )}
                completedStatuses={completedStatusIds}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
