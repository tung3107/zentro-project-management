import { useEffect, useState, useMemo } from 'react'
import { Skeleton } from 'primereact/skeleton'
import { getActivityForTask } from '../../service/task.service'
import Avatar from '../../../../components/Avatar'
import { type as taskTypes } from '../../../../types/type'
import type { User } from '../../../../types/user'
import { Link } from 'react-router-dom'

interface ResolvedValue {
  status?: { id: number; name: string; color: string }
  sprint?: { id: number; name: string }
  assignee?: { id: string; name: string; avatar?: string }
  reporter?: { id: string; name: string; avatar?: string }
  [key: string]: any
}

interface ActivityLog {
  log_id: number
  project_id: string
  user_id: string
  entity_type: string
  entity_id: string
  action_type: 'create' | 'update' | 'delete' | 'assign' | 'change_status' | 'complete' | 'start' | 'finish'
  old_value: any
  new_value: any
  old_value_resolved: ResolvedValue
  new_value_resolved: ResolvedValue
  message_template: string
  created_at: string
  user: User
}

interface TaskActivityLogProps {
  projectId: string
  taskId: string
}

export default function TaskActivityLog({ projectId, taskId }: TaskActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const res = await getActivityForTask(projectId, taskId)
        setActivities(res?.data || [])
      } catch (err) {
        console.error('Error fetching activities:', err)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    if (projectId && taskId) {
      fetchActivities()
    }
  }, [projectId, taskId])

  // Group activities by date (using local timezone)
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityLog[]> = {}

    activities.forEach((activity) => {
      const date = new Date(activity.created_at)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(activity)
    })

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [activities])

  const getFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      status_id: 'trạng thái',
      assignee_id: 'người phụ trách',
      reporter_id: 'người báo cáo',
      sprint_id: 'sprint',
      priority: 'mức độ ưu tiên',
      title: 'tiêu đề',
      description: 'mô tả',
      due_date: 'hạn chót',
      start_date: 'ngày bắt đầu',
      type: 'loại công việc',
      estimate: 'thời gian ước lượng',
      spent_time: 'thời gian đã dùng'
    }
    return fieldNames[field] || field
  }

  // Get priority label
  const getPriorityLabel = (priority: number): string => {
    const labels: Record<number, string> = {
      0: 'Thấp',
      1: 'Trung bình',
      2: 'Cao',
      3: 'Cần gấp'
    }
    return labels[priority] || 'Không xác định'
  }

  // Get task type label
  const getTaskTypeLabel = (type: string): string => {
    const taskType = taskTypes.find((t) => t.value === type)
    return taskType ? taskType.label : type
  }

  // Render changed fields for update action
  const renderChangedFields = (log: ActivityLog) => {
    const oldVal = log.old_value_resolved || {}
    const newVal = log.new_value_resolved || {}

    // Ensure values are objects, not strings
    if (typeof oldVal !== 'object' || typeof newVal !== 'object') {
      return []
    }

    // Get all changed fields (exclude resolved helper fields)
    const changedFields = Object.keys(newVal).filter(
      (key) => !['status', 'sprint', 'assignee', 'reporter'].includes(key) && oldVal[key] !== undefined
    )

    if (changedFields.length === 0) return []

    return changedFields.map((field) => {
      let oldDisplay = oldVal[field]
      let newDisplay = newVal[field]
      let fieldName = getFieldName(field)

      // Special handling for different field types
      if (field === 'status_id') {
        oldDisplay = oldVal.status?.name || 'N/A'
        newDisplay = newVal.status?.name || 'N/A'
      } else if (field === 'assignee_id') {
        oldDisplay = oldVal.assignee?.name || 'Chưa gán'
        newDisplay = newVal.assignee?.name || 'Chưa gán'
      } else if (field === 'reporter_id') {
        oldDisplay = oldVal.reporter?.name || 'N/A'
        newDisplay = newVal.reporter?.name || 'N/A'
      } else if (field === 'sprint_id') {
        oldDisplay = oldVal.sprint?.name || 'Backlog'
        newDisplay = newVal.sprint?.name || 'Backlog'
      } else if (field === 'priority') {
        oldDisplay = getPriorityLabel(oldVal[field])
        newDisplay = getPriorityLabel(newVal[field])
      } else if (field === 'type') {
        oldDisplay = getTaskTypeLabel(oldVal[field])
        newDisplay = getTaskTypeLabel(newVal[field])
      } else if (field === 'due_date' || field === 'start_date') {
        oldDisplay = oldVal[field] ? new Date(oldVal[field]).toLocaleDateString('vi-VN') : 'N/A'
        newDisplay = newVal[field] ? new Date(newVal[field]).toLocaleDateString('vi-VN') : 'N/A'
      }

      return {
        field,
        fieldName,
        oldDisplay: oldDisplay?.toString(),
        newDisplay: newDisplay?.toString()
      }
    })
  }

  // Render activity log item based on action type
  const renderActivityContent = (log: ActivityLog) => {
    switch (log.action_type) {
      case 'create':
        return (
          <span className='text-sm text-gray-800'>
            <span className='text-gray-700'>đã tạo công việc này</span>
          </span>
        )

      case 'update': {
        const changes = renderChangedFields(log)

        if (!changes || changes.length === 0) {
          return (
            <span className='text-sm text-gray-800'>
              <span className='text-gray-700'>đã cập nhật công việc</span>
            </span>
          )
        }

        // Render each change as a separate line
        return (
          <div className='flex flex-col gap-1'>
            {changes.map((change, index) => (
              <div key={index} className='flex flex-wrap items-center gap-1 text-sm text-gray-800'>
                <span className='text-gray-700'>đã thay đổi</span>
                <span className='font-medium text-gray-900'>{change.fieldName}</span>
                <span className='text-gray-700'>từ</span>
                <span className='px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium'>
                  {change.oldDisplay}
                </span>
                <span className='text-gray-700'>sang</span>
                <span className='px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium'>
                  {change.newDisplay}
                </span>
              </div>
            ))}
          </div>
        )
      }

      case 'assign':
        return (
          <span className='text-sm text-gray-800'>
            <span className='text-gray-700'>đã gán công việc</span>
          </span>
        )

      case 'change_status':
        return (
          <span className='text-sm text-gray-800'>
            <span className='text-gray-700'>đã thay đổi trạng thái</span>
          </span>
        )

      default:
        return <span className='text-sm text-gray-700'>đã thực hiện một thay đổi</span>
    }
  }

  const formatDateHeader = (dateString: string) => {
    // dateString is in format YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format relative time (e.g., "9 days ago")
  const formatRelativeTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
        if (diffInMinutes === 0) return 'vừa xong'
        return `${diffInMinutes} phút trước`
      }
      return `${diffInHours} giờ trước`
    } else if (diffInDays === 1) {
      return 'hôm qua'
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `${weeks} tuần trước`
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return `${months} tháng trước`
    } else {
      const years = Math.floor(diffInDays / 365)
      return `${years} năm trước`
    }
  }

  return (
    <div className='w-full'>
      {loading ? (
        <div className='w-full space-y-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='flex items-start space-x-3 p-2'>
              <Skeleton shape='circle' size='2rem' />
              <div className='flex-1 space-y-2'>
                <Skeleton width='70%' height='0.9rem' />
                <Skeleton width='40%' height='0.7rem' />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className='flex flex-col items-center justify-center text-center py-8'>
          <img src='/Not Found.png' alt='No activity' className='w-[120px] h-[120px] object-contain opacity-90' />
          <h1 className='text-sm font-semibold text-gray-800 max-w-[280px] leading-relaxed mt-2'>
            Không có hoạt động gì.
          </h1>
        </div>
      ) : (
        <div className='w-full overflow-y-auto' style={{ maxHeight: '500px' }}>
          <div className='space-y-4 text-left'>
            {groupedActivities.map(([dateKey, dateActivities]) => (
              <div key={dateKey} className='space-y-2'>
                {/* Date Header */}
                <div className='sticky top-0 bg-white py-2 z-10'>
                  <h3 className='text-sm font-semibold text-gray-800'>{formatDateHeader(dateKey)}</h3>
                </div>

                {/* Activities for this date */}
                <div className='space-y-2 pl-1'>
                  {dateActivities.map((log) => (
                    <div
                      key={log.log_id}
                      className='flex items-start gap-2 py-1.5 hover:bg-gray-50 transition-colors rounded'
                    >
                      <div className='flex-shrink-0 mt-0.5'>
                        <Avatar
                          avatarUrl={log.user.avatar}
                          name={`${log.user.first_name} ${log.user.last_name}`}
                          size={28}
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex flex-col gap-0.5'>
                          <div className='flex items-center gap-1.5 flex-wrap'>
                            <Link
                              to={`/member/profile/${log.user.user_id}`}
                              className='text-sm font-semibold text-gray-800 hover:text-blue-600 hover:underline transition-colors cursor-pointer'
                            >
                              {log.user.first_name} {log.user.last_name}
                            </Link>
                          </div>
                          <div className='text-sm leading-relaxed text-gray-700'>{renderActivityContent(log)}</div>
                          <span className='text-xs text-gray-500 mt-0.5'>{formatRelativeTime(log.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
