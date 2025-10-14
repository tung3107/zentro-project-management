import React, { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, MoreHorizontal, PlusCircle } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Menu } from 'primereact/menu'
import Avatar from '../../../components/Avatar'
import OverlayCenterModal from '../../../components/OverlayCenterModal'
import AddTaskCom from './AddTaskCom'
import { useParams } from 'react-router-dom'
import type { Sprint } from '../../../types/sprint'
import type { Task } from '../../../types/task'
import { getBacklog, searchBacklog, updateTaskAPI } from '../service/task.service'
import TaskCard from './TaskCard'
import AddSprintCom from './AddSprintCom'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../auth/hooks/useAuth'
import { deleteSprintAPI } from '../service/sprint.service'
import EditSprintCom from './EditSprintCom'

interface BacklogType {
  backlog: { tasks: Task[] }
  sprints: Sprint[]
}

export default function BacklogPage({ searchQuery }: { searchQuery: string }) {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({ backlog: true })
  const menuRef = useRef<any>(null)
  const { projectId } = useParams()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalContent, setAddModalContent] = useState<ReactNode | null>(null)

  const [addSprintModalOpen, setAddSprintModalOpen] = useState(false)
  const [addSprintModalContent, setAddSprintModalContent] = useState<ReactNode | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteModalContent, setDeleteModalContent] = useState<React.ReactNode | null>(null)

  const [editSprintModalOpen, setEditSprintModalOpen] = useState(false)
  const [editSprintModalContent, setEditSprintModalContent] = useState<ReactNode | null>(null)

  const [reloadKey, setReloadKey] = useState(0)
  const [selectedSprint, setSelectedSprint] = useState<number | null>(0)

  const [data, setData] = useState<BacklogType>({
    backlog: { tasks: [] },
    sprints: []
  })
  const [loading, setLoading] = useState(true)

  const handleSearch = async (projectId: string | undefined, query: string) => {
    const data = await searchBacklog(projectId, query)

    setData(data.data)
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch(projectId, searchQuery)
    }, 400)
    return () => clearTimeout(delay)
  }, [projectId, searchQuery])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await getBacklog(projectId)
        setData(res.data)
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
    const { source, destination } = result
    if (!destination) return

    // Không thay đổi vị trí thì bỏ qua
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // 🧠 Lấy danh sách gốc & đích
    const sourceList =
      source.droppableId === 'backlog'
        ? [...data.backlog.tasks]
        : [...(data.sprints.find((s) => s.sprint_id === Number(source.droppableId))?.tasks || [])]

    const destList =
      destination.droppableId === 'backlog'
        ? [...data.backlog.tasks]
        : [...(data.sprints.find((s) => s.sprint_id === Number(destination.droppableId))?.tasks || [])]

    // 🧱 Lấy task bị kéo ra
    const [moved] = sourceList.splice(source.index, 1)

    // ✅ Cập nhật sprint_id tạm thời cho task
    moved.sprint_id = destination.droppableId === 'backlog' ? null : Number(destination.droppableId)

    // 🧩 Thêm vào list mới
    destList.splice(destination.index, 0, moved)

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
        if (sprint.sprint_id === Number(source.droppableId)) {
          return { ...sprint, tasks: sourceList }
        }
        if (sprint.sprint_id === Number(destination.droppableId)) {
          return { ...sprint, tasks: destList }
        }
        return sprint
      })
    }))

    try {
      await updateTaskAPI(moved)
      toast.success('Đã cập nhật vị trí task', { duration: 2000 })
    } catch (err) {
      console.error('Update task failed:', err)
      toast.error('Lỗi khi cập nhật task 😢')

      setReloadKey((prev) => prev + 1)
    }
  }

  const completeSprint = (sprint_id: number) => alert(`✅ Sprint ${sprint_id} completed!`)

  // 🎨 Skeleton component
  const SkeletonItem = () => (
    <div className='animate-pulse flex justify-between items-center px-5 py-3 border-b border-gray-200 bg-gray-100'>
      <div className='w-1/3 h-3 bg-gray-300 rounded'></div>
      <div className='w-16 h-3 bg-gray-300 rounded'></div>
    </div>
  )

  if (loading) {
    return (
      <div className='flex flex-col gap-4 p-6 bg-gray-50 min-h-screen'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <div className='px-5 py-3 bg-gray-100 border-b border-gray-300 font-semibold text-gray-700'>
            Đang tải backlog...
          </div>
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col col-span-5 gap-6 p-6 bg-gray-50 min-h-screen' key={reloadKey}>
      <DragDropContext onDragEnd={onDragEnd}>
        {/* 🏃‍♂️ SPRINTS */}
        {data.sprints.map((sprint) => {
          const items = [
            { label: 'Edit Sprint', icon: 'pi pi-pencil', command: () => handleEdit(sprint) },
            { label: 'Delete Sprint', icon: 'pi pi-trash', command: () => handleDelete(sprint) }
          ]

          return (
            <div
              key={sprint.sprint_id}
              className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
            >
              <div className='flex justify-between items-center px-5 py-3 bg-gray-100 border-b border-gray-300'>
                <div
                  className='flex items-center gap-2 font-semibold text-gray-700 cursor-pointer'
                  onClick={() => setExpanded((prev) => ({ ...prev, [sprint.sprint_id]: !prev[sprint.sprint_id] }))}
                >
                  {expanded[sprint.sprint_id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  {sprint.name} ({sprint.tasks?.length || 0})
                </div>

                <div className='flex items-center gap-4'>
                  {sprint?.tasks?.length > 0 && sprint.status === 'active' && (
                    <button
                      className='rounded-sm border border-gray-300 px-3 cursor-pointer text-black font-medium hover:bg-gray-300 hover:border-gray-400'
                      onClick={() => completeSprint(sprint.sprint_id)}
                    >
                      Hoàn thành sprint
                    </button>
                  )}
                  {sprint?.tasks?.length > 0 && sprint.status === 'planned' && (
                    <button className='rounded-sm border border-gray-300 px-3 cursor-pointer text-black font-medium hover:bg-gray-300 hover:border-gray-400'>
                      Bắt đầu sprint
                    </button>
                  )}
                  <Menu model={items} popup ref={menuRef} />
                  <button className='cursor-pointer text-black' onClick={(e) => menuRef.current.toggle(e)}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

              {expanded[sprint.sprint_id] && (
                <Droppable droppableId={String(sprint.sprint_id)}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className='max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
                    >
                      {sprint.tasks?.length === 0 ? (
                        <div className='text-center text-gray-500 py-10 font-medium'>
                          Chưa có task nào trong sprint này 🪄
                        </div>
                      ) : (
                        sprint.tasks?.map((task, index) => (
                          <Draggable key={task.task_id} draggableId={task.task_id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex justify-between items-center px-5 py-3 border-b border-gray-300 text-sm bg-white transition-all duration-200 ${
                                  snapshot.isDragging ? 'bg-blue-50 shadow-md scale-[1.02]' : ''
                                }`}
                              >
                                <TaskCard task={task} isDragging={snapshot.isDragging} />
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
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <div className='w-full flex justify-between items-center px-5 py-3 bg-gray-100 border-b border-gray-300 cursor-pointer'>
            <div className='w-full flex flex-row justify-between items-between gap-2 font-semibold text-gray-700'>
              <div
                className='flex justify-between items-center gap-2'
                onClick={() => setExpanded((prev) => ({ ...prev, backlog: !prev.backlog }))}
              >
                {expanded.backlog ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                Backlog ({data.backlog?.tasks?.length || 0})
              </div>
              <div className='flex justify-between items-center gap-2'>
                <button
                  className='rounded-sm border border-gray-300 px-3 cursor-pointer text-black font-medium hover:bg-gray-300 hover:border-gray-400'
                  onClick={handleAddSprint}
                >
                  Tạo sprint mới
                </button>
              </div>
            </div>
          </div>

          {expanded.backlog && (
            <Droppable droppableId='backlog'>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className='max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
                >
                  {data.backlog.tasks.length === 0 ? (
                    <div className='text-center text-gray-500 py-10 font-medium'>
                      Không có task nào trong backlog 🎈
                    </div>
                  ) : (
                    data.backlog.tasks.map((task, index) => (
                      <Draggable key={task.task_id} draggableId={task.task_id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex justify-between items-center px-5 py-3 border-b border-gray-300 text-sm bg-white transition-all duration-200 ${
                              snapshot.isDragging ? 'bg-blue-50 shadow-lg scale-[1.02]' : ''
                            }`}
                          >
                            <TaskCard task={task} isDragging={snapshot.isDragging} />
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

          <button
            className='flex items-center justify-center w-full py-3 bg-gray-50 hover:bg-gray-100 border-t border-[#f0f0f0] text-gray-700 font-medium transition cursor-pointer'
            onClick={handleAdd}
          >
            <PlusCircle size={16} className='mr-2' /> Create Task
          </button>
        </div>
      </DragDropContext>

      <OverlayCenterModal
        formable={true}
        isOpen={addModalOpen}
        onClose={closeAddModal}
        setModalOpen={setAddModalOpen}
        setModalContent={setAddModalContent}
        onSubmit={handleAdd}
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
        onSubmit={handleAddSprint}
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
        onSubmit={handleEdit}
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
    </div>
  )
}
