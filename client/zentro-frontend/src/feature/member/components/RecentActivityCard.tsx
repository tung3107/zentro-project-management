import React from 'react'
import { ChartWrapper, Header } from './TaskProgressCard'

export default function RecentActivityCard() {
  // Giả sử sau này sẽ có danh sách hoạt động => tạm để trống
  const activities: any[] = []

  return (
    <ChartWrapper className='col-span-3 flex flex-col items-center justify-center text-center p-8'>
      <Header>Hoạt động gần đây</Header>

      {activities.length === 0 ? (
        <div className='absolute inset-0 flex flex-col items-center justify-center text-center '>
          <img src='/Not Found.png' alt='No activity' className='w-[230px] h-[230px] object-contain opacity-90' />
          <h1 className=' text-[20px] font-semibold text-gray-800 max-w-[340px] leading-relaxed'>
            Không có hoạt động gì.
          </h1>
          <p className='text-gray-500 text-sm'>Hãy tạo công việc và thêm thành viên vào dự án để thấy các hoạt động.</p>
        </div>
      ) : (
        <div>{/* render danh sách hoạt động sau này */}</div>
      )}
    </ChartWrapper>
  )
}
