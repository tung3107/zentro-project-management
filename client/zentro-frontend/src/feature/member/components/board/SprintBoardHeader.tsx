import React, { useMemo } from 'react'
import { Search, ListFilter, ChartColumnIncreasing, CheckCircle2, Clock, Calendar, Target } from 'lucide-react'
import { Tooltip } from 'primereact/tooltip'
import type { Sprint } from '../../../../types/sprint'
import type { Column } from './DragnDropColumn'
import Avatar from '../../../../components/Avatar'

interface SprintBoardHeaderProps {
  sprint: Sprint
  columns: Column[]
  query: string
  setQuery: (query: string) => void
  filters: { assignee_id?: string; priority?: number; type?: string }
  onOpenFilter: () => void
  onCompleteSprint: () => void
  onShowBurndown: () => void
  permissions: { canCompleteSprint: boolean }
  completedStatusIds: number[]
}

export default function SprintBoardHeader({
  sprint,
  columns,
  query,
  setQuery,
  filters,
  onOpenFilter,
  onCompleteSprint,
  onShowBurndown,
  permissions,
  completedStatusIds
}: SprintBoardHeaderProps) {
  // Calculate Stats
  const stats = useMemo(() => {
    let total = 0
    let completed = 0
    const assignees = new Set<string>() // Store unique avatar URLs or IDs

    columns.forEach((col) => {
      total += col.tasks.length
      if (completedStatusIds.includes(col.id)) {
        completed += col.tasks.length
      }
      col.tasks.forEach((t) => {
        if (t.assignee) {
          assignees.add(JSON.stringify(t.assignee))
        }
      })
    })

    const progress = total === 0 ? 0 : Math.round((completed / total) * 100)
    const uniqueAssignees = Array.from(assignees).map((s) => JSON.parse(s))

    return { total, completed, progress, uniqueAssignees }
  }, [columns, completedStatusIds])

  // Calculate Days Left
  const daysLeft = useMemo(() => {
    if (!sprint.end_date) return null
    const today = new Date()
    const end = new Date(sprint.end_date)
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }, [sprint.end_date])

  return (
    <div className='bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden'>
      {/* Top Section: Sprint Info & Stats */}
      <div className='px-6 py-5 border-b border-gray-100'>
        <div className='flex flex-col lg:flex-row lg:items-start justify-between gap-6'>
          {/* Left: Title & Meta */}
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-2'>
              <h1 className='text-xl font-bold text-gray-900'>{sprint.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  daysLeft !== null && daysLeft > 0
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : daysLeft === 0
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {daysLeft !== null
                  ? daysLeft > 0
                    ? `${daysLeft} ngày còn lại`
                    : daysLeft === 0
                      ? 'Hạn chót hôm nay'
                      : 'Đã quá hạn'
                  : 'Không có hạn'}
              </span>
            </div>

            <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-1'>
              <div className='flex items-center gap-1.5'>
                <Calendar size={14} />
                <span>
                  {new Date(sprint.start_date).toLocaleDateString('vi-VN')} -{' '}
                  {new Date(sprint.end_date).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {sprint.goal && (
                <div className='flex items-center gap-1.5 text-gray-700'>
                  <Target size={14} className='text-blue-600' />
                  <span className='font-medium line-clamp-1' title={sprint.goal}>
                    Mục tiêu: {sprint.goal}
                  </span>
                </div>
              )}

              {/* Assignees */}
              {stats.uniqueAssignees.length > 0 && (
                <div className='flex items-center gap-2'>
                  <div className='flex items-center -space-x-2'>
                    {stats.uniqueAssignees.slice(0, 5).map((user: any) => (
                      <div key={user.user_id} className='border-2 border-white rounded-full'>
                        <Avatar avatarUrl={user.avatar} name={`${user.first_name} ${user.last_name}`} size={24} />
                      </div>
                    ))}
                    {stats.uniqueAssignees.length > 5 && (
                      <div className='w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-gray-600'>
                        +{stats.uniqueAssignees.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Progress & Assignees */}
          <div className='flex flex-col items-end gap-4 min-w-[250px]'>
            {/* Progress Bar */}
            <div className='w-full'>
              <div className='flex items-center justify-between text-sm mb-1.5'>
                <span className='text-gray-500 font-medium'>Tiến độ</span>
                <span className='text-gray-900 font-bold'>
                  {stats.completed}/{stats.total} ({stats.progress}%)
                </span>
              </div>
              <div className='h-2 w-full bg-gray-100 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-blue-600 rounded-full transition-all duration-500 ease-out'
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Toolbar */}
      <div className='px-6 py-3 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4'>
        {/* Search & Filter */}
        <div className='flex items-center gap-3 w-full sm:w-auto'>
          <div className='relative flex-1 sm:w-[280px]'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={16} />
            <input
              type='text'
              placeholder='Tìm kiếm task...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
            />
          </div>

          <button
            onClick={onOpenFilter}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
              Object.keys(filters).length > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ListFilter size={16} />
            <span>Lọc</span>
            {Object.keys(filters).length > 0 && (
              <span className='flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-[10px] rounded-full'>
                {Object.keys(filters).length}
              </span>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
          <Tooltip target='.burndown-btn' />
          {/* <button
            onClick={onShowBurndown}
            className='burndown-btn flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all'
            data-pr-tooltip='Biểu đồ Burndown'
            data-pr-position='bottom'
          >
            <ChartColumnIncreasing size={18} />
            <span className='hidden sm:inline'>Biểu đồ</span>
          </button> */}

          {permissions.canCompleteSprint && (
            <button
              onClick={onCompleteSprint}
              className='flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm'
            >
              <CheckCircle2 size={16} />
              <span>Hoàn thành</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
