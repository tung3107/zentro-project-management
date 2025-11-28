import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { AlertTriangle, Calendar, ChevronDown, ChevronRight } from 'lucide-react'
import type { Task } from '../../../../types/task'
import InlineEditableSummary from './InlineEditableSummary'
import InlineEditableStatus from './InlineEditableStatus'
import InlineEditableAssignee from './InlineEditableAssignee'
import SubtaskExpansion from './SubtaskExpansion'
import { priorityColors, type as taskTypes } from '../../../../types/type'
import { Skeleton } from 'primereact/skeleton'

interface TaskTableProps {
  tasks: Task[]
  projectId: string
  isLoading: boolean
  expandedRows: any
  onRowToggle: (e: any) => void
  selectedTasks: Task[]
  onSelectionChange: (tasks: Task[]) => void
  onTaskClick: (task: Task) => void
  onUpdate: (task: Task, field: keyof Task, value: any) => Promise<void>
}

export default function TaskTable({
  tasks,
  projectId,
  isLoading,
  expandedRows,
  onRowToggle,
  selectedTasks,
  onSelectionChange,
  onTaskClick,
  onUpdate
}: TaskTableProps) {
  const parentTasks = tasks.filter((t) => !t.parent_id)

  const dueDateBodyTemplate = (rowData: Task) => {
    if (!rowData.due_date) return <span className='text-sm text-gray-400'>—</span>
    const date = new Date(rowData.due_date)
    return (
      <div
        className={`flex items-center gap-1 px-2 py-[2px] rounded-md text-sm whitespace-nowrap ${
          new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
            ? 'border border-red-300 text-red-600 bg-red-50'
            : 'text-gray-700'
        }`}
      >
        {new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? (
          <AlertTriangle size={14} className='flex-shrink-0' />
        ) : (
          <Calendar size={14} className='text-gray-400 flex-shrink-0' />
        )}
        <span>{new Date(date).toLocaleDateString('vi-VN')}</span>
      </div>
    )
  }

  // Work column - combines type icon, ID, and name
  const workBodyTemplate = (rowData: Task) => {
    const taskType = taskTypes.find((t) => t.value === rowData.type)
    const hasSubtasks = rowData.subtasks && rowData.subtasks.length > 0
    const isExpanded = expandedRows[rowData.task_id?.toString() || '']

    return (
      <div className='flex items-center gap-2' onClick={(e) => e.stopPropagation()}>
        {/* Expand/collapse button */}
        {hasSubtasks ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              const key = rowData.task_id?.toString() || ''
              const newExpandedRows = { ...expandedRows }
              if (newExpandedRows[key]) {
                delete newExpandedRows[key]
              } else {
                newExpandedRows[key] = true
              }
              onRowToggle({ data: newExpandedRows, expanded: newExpandedRows })
            }}
            className='p-0.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0 cursor-pointer'
          >
            {isExpanded ? (
              <ChevronDown size={16} className='text-gray-600' />
            ) : (
              <ChevronRight size={16} className='text-gray-600' />
            )}
          </button>
        ) : (
          <span className='w-[18px]' />
        )}

        {/* Type icon */}
        <div className='flex-shrink-0'>{taskType?.icon || taskTypes[1].icon}</div>

        {/* Task ID - clickable to open modal */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTaskClick(rowData)
          }}
          className='text-sm text-blue-600 underline hover:text-blue-700 font-medium flex-shrink-0'
        >
          {rowData.task_id}
        </button>

        {/* Task name - not clickable */}
        <div className='flex-1 min-w-0'>
          <InlineEditableSummary task={rowData} onTaskClick={() => {}} onUpdate={onUpdate} />
        </div>
      </div>
    )
  }

  // Priority column
  const priorityBodyTemplate = (rowData: Task) => {
    const priority = priorityColors.find((p) => p.value === rowData.priority)
    return (
      <div onClick={(e) => e.stopPropagation()}>
        {priority ? (
          <div className='flex items-center gap-1.5'>
            {priority.icon}
            <span className='text-sm' style={{ color: priority.color }}>
              {priority.label}
            </span>
          </div>
        ) : (
          <span className='text-sm text-gray-400'>—</span>
        )}
      </div>
    )
  }

  // Row expansion template
  const rowExpansionTemplate = (rowData: Task) => {
    return <SubtaskExpansion task={rowData} projectId={projectId} onTaskClick={onTaskClick} onUpdate={onUpdate} />
  }

  if (isLoading) {
    return (
      <div
        className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm p-4 space-y-2'
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className='flex items-center gap-4 border-b border-gray-100 pb-2 pt-2 last:border-none'>
            <Skeleton width='40px' height='20px' borderRadius='6px' />
            <Skeleton width='100px' height='20px' borderRadius='6px' />
            <Skeleton width='250px' height='20px' borderRadius='6px' />
            <Skeleton width='120px' height='20px' borderRadius='6px' />
            <Skeleton width='140px' height='20px' borderRadius='6px' />
            <Skeleton width='160px' height='20px' borderRadius='6px' />
            <Skeleton width='100px' height='20px' borderRadius='6px' />
            <Skeleton width='120px' height='20px' borderRadius='6px' />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <DataTable
        value={parentTasks}
        dataKey='task_id'
        loading={isLoading}
        expandedRows={expandedRows}
        onRowToggle={(e) => {
          onRowToggle({ data: e.data as any })
        }}
        rowExpansionTemplate={rowExpansionTemplate}
        size='normal'
        className='text-md!'
        rowClassName={() => 'hover:bg-gray-50 transition-colors h-[44px] py- px-4'}
        showGridlines
        pt={{
          root: { className: 'text-sm font-[500]' },
          table: {
            style: {
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '15px'
            }
          }
        }}
        selectionMode='checkbox'
        selection={selectedTasks}
        onSelectionChange={(e) => {
          onSelectionChange(e.value as Task[])
        }}
      >
        <Column
          selectionMode='multiple'
          style={{ width: '40px' }}
          headerStyle={{ width: '40px', fontFamily: "'Space Grotesk', sans-serif !important" }}
        />
        <Column body={workBodyTemplate} header='Công việc' style={{ width: '400px', minWidth: '300px' }} />
        <Column
          body={(rowData: Task) => (
            <div onClick={(e) => e.stopPropagation()}>
              <InlineEditableAssignee task={rowData} projectId={projectId} onTaskClick={() => {}} onUpdate={onUpdate} />
            </div>
          )}
          header='Người thực hiện'
          style={{ width: '160px' }}
        />
        <Column body={dueDateBodyTemplate} header='Hạn' style={{ width: '100px' }} />
        <Column body={priorityBodyTemplate} header='Độ ưu tiên' style={{ width: '120px' }} />
        <Column
          body={(rowData: Task) => {
            return (
              <div onClick={(e) => e.stopPropagation()} className='text-sm'>
                <InlineEditableStatus task={rowData} projectId={projectId} onTaskClick={() => {}} onUpdate={onUpdate} />
              </div>
            )
          }}
          header='Trạng thái'
          style={{ width: '140px' }}
        />
      </DataTable>
    </div>
  )
}
