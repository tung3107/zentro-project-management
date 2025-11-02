import type { Task } from '../../../../types/task'
import type { Sprint } from '../../../../types/sprint'
import { useNavigate } from 'react-router-dom'

interface CalendarViewProps {
  tasks: Task[]
  sprints: Sprint[]
  currentDate: Date
  onTaskClick: (task: Task) => void
}

export default function CalendarView({ tasks, sprints, currentDate, onTaskClick }: CalendarViewProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const navigate = useNavigate()

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Build calendar grid
  const calendarDays: Array<{ date: number; isCurrentMonth: boolean; fullDate: Date }> = []

  // Previous month days
  const prevMonthStart = daysInPrevMonth - firstDay + 1
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push({
      date: prevMonthStart + i,
      isCurrentMonth: false,
      fullDate: new Date(year, month - 1, prevMonthStart + i)
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: i,
      isCurrentMonth: true,
      fullDate: new Date(year, month, i)
    })
  }

  // Next month days to fill the grid (42 cells = 6 weeks)
  const remainingCells = 42 - calendarDays.length
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      date: i,
      isCurrentMonth: false,
      fullDate: new Date(year, month + 1, i)
    })
  }

  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {}
  tasks.forEach((task) => {
    const dueDate = task.due_date ? new Date(task.due_date) : null
    if (dueDate) {
      const dateKey = `${dueDate.getFullYear()}-${dueDate.getMonth() + 1}-${dueDate.getDate()}`
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = []
      }
      tasksByDate[dateKey].push(task)
    }
  })

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getTasksForDay = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    return tasksByDate[dateKey] || []
  }

  // Get sprints that overlap with this date
  const getSprintsForDay = (date: Date) => {
    return sprints.filter((sprint) => {
      const startDate = new Date(sprint.start_date)
      const endDate = new Date(sprint.end_date)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      date.setHours(0, 0, 0, 0)
      return date >= startDate && date <= endDate
    })
  }

  // Sprint status colors (like Jira)
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

  const priorityColors = ['#95a5a6', '#3498db', '#d23232', '#f37121', '#cb0404']

  return (
    <div className='flex-1 bg-white rounded-xl border border-gray-200 overflow-visible'>
      {/* Sprint Legend */}
      <div className='flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200'>
        <span className='text-xs font-semibold text-gray-700'>Sprint:</span>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <div className='w-4 h-2 rounded' style={{ backgroundColor: '#0052CC' }}></div>
            <span className='text-xs text-gray-600'>Active</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-4 h-2 rounded' style={{ backgroundColor: '#6B778C' }}></div>
            <span className='text-xs text-gray-600'>Completed</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-4 h-2 rounded' style={{ backgroundColor: '#FFAB00' }}></div>
            <span className='text-xs text-gray-600'>Planned</span>
          </div>
        </div>
      </div>

      {/* Week day headers */}
      <div className='grid grid-cols-7 bg-gray-50 border-b border-gray-200'>
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
          <div key={day} className='px-2 py-3 text-center text-sm font-semibold text-gray-700'>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className='grid grid-cols-7' style={{ gridAutoRows: 'minmax(120px, 1fr)' }}>
        {calendarDays.map((day, idx) => {
          const dayTasks = getTasksForDay(day.fullDate)
          const daySprints = getSprintsForDay(day.fullDate)
          const isTodayDate = isToday(day.fullDate)

          return (
            <div
              key={idx}
              className={`border-b border-r border-gray-200 p-2 overflow-hidden ${
                !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              {/* Date number */}
              <div className='flex items-center justify-between mb-1'>
                <span
                  className={`text-sm font-medium ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${
                    isTodayDate ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                  }`}
                >
                  {day.date}
                </span>
                {dayTasks.length > 3 && (
                  <span className='text-xs text-gray-500 font-medium'>+{dayTasks.length - 3}</span>
                )}
              </div>

              {/* Sprint bars */}
              {daySprints.length > 0 && (
                <div className='mb-1.5 space-y-0.5'>
                  {daySprints.slice(0, 2).map((sprint) => {
                    const sprintColor = getSprintColor(sprint.status)
                    const sprintStart = new Date(sprint.start_date)
                    const sprintEnd = new Date(sprint.end_date)
                    const dayDate = new Date(day.fullDate)

                    sprintStart.setHours(0, 0, 0, 0)
                    sprintEnd.setHours(23, 59, 59, 999)
                    dayDate.setHours(0, 0, 0, 0)

                    const isStartDay = dayDate.toDateString() === sprintStart.toDateString()
                    const isEndDay = dayDate.toDateString() === sprintEnd.toDateString()
                    const sprintName = sprint.name || `Sprint ${sprint.sprint_id}`
                    const sprintDateRange = `${sprintStart.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })} - ${sprintEnd.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}`
                    const tooltipText = `${sprintName}\n${sprintDateRange}\nStatus: ${sprint.status}`

                    return (
                      <div key={sprint.sprint_id} className='group relative w-full' title={tooltipText}>
                        <div
                          className='w-full rounded flex items-center overflow-hidden cursor-pointer transition-opacity hover:opacity-80'
                          style={{ backgroundColor: sprintColor + '15', minHeight: '20px' }}
                        >
                          {/* Sprint bar with color */}
                          <div
                            className='h-full flex-shrink-0 relative'
                            style={{
                              backgroundColor: sprintColor,
                              width: '100%',
                              minHeight: '20px',
                              borderRadius:
                                isStartDay && isEndDay
                                  ? '0.125rem'
                                  : isStartDay
                                    ? '0.125rem 0 0 0.125rem'
                                    : isEndDay
                                      ? '0 0.125rem 0.125rem 0'
                                      : '0'
                            }}
                          >
                            {/* Sprint name overlay - show name on sprint bar */}
                            <div className='absolute inset-0 flex items-center px-1.5 z-10 pointer-events-none'>
                              <span
                                className='text-[10px] font-semibold truncate w-full text-center'
                                style={{
                                  color: '#fff',
                                  textShadow: '0 1px 3px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.8)'
                                }}
                                title={sprintName}
                              >
                                {sprintName}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Custom Tooltip */}
                        <div className='absolute hidden group-hover:block top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none z-[9999] w-max max-w-[200px]'>
                          <div className='bg-gray-900 text-white text-xs rounded-lg shadow-lg px-3 py-2 whitespace-pre-line text-center'>
                            <div className='font-semibold mb-0.5'>{sprintName}</div>
                            <div className='text-gray-300 text-[10px]'>{sprintDateRange}</div>
                            <div className='text-gray-400 text-[10px] mt-0.5 capitalize'>{sprint.status}</div>
                            {/* Tooltip arrow */}
                            <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900'></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {daySprints.length > 2 && (
                    <div className='text-[10px] text-gray-500'>
                      +{daySprints.length - 2} sprint{daySprints.length > 3 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}

              {/* Tasks for this day (max 3 visible) */}
              <div className='space-y-1'>
                {dayTasks.slice(0, 3).map((task) => {
                  const priorityColor = priorityColors[task.priority || 0]

                  return (
                    <button
                      key={task.task_id}
                      onClick={() => {
                        onTaskClick(task)
                        navigate(`calendar?task=${task.task_id}`)
                      }}
                      className='w-full text-left px-2 py-1 rounded text-xs hover:shadow-md transition-shadow border-l-2 bg-gray-50 hover:bg-gray-100'
                      style={{ borderLeftColor: priorityColor }}
                    >
                      <div className='flex items-center gap-1'>
                        <span className='font-medium text-gray-900 truncate'>{task.title}</span>
                      </div>
                      {task.assignee && (
                        <div className='text-gray-600 text-[10px] mt-0.5 truncate'>
                          {(task.assignee as any).first_name && (task.assignee as any).last_name
                            ? `${(task.assignee as any).first_name} ${(task.assignee as any).last_name}`
                            : task.assignee.assignee_name || 'Unknown'}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
