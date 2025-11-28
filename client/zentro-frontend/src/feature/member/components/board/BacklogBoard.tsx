import React, { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, MoreHorizontal, PlusCircle } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Menu } from 'primereact/menu'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import api from '../../../../util/axiosClient'
import type { Task } from '../../../../types/task'
import type { Sprint } from '../../../../types/sprint'
import { getBacklog, searchBacklog, updateTaskAPI } from '../../service/task.service'
import { deleteSprintAPI, startsprintAPI, completeSprintAPI, getAllSprintsAPI } from '../../service/sprint.service'
import type { ApiErrorResponse } from '../../../auth/hooks/useAuth'
import AddTaskCom from '../task/AddTaskCom'
import EditSprintCom from '../sprint/EditSprintCom'
import AddSprintCom from '../sprint/AddSprintCom'
import TaskCard from '../task/TaskCard'
import OverlayCenterModal from '../../../../components/OverlayCenterModal'
import TaskDetailModal from '../task/TaskDetailModal'
import CompleteSprintModal from '../sprint/CompleteSprintModal'
import { useProjectRole } from '../../hooks/useProjectRole'

interface BacklogType {
  backlog: { tasks: Task[] }
  sprints: Sprint[]
}

export default function BacklogPage({ searchQuery }: { searchQuery: string }) {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({ backlog: true })
  const menuRef = useRef<any>(null)
  const [menuModel, setMenuModel] = useState<any[]>([])
  const { projectId } = useParams()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalContent, setAddModalContent] = useState<ReactNode | null>(null)

  const [addSprintModalOpen, setAddSprintModalOpen] = useState(false)
  const [addSprintModalContent, setAddSprintModalContent] = useState<ReactNode | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteModalContent, setDeleteModalContent] = useState<React.ReactNode | null>(null)

  const [editSprintModalOpen, setEditSprintModalOpen] = useState(false)
  const [editSprintModalContent, setEditSprintModalContent] = useState<ReactNode | null>(null)

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const [reloadKey, setReloadKey] = useState(0)
  const [selectedSprint, setSelectedSprint] = useState<number | null>(0)
  const [sprintToComplete, setSprintToComplete] = useState<Sprint | null>(null)
  const [allSprints, setAllSprints] = useState<Sprint[]>([])
  const [completedStatusIds, setCompletedStatusIds] = useState<number[]>([])
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const taskIdFromQuery = searchParams.get('task')

  const { permissions, isLoading: loadingPermissions } = useProjectRole()

  const [data, setData] = useState<BacklogType>({
    backlog: { tasks: [] },
    sprints: []
  })
  const [loading, setLoading] = useState(true)

  const handleSearch = async (projectId: string | undefined, query: string) => {
    if (!projectId) return
    const data = await searchBacklog(projectId, query)

    setData(data.data)
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      if (projectId) {
        handleSearch(projectId, searchQuery)
      }
    }, 400)
    return () => clearTimeout(delay)
  }, [projectId, searchQuery])

  useEffect(() => {
    async function fetchData() {
      if (!projectId) return
      setLoading(true)
      try {
        const res = await getBacklog(projectId)

        setData(res.data)
        const expandAll: { [key: string]: boolean } = { backlog: true }
        res.data.sprints.forEach((sprint: Sprint) => {
          expandAll[sprint.sprint_id] = true
        })
        setExpanded(expandAll)

        // Load all sprints for the complete sprint modal
        const allSprintsRes = await getAllSprintsAPI(projectId)
        setAllSprints(allSprintsRes.data || [])

        // Load statuses to determine completed tasks
        const statusRes = await api.get(`/status/${projectId}`)
        const statuses = statusRes.data.data || []
        // Find "done" or "completed" status IDs
        const completedIds = statuses
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
  }, [projectId, reloadKey])

  const openAddModal = (content: ReactNode) => {
    setAddModalOpen(true)
    setAddModalContent(content)
  }

  const closeAddModal = () => {
    setAddModalContent(null)
    setAddModalOpen(false)
  }

  const openEditSprintModal = (content: ReactNode) => {
    setEditSprintModalOpen(true)
    setEditSprintModalContent(content)
  }

  const closeEditSprintModal = () => {
    setEditSprintModalContent(null)
    setEditSprintModalOpen(false)
  }

  const openAddSprintModal = (content: ReactNode) => {
    setAddSprintModalOpen(true)
    setAddSprintModalContent(content)
  }

  const closeAddSprintModal = () => {
    setAddSprintModalContent(null)
    setAddSprintModalOpen(false)
  }

  const openDeleteModal = (element: ReactNode) => {
    setDeleteModalContent(element)
    setDeleteModalOpen(true)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    navigate(`backlog?task=${task.task_id}`)
  }

  const handleDeleteConfirm = async () => {
    if (selectedSprint !== null) {
      try {
        await deleteSprintAPI(selectedSprint)

        closeDeleteModal()
        setReloadKey((prev) => prev + 1)
        toast.success('Xóa dự án thành công')
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi thay đổi thông tin dự án!')
      }
    }
  }

  const closeDeleteModal = () => {
    setSelectedSprint(null)
    setDeleteModalContent(null)
    setDeleteModalOpen(false)
  }

  const handleAdd = () => {
    if (!projectId) return
    openAddModal(
      <AddTaskCom
        setAddModalContent={setAddModalContent}
        setAddModalOpen={setAddModalOpen}
        projectId={projectId}
        onSuccess={() => setReloadKey((prev) => prev + 1)}
      />
    )
  }

  const handleEdit = (sprint: Sprint) => {
    openEditSprintModal(
      <EditSprintCom
        setAddModalContent={setEditSprintModalContent}
        setAddModalOpen={setEditSprintModalOpen}
        sprintId={sprint.sprint_id}
        onSuccess={() => setReloadKey((prev) => prev + 1)}
      />
    )
  }

  const handleAddSprint = () => {
    if (!projectId) return
    if (!permissions.canCreateSprint) {
      toast.error('Bạn không có quyền tạo giai đoạn!')
      return
    }
    openAddSprintModal(
      <AddSprintCom
        setAddModalContent={setAddSprintModalContent}
        setAddModalOpen={setAddSprintModalOpen}
        projectId={projectId}
        onSuccess={() => setReloadKey((prev) => prev + 1)}
      />
    )
  }

  const handleDelete = (sprint: Sprint) => {
    setSelectedSprint(sprint.sprint_id)
    openDeleteModal(
      <>
        <h2 className='title'>Bạn chắc chắn chưa?</h2>
        <p className='subtitle'>{`Bạn muốn xóa sprint ${sprint.name}`}</p>
      </>
    )
  }

  const onDragEnd = async (result: any) => {
    if (!permissions.canDragTaskSprint) {
      toast.error('Bạn không có quyền thay đổi vị trí công việc!')
      return
    }
    const { source, destination } = result
    if (!destination) return

    // Không thay đổi vị trí thì bỏ qua
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const sameList = source.droppableId === destination.droppableId

    // Nếu kéo trong cùng một list
    if (sameList) {
      setData((prev) => {
        if (source.droppableId === 'backlog') {
          // Reorder trong backlog
          const newTasks = [...prev.backlog.tasks]
          const [moved] = newTasks.splice(source.index, 1)
          newTasks.splice(destination.index, 0, moved)

          return {
            ...prev,
            backlog: { tasks: newTasks }
          }
        } else {
          // Reorder trong sprint
          const sprintId = Number(source.droppableId)
          return {
            ...prev,
            sprints: prev.sprints.map((sprint) => {
              if (sprint.sprint_id === sprintId) {
                const newTasks = [...(sprint.tasks || [])]
                const [moved] = newTasks.splice(source.index, 1)
                newTasks.splice(destination.index, 0, moved)
                return { ...sprint, tasks: newTasks }
              }
              return sprint
            })
          }
        }
      })
    } else {
      // Kéo giữa các list khác nhau
      const sourceList =
        source.droppableId === 'backlog'
          ? [...data.backlog.tasks]
          : [...(data.sprints.find((s) => s.sprint_id === Number(source.droppableId))?.tasks || [])]

      const destList =
        destination.droppableId === 'backlog'
          ? [...data.backlog.tasks]
          : [...(data.sprints.find((s) => s.sprint_id === Number(destination.droppableId))?.tasks || [])]

      // Lấy task bị kéo ra
      const [moved] = sourceList.splice(source.index, 1)

      // Cập nhật sprint_id cho task
      moved.sprint_id = destination.droppableId === 'backlog' ? null : Number(destination.droppableId)

      // Thêm vào list mới
      destList.splice(destination.index, 0, moved)

      // Cập nhật state
      setData((prev) => ({
        backlog: {
          tasks:
            destination.droppableId === 'backlog'
              ? destList
              : source.droppableId === 'backlog'
                ? sourceList
                : prev.backlog.tasks
        },
        sprints: prev.sprints.map((sprint) => {
          if (source.droppableId !== 'backlog' && sprint.sprint_id === Number(source.droppableId)) {
            return { ...sprint, tasks: sourceList }
          }
          if (destination.droppableId !== 'backlog' && sprint.sprint_id === Number(destination.droppableId)) {
            return { ...sprint, tasks: destList }
          }
          return sprint
        })
      }))

      // Chỉ gọi API khi thay đổi sprint_id
      try {
        await updateTaskAPI(moved)
        toast.success('Đã cập nhật vị trí task', { duration: 2000 })
      } catch (err) {
        console.error('Update task failed:', err)
        toast.error('Lỗi khi cập nhật task 😢')
        setReloadKey((prev) => prev + 1)
      }
    }
  }

  const completeSprint = (sprint: Sprint) => {
    setSprintToComplete(sprint)
  }

  const handleCompleteSprintConfirm = async (
    incompleteTasks: { taskId: string; action: 'backlog' | 'nextSprint'; targetSprintId?: number | null }[]
  ) => {
    if (!sprintToComplete) return

    try {
      if (!permissions.canCompleteSprint) {
        toast.error('Bạn không có quyền hoàn thành sprint!')
        return
      }
      await completeSprintAPI(sprintToComplete.sprint_id, incompleteTasks)
      toast.success('Đã hoàn thành sprint thành công!')

      setSprintToComplete(null)
      setReloadKey((prev) => prev + 1)
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      toast.error(error.response?.data.error.message ?? 'Lỗi khi hoàn thành sprint!')
    }
  }

  const startSprint = async (sprint: Sprint) => {
    try {
      await startsprintAPI(sprint)
      toast.success('Bắt đầu 1 sprint')

      setReloadKey((prev) => prev + 1)
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      toast.error(error.response?.data.error.message ?? 'Lỗi khi tạo role!')
    }
  }

  const handleTaskUpdate = async () => {
    // Reload board after task update/delete
    try {
      const res = await getBacklog(projectId)
      setData(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  // Sprint status colors (matching CalendarView)
  const getSprintColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#0052CC' // Blue for active
      case 'completed':
        return '#6B778C' // Gray for completed
      case 'planned':
        return '#FFAB00' // Orange for planned
      default:
        return '#6B778C'
    }
  }

  const getSprintStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang chạy'
      case 'completed':
        return 'Đã hoàn thành'
      case 'planned':
        return 'Đã lên kế hoạch'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div
        className='flex flex-col gap-6 p-6 col-span-5 bg-gray-50 min-h-screen w-full'
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {/* 🔹 Skeleton Sprint Section */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className='bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse w-full shadow-sm'
          >
            <div className='flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200'>
              <div className='flex items-center gap-3'>
                <div className='w-5 h-5 bg-gray-300 rounded'></div>
                <div className='w-48 h-5 bg-gray-300 rounded'></div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-32 h-8 bg-gray-300 rounded-lg'></div>
                <div className='w-8 h-8 bg-gray-300 rounded-full'></div>
              </div>
            </div>
            <div className='p-4 space-y-3'>
              {[1, 2, 3].map((j) => (
                <div key={j} className='bg-gray-100 rounded-lg p-4'>
                  <div className='flex flex-col gap-2'>
                    <div className='w-3/4 h-4 bg-gray-300 rounded'></div>
                    <div className='flex gap-3'>
                      <div className='w-20 h-3 bg-gray-200 rounded'></div>
                      <div className='w-24 h-3 bg-gray-200 rounded'></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 🔸 Skeleton Backlog Section */}
        <div className='bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse w-full shadow-sm'>
          <div className='flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200'>
            <div className='flex items-center gap-3'>
              <div className='w-5 h-5 bg-gray-300 rounded'></div>
              <div className='w-32 h-5 bg-gray-300 rounded'></div>
            </div>
            <div className='w-36 h-8 bg-gray-300 rounded-lg'></div>
          </div>
          <div className='p-4 space-y-3'>
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className='bg-gray-100 rounded-lg p-4'>
                <div className='flex flex-col gap-2'>
                  <div className='w-3/4 h-4 bg-gray-300 rounded'></div>
                  <div className='flex gap-3'>
                    <div className='w-20 h-3 bg-gray-200 rounded'></div>
                    <div className='w-24 h-3 bg-gray-200 rounded'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className='flex flex-col col-span-5 gap-6 p-6 bg-gray-50 min-h-screen'
      key={reloadKey}
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        {/* 🏃‍♂️ SPRINTS */}
        {data.sprints.map((sprint) => {
          const sprintColor = getSprintColor(sprint.status || 'planned')
          const sprintStatusLabel = getSprintStatusLabel(sprint.status || 'planned')

          return (
            <div
              key={sprint.sprint_id}
              className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-shadow hover:shadow-md'
            >
              {/* Sprint Header */}
              <div className='flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200'>
                <div className='flex items-center gap-3 flex-1'>
                  <button
                    className='flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer group'
                    onClick={() => setExpanded((prev) => ({ ...prev, [sprint.sprint_id]: !prev[sprint.sprint_id] }))}
                  >
                    {expanded[sprint.sprint_id] ? (
                      <ChevronDown size={18} className='text-gray-600 group-hover:text-gray-900' />
                    ) : (
                      <ChevronRight size={18} className='text-gray-600 group-hover:text-gray-900' />
                    )}
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-2 h-2 rounded-full flex-shrink-0'
                        style={{ backgroundColor: sprintColor }}
                      ></div>
                      <span className='text-lg font-semibold text-gray-900'>{sprint.name}</span>
                      <span className='px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700'>
                        {sprint.tasks?.length || 0} tasks
                      </span>
                      <span
                        className='px-2 py-0.5 text-xs font-medium rounded-md text-white'
                        style={{ backgroundColor: sprintColor + '20', color: sprintColor }}
                      >
                        {sprintStatusLabel}
                      </span>
                    </div>
                  </button>
                </div>

                <div className='flex items-center gap-3'>
                  {sprint?.tasks &&
                    sprint.tasks.length > 0 &&
                    sprint.status === 'active' &&
                    permissions.canCompleteSprint && (
                      <button
                        className='px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer hover:opacity-90 transition-opacity'
                        style={{ backgroundColor: '#0052CC' }}
                        onClick={() => completeSprint(sprint)}
                      >
                        Hoàn thành sprint
                      </button>
                    )}
                  {sprint?.tasks && sprint.tasks.length > 0 && sprint.status === 'planned' && (
                    <button
                      className='px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer hover:opacity-90 transition-opacity'
                      style={{ backgroundColor: '#FFAB00' }}
                      onClick={() => startSprint(sprint)}
                    >
                      Bắt đầu sprint
                    </button>
                  )}
                  <Menu model={menuModel} popup ref={menuRef} />
                  {permissions.canCreateSprint || permissions.canDeleteSprint ? (
                    <button
                      className='p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900'
                      onClick={(e) => {
                        setSelectedSprint(sprint.sprint_id)
                        const menuItems = []
                        if (permissions.canEdit)
                          menuItems.push({
                            label: 'Sửa Sprint',
                            icon: 'pi pi-pencil',
                            command: () => handleEdit(sprint)
                          })
                        if (permissions.canDeleteSprint)
                          menuItems.push({
                            label: 'Xóa Sprint',
                            icon: 'pi pi-trash',
                            command: () => handleDelete(sprint)
                          })
                        setMenuModel(menuItems)
                        menuRef.current.toggle(e)
                      }}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Sprint Tasks */}
              {expanded[sprint.sprint_id] && (
                <Droppable droppableId={String(sprint.sprint_id)}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className='p-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-2'
                    >
                      {sprint.tasks?.length === 0 ? (
                        <div className='text-center text-gray-500 py-12 font-medium'>
                          <div className='text-4xl mb-3'>🎯</div>
                          <div>Chưa có task nào trong sprint này</div>
                          <div className='text-sm text-gray-400 mt-1'>Kéo task từ Backlog vào đây để bắt đầu</div>
                        </div>
                      ) : (
                        sprint.tasks?.map((task, index) => (
                          <Draggable key={task.task_id} draggableId={String(task.task_id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-all duration-200 ${
                                  snapshot.isDragging ? 'opacity-90 scale-[1.02]' : ''
                                }`}
                              >
                                <TaskCard
                                  task={task}
                                  isDragging={snapshot.isDragging}
                                  setReloadKey={setReloadKey}
                                  onTaskClick={handleTaskClick}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          )
        })}
        {/* 🧱 BACKLOG */}
        <div className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-shadow hover:shadow-md'>
          {/* Backlog Header */}
          <div className='flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200'>
            <button
              className='flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer group flex-1'
              onClick={() => setExpanded((prev) => ({ ...prev, backlog: !prev.backlog }))}
            >
              {expanded.backlog ? (
                <ChevronDown size={18} className='text-gray-600 group-hover:text-gray-900' />
              ) : (
                <ChevronRight size={18} className='text-gray-600 group-hover:text-gray-900' />
              )}
              <div className='flex items-center gap-3'>
                <span className='text-lg font-semibold text-gray-900'>Backlog</span>
                <span className='px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700'>
                  {data.backlog?.tasks?.length || 0} tasks
                </span>
              </div>
            </button>

            <div className='flex items-center gap-3'>
              {permissions.canCreateSprint && (
                <button
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
                  onClick={handleAddSprint}
                >
                  Tạo sprint mới
                </button>
              )}
            </div>
          </div>

          {/* Backlog Tasks */}
          {expanded.backlog && (
            <Droppable droppableId='backlog'>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className='p-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-2'
                >
                  {data.backlog.tasks.length === 0 ? (
                    <div className='text-center text-gray-500 py-12 font-medium'>
                      <div className='text-4xl mb-3'>📋</div>
                      <div>Không có task nào trong backlog</div>
                      <div className='text-sm text-gray-400 mt-1'>Tạo task mới để bắt đầu làm việc</div>
                    </div>
                  ) : (
                    data.backlog.tasks.map((task, index) => (
                      <Draggable key={task.task_id} draggableId={String(task.task_id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`transition-all duration-200 ${
                              snapshot.isDragging ? 'opacity-90 scale-[1.02]' : ''
                            }`}
                          >
                            <TaskCard
                              task={task}
                              isDragging={snapshot.isDragging}
                              setReloadKey={setReloadKey}
                              onTaskClick={handleTaskClick}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}

          {/* Create Task Button */}
          {permissions.canCreateTask && (
            <button
              className='flex items-center justify-center w-full py-4 bg-gray-50 hover:bg-gray-100 border-t border-gray-200 text-gray-700 font-medium transition-colors cursor-pointer group'
              onClick={handleAdd}
            >
              <PlusCircle size={18} className='mr-2 text-gray-600 group-hover:text-gray-900 transition-colors' />
              <span>Tạo task mới</span>
            </button>
          )}
        </div>
      </DragDropContext>

      <OverlayCenterModal
        formable={true}
        isOpen={addModalOpen}
        onClose={closeAddModal}
        setModalOpen={setAddModalOpen}
        setModalContent={setAddModalContent}
        onSubmit={() => handleAdd()}
        title='Tạo công việc mới'
        width='50%'
        height='90%'
      >
        {addModalContent}
      </OverlayCenterModal>
      <OverlayCenterModal
        formable={true}
        isOpen={addSprintModalOpen}
        onClose={closeAddSprintModal}
        setModalOpen={setAddSprintModalOpen}
        setModalContent={setAddSprintModalContent}
        onSubmit={() => handleAddSprint()}
        title='Tạo sprint mới'
        width='40%'
        height='90%'
      >
        {addSprintModalContent}
      </OverlayCenterModal>

      <OverlayCenterModal
        formable={true}
        isOpen={editSprintModalOpen}
        onClose={closeEditSprintModal}
        setModalOpen={setEditSprintModalOpen}
        setModalContent={setEditSprintModalContent}
        onSubmit={() => {}}
        title='Edit sprint'
        width='40%'
        height='90%'
      >
        {editSprintModalContent}
      </OverlayCenterModal>

      <OverlayCenterModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        setModalOpen={setDeleteModalOpen}
        setModalContent={setDeleteModalContent}
        onSubmit={handleDeleteConfirm}
        title='Xác nhận'
        formable={false}
      >
        {deleteModalContent}
      </OverlayCenterModal>

      {/* Task Detail Modal */}
      {(selectedTask || taskIdFromQuery) && (
        <TaskDetailModal
          isOpen={true}
          onClose={() => {
            setSelectedTask(null)
            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.delete('task')
            const newQueryString = newSearchParams.toString()
            navigate(newQueryString ? `backlog?${newQueryString}` : 'backlog', { replace: true })
          }}
          onUpdate={handleTaskUpdate}
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
    </div>
  )
}
