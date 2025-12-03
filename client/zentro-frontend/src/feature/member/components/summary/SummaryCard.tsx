import React from 'react'

export default function SummaryCard({
  totalTasks,
  completedTasks,
  inProgressTasks,
  blockedTasks,
  dueTasks
}: {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  blockedTasks: number
  dueTasks: number
}) {
  const stats = [
    ['Số công việc đã tạo', totalTasks],
    ['Số công việc hoàn thành', completedTasks],
    ['Số công việc đang thực hiện', inProgressTasks],
    ['Số công việc bị chặn', blockedTasks],
    ['Số công việc đến hạn', dueTasks]
  ]

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full'>
      {stats.map((stat, i, arr) => (
        <div
          key={i}
          className='rounded-lg bg-[var(--color-accent-blue)] text-[var(--color-grey-text)] px-4 py-3 min-h-[100px] flex flex-col justify-between'
        >
          <div>
            <div className='text-[18px] font-medium'>{stat[0]}</div>
            <div className='text-[13px]'>{i === arr.length - 1 ? '(trong 7 ngày tới)' : '(trong 7 ngày qua)'}</div>
          </div>
          <div className='text-[32px] font-bold mt-1 text-white self-center'>{stat[1]}</div>
        </div>
      ))}
    </div>
  )
}
