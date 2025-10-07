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
  return (
    <>
      {[
        ['Số task đã tạo', totalTasks],
        ['Số task hoàn thành', completedTasks],
        ['Số task đang thực hiện', inProgressTasks],
        ['Số task bị chặn', blockedTasks],
        ['Số task sắp đến hạn', dueTasks]
      ].map((stat, i, arr) => (
        <div
          key={i}
          className='rounded-md flex-1 bg-[var(--color-accent-blue)] text-[var(--color-grey-text)] px-3 py-2 min-h-[100px] flex flex-col items-start'
        >
          <div>
            <div className='text-[18px] font-medium text-700'>{stat[0]}</div>
            <div className='text-[13px] '>{i === arr.length - 1 ? '(trong 7 ngày tới)' : '(trong 7 ngày qua)'}</div>
          </div>
          <div className='text-[32px] font-bold mt-2 text-white self-center'>{stat[1]}</div>
        </div>
      ))}
    </>
  )
}
