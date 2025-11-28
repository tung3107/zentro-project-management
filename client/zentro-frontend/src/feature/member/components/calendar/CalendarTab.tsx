import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, X, Bot } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import CalendarView from './CalendarView'
import { Skeleton } from 'primereact/skeleton'
import type { Task } from '../../../../types/task'
import type { User } from '../../../../types/user'
import type { Sprint } from '../../../../types/sprint'
import api from '../../../../util/axiosClient'
import { getTasksByMonth } from '../../service/task.service'
import { getAllSprintsAPI } from '../../service/sprint.service'
import TaskDetailModal from '../task/TaskDetailModal'
import AIChatPanel from '../ai/AIChatPanel'

export default function CalendarTab() {
  const { projectId } = useParams<{ projectId: string }>()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>(undefined)
  const [members, setMembers] = useState<User[]>([])
  const [statuses, setStatuses] = useState<any[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [showAIChat, setShowAIChat] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const taskIdFromQuery = searchParams.get('task')
  const navigate = useNavigate()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  useEffect(() => {
    if (projectId) {
      loadMembers()
      loadStatuses()
      loadSprints()
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      loadTasks()
      loadSprints()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, year, month, selectedAssignee])

  const loadMembers = async () => {
    try {
      const res = await api.get(`/members/dropdown/${projectId}`)
      setMembers(res.data.data || [])
    } catch (err) {
      console.error('Failed to load members:', err)
    }
  }

  const loadStatuses = async () => {
    try {
      const res = await api.get(`/status/project/${projectId}`)
      setStatuses(res.data.data || [])
    } catch (err) {
      console.error('Failed to load statuses:', err)
    }
  }

  const loadSprints = async () => {
    try {
      const res = await getAllSprintsAPI(projectId!)
      setSprints(res.data || [])
    } catch (err) {
      console.error('Failed to load sprints:', err)
      setSprints([])
    }
  }

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const res = await getTasksByMonth(projectId!, year, month, selectedAssignee)
      setTasks(res.data || [])
    } catch (err) {
      console.error('Failed to load tasks:', err)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleTaskUpdate = () => {
    loadTasks()
  }

  const monthName = currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })

  return (
    <div className='flex flex-col h-full' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          {/* Month navigation */}
          <div className='flex items-center gap-2'>
            <button
              onClick={handlePrevMonth}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              title='Tháng trước'
            >
              <ChevronLeft size={20} className='text-gray-700' />
            </button>
            <button
              onClick={handleToday}
              className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
            >
              Hôm nay
            </button>
            <button
              onClick={handleNextMonth}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              title='Tháng sau'
            >
              <ChevronRight size={20} className='text-gray-700' />
            </button>
          </div>

          {/* Current month/year */}
          <h2 className='text-xl font-bold text-gray-900 capitalize'>{monthName}</h2>
        </div>

        {/* Right side: AI button + Filter */}
        <div className='flex items-center gap-3'>
          {/* AI Assistant Button */}
          <button
            onClick={() => setShowAIChat(true)}
            className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg'
          >
            <Bot size={18} />
            AI Assistant
          </button>

          {/* Filter */}
          <div className='relative'>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                selectedAssignee
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Filter size={18} />
              Lọc theo người thực hiện
              {selectedAssignee && <span className='px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full'>1</span>}
            </button>

            {/* Filter dropdown */}
            {showFilterMenu && (
              <div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50'>
                <div className='p-3 border-b border-gray-200 flex items-center justify-between'>
                  <span className='text-sm font-semibold text-gray-900'>Người thực hiện</span>
                  <button onClick={() => setShowFilterMenu(false)} className='p-1 hover:bg-gray-100 rounded'>
                    <X size={16} className='text-gray-600' />
                  </button>
                </div>
                <div className='p-2 max-h-64 overflow-y-auto'>
                  <button
                    onClick={() => {
                      setSelectedAssignee(undefined)
                      setShowFilterMenu(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      !selectedAssignee ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Tất cả
                  </button>
                  {members.map((member) => {
                    const isSelected = selectedAssignee === member.id
                    const memberName = `${member.name}`

                    return (
                      <button
                        key={member.id}
                        onClick={() => {
                          setSelectedAssignee(member.id)
                          setShowFilterMenu(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {memberName}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className='flex-1 p-6 overflow-auto bg-gray-50'>
        {isLoading ? (
          <div className='h-full bg-white rounded-xl border border-gray-200 p-4'>
            <div className='grid grid-cols-7 gap-2'>
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} height='120px' />
              ))}
            </div>
          </div>
        ) : (
          <CalendarView tasks={tasks} sprints={sprints} currentDate={currentDate} onTaskClick={setSelectedTask} />
        )}
      </div>

      {/* Task Detail Modal */}
      {(selectedTask || taskIdFromQuery) && (
        <TaskDetailModal
          isOpen={true}
          onClose={() => {
            setSelectedTask(null)
            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.delete('task')
            const newQueryString = newSearchParams.toString()
            navigate(newQueryString ? `calendar?${newQueryString}` : 'calendar', { replace: true })
          }}
          onUpdate={handleTaskUpdate}
          members={members}
        />
      )}

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
    </div>
  )
}
