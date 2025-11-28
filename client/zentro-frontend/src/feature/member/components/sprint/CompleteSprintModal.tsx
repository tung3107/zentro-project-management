import React, { useState, useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import type { Sprint } from '../../../../types/sprint'
import type { Task } from '../../../../types/task'
import { type } from '../../../../types/type'
import Avatar from '../../../../components/Avatar'
import { checkCompleteSprintAPI } from '../../service/sprint.service'

interface CompleteSprintModalProps {
  isOpen: boolean
  onClose: () => void
  sprint: Sprint
  onConfirm: (incompleteTasks: { taskId: string; action: 'backlog' | 'nextSprint' }[]) => void
  availableSprints: Sprint[]
  completedStatuses: number[]
}

export default function CompleteSprintModal({
  isOpen,
  onClose,
  sprint,
  onConfirm,
  availableSprints,
  completedStatuses
}: CompleteSprintModalProps) {
  const [showIncompleteTasks, setShowIncompleteTasks] = useState(true)
  const [showCompletedTasks, setShowCompletedTasks] = useState(false)
  const [selectedAction, setSelectedAction] = useState<'backlog' | 'nextSprint'>('backlog')
  const [selectedNextSprint, setSelectedNextSprint] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([])

  useEffect(() => {
    async function fetchCompletedTasks() {
      const response = await checkCompleteSprintAPI(sprint.sprint_id)

      setCompletedTasks(response.data.completedTasks)
      setIncompleteTasks(response.data.incompleteTasks)
    }

    fetchCompletedTasks()
  }, [sprint.sprint_id])

  useEffect(() => {
    // Auto-select first available sprint if exists
    if (availableSprints.length > 0 && !selectedNextSprint) {
      setSelectedNextSprint(availableSprints[0].sprint_id)
    }
  }, [availableSprints, selectedNextSprint])

  const handleConfirm = () => {
    setIsSubmitting(true)
    const taskActions = incompleteTasks.map((task) => ({
      taskId: task.task_id.toString(),
      action: selectedAction,
      targetSprintId: selectedAction === 'nextSprint' ? selectedNextSprint : null
    }))
    onConfirm(taskActions as any)
  }

  const getTaskTypeIcon = (taskType: string) => {
    const taskTypeInfo = type.find((t) => t.value === taskType)
    return taskTypeInfo?.icon
  }

  if (!isOpen) return null

  const renderTask = (task: Task, isSubtask = false) => {
    return (
      <div key={task.task_id} className='flex flex-col w-full'>
        {/* Task cha */}
        <div className='flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg'>
          {getTaskTypeIcon(task.type)}
          <span className='text-sm text-gray-800 flex-1 truncate'>
            <span className='font-mono text-xs text-gray-500 mr-1'>{task.task_id}</span>
            {task.title}
          </span>
          {task.assignee && (
            <Avatar
              avatarUrl={(task.assignee as any).avatar}
              name={
                (task.assignee as any).first_name ||
                (task.assignee as any).last_name ||
                task.assignee.assignee_name ||
                'Unknown'
              }
              size={20}
            />
          )}
        </div>

        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className='flex flex-col w-full mt-1 ml-6 space-y-1'>
            {task.subtasks.map((sub) => (
              <div
                key={sub.task_id}
                className='flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg'
              >
                {getTaskTypeIcon(sub.type)}
                <span className='text-sm text-gray-800 flex-1 truncate'>
                  <span className='mr-1'>└─ </span>
                  <span className='font-mono text-xs text-gray-500 mr-1'>{sub.task_id}</span>
                  {sub.title}
                </span>
                {sub.assignee && (
                  <Avatar
                    avatarUrl={(sub.assignee as any).avatar}
                    name={
                      (sub.assignee as any).first_name ||
                      (sub.assignee as any).last_name ||
                      sub.assignee.assignee_name ||
                      'Unknown'
                    }
                    size={20}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className='bg-white rounded-xl shadow-2xl w-[700px] max-h-[85vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50'>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>Hoàn thành sprint</h2>
            <p className='text-sm text-gray-600 mt-0.5'>{sprint.name}</p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900'
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto px-6 py-4'>
          {/* Sprint Summary */}
          <div className='mb-6'>
            <div className='flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <CheckCircle2 size={24} className='text-blue-600 flex-shrink-0' />
              <div>
                <p className='text-sm font-semibold text-gray-900'>{completedTasks.length} task đã hoàn thành</p>
                <p className='text-xs text-gray-600 mt-0.5'>{incompleteTasks.length} task chưa hoàn thành</p>
              </div>
            </div>
          </div>

          {/* Incomplete Tasks Section */}
          {incompleteTasks.length > 0 && (
            <div className='mb-6'>
              <button
                onClick={() => setShowIncompleteTasks(!showIncompleteTasks)}
                className='flex items-center gap-2 w-full text-left mb-3 group'
              >
                {showIncompleteTasks ? (
                  <ChevronDown size={18} className='text-gray-600 group-hover:text-gray-900' />
                ) : (
                  <ChevronRight size={18} className='text-gray-600 group-hover:text-gray-900' />
                )}
                <AlertCircle size={18} className='text-orange-600' />
                <span className='font-semibold text-gray-900'>Task chưa hoàn thành ({incompleteTasks.length})</span>
              </button>

              {showIncompleteTasks && (
                <>
                  <div className='space-y-2 mb-4 max-h-[200px] overflow-y-auto'>
                    {incompleteTasks.map((task) => renderTask(task))}
                  </div>

                  {/* Action Selection */}
                  <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                    <p className='text-sm font-semibold text-gray-900 mb-3'>Bạn muốn di chuyển các task này đến đâu?</p>

                    <div className='space-y-2'>
                      <label className='flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-white transition-colors'>
                        <input
                          type='radio'
                          name='action'
                          value='backlog'
                          checked={selectedAction === 'backlog'}
                          onChange={() => setSelectedAction('backlog')}
                          className='mt-0.5'
                        />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>Di chuyển về Backlog</p>
                          <p className='text-xs text-gray-600 mt-0.5'>
                            Tất cả task chưa hoàn thành sẽ được chuyển về backlog
                          </p>
                        </div>
                      </label>

                      <label className='flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-white transition-colors'>
                        <input
                          type='radio'
                          name='action'
                          value='nextSprint'
                          checked={selectedAction === 'nextSprint'}
                          onChange={() => setSelectedAction('nextSprint')}
                          className='mt-0.5'
                          disabled={availableSprints.length === 0}
                        />
                        <div className='flex-1'>
                          <p className='text-sm font-medium text-gray-900'>
                            Di chuyển sang sprint khác
                            {availableSprints.length === 0 && (
                              <span className='text-xs text-red-600 ml-2'>(Không có sprint khả dụng)</span>
                            )}
                          </p>
                          <p className='text-xs text-gray-600 mt-0.5 mb-2'>
                            Chọn sprint để chuyển các task chưa hoàn thành
                          </p>

                          {selectedAction === 'nextSprint' && availableSprints.length > 0 && (
                            <select
                              value={selectedNextSprint || ''}
                              onChange={(e) => setSelectedNextSprint(Number(e.target.value))}
                              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            >
                              {availableSprints.map((s) => (
                                <option key={s.sprint_id} value={s.sprint_id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <div className='mb-4'>
              <button
                onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                className='flex items-center gap-2 w-full text-left mb-3 group'
              >
                {showCompletedTasks ? (
                  <ChevronDown size={18} className='text-gray-600 group-hover:text-gray-900' />
                ) : (
                  <ChevronRight size={18} className='text-gray-600 group-hover:text-gray-900' />
                )}
                <CheckCircle2 size={18} className='text-green-600' />
                <span className='font-semibold text-gray-900'>Task đã hoàn thành ({completedTasks.length})</span>
              </button>

              {showCompletedTasks && (
                <div className='space-y-2 max-h-[200px] overflow-y-auto'>
                  {completedTasks.map((task) => (
                    <div
                      key={task.task_id}
                      className='flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg'
                    >
                      {getTaskTypeIcon(task.type)}
                      <span className='text-sm text-gray-800 flex-1 truncate'>{task.title}</span>
                      {task.assignee && (
                        <Avatar
                          avatarUrl={(task.assignee as any).avatar}
                          name={
                            (task.assignee as any).first_name ||
                            (task.assignee as any).last_name ||
                            task.assignee.assignee_name ||
                            'Unknown'
                          }
                          size={20}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Warning if no tasks */}
          {sprint.tasks?.length === 0 && (
            <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center'>
              <p className='text-sm text-gray-700'>Sprint này không có task nào.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || (selectedAction === 'nextSprint' && !selectedNextSprint)}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          >
            {isSubmitting ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Hoàn thành sprint
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
