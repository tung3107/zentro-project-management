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
import api from "../../../../util/axiosClient"
import AddTaskCom from '../task/AddTaskCom'
import { toast } from 'sonner'
import FilterMenu from '../modal/FilterMenu'
import BurndownModal from '../modal/BurndownModal'
import OverlayCenterModal from '../../../../components/OverlayCenterModal'
import TaskDetailModal from '../task/TaskDetailModal'


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
        setStatuses(statusesRes.data.data || [])
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
            {/* Header bar */}
            <div className='flex flex-row justify-between mb-6'>
              <div className='flex flex-row gap-2'>
                <div className='relative w-[250px]'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
                  <input
                    type='text'
                    placeholder='Search board'
                    value={query}
                    onChange={handleChange}
                    className='pl-9 pr-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm'
                  />
                </div>

                <button
                  onClick={() => setShowFilterMenu(true)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer ${
                    Object.keys(filters).length > 0
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'border-gray-400 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ListFilter size={18} />
                  Filter
                  {Object.keys(filters).length > 0 && (
                    <span className='px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full'>
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>
              </div>

              <div className='flex flex-row gap-2'>
                <Tooltip target='.sprint-btn' />
                <Tooltip target='.burndown-btn' />
                <Tooltip target='.add-task-btn' />

                {sprint && (
                  <>
                    <button className='flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 bg-[var(--color-lowest)] text-white transition-colors duration-150 cursor-pointer'>
                      Hoàn thành sprint
                    </button>
                  </>
                )}

                <div
                  onClick={() => setShowSprintDetail(true)}
                  className='sprint-btn flex items-center gap-2 px-2 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer'
                  data-pr-tooltip='Chi tiết sprint'
                  data-pr-position='bottom'
                >
                  <Repeat size={18} className='text-gray-700' />
                </div>

                <div
                  onClick={handleLoadBurndown}
                  className='burndown-btn flex items-center gap-2 px-2 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer'
                  data-pr-tooltip='Biểu đồ burndown'
                  data-pr-position='bottom'
                >
                  <ChartColumnIncreasing size={18} className='text-gray-700' />
                </div>
              </div>
            </div>

            {/* 🪄 Nếu KHÔNG có sprint nào đang active */}
            {!sprint ? (
              <div className='w-full flex flex-col items-center justify-center mt-20 text-center text-gray-600'>
                <Repeat size={48} className='text-gray-500 mb-3' />
                <p className='text-lg font-medium mb-4'>
                  Hãy lên kế hoạch và khởi tạo một sprint mới ở tab <strong>Backlog</strong> 💡
                </p>
                <NavLink
                  to={`backlog`}
                  className='px-5 py-2 bg-[var(--color-lowest)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition'
                >
                  Đi đến Backlog
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

            {/* 🪄 Sprint Detail Modal */}
            {showSprintDetail && sprint && (
              <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
                <div className='bg-white rounded-xl shadow-lg p-6 w-[400px] relative'>
                  <button
                    onClick={() => setShowSprintDetail(false)}
                    className='absolute top-3 right-3 text-gray-500 hover:text-black'
                  >
                    <X size={20} />
                  </button>

                  <h2 className='text-xl font-semibold text-black mb-3'>{sprint.name}</h2>
                  <p className='text-gray-600 text-sm mb-2'>
                    <strong>Bắt đầu:</strong> {new Date(sprint.start_date).toLocaleDateString('vi-VN')}
                  </p>
                  <p className='text-gray-600 text-sm mb-2'>
                    <strong>Kết thúc:</strong> {new Date(sprint.end_date).toLocaleDateString('vi-VN')}
                  </p>
                  <p className='text-gray-800 font-medium mt-4'>{calcDaysLeft()}</p>
                </div>
              </div>
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
          </>
        )}
      </div>
    </div>
  )
}
