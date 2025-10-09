import React from 'react'
import { Folder, Play, CheckCircle, Target, AlertTriangle, Users } from 'lucide-react'

const stats = [
  {
    icon: <Folder className='text-blue-500' size={22} />,
    label: 'Số dự án',
    value: '6',
    trend: '+12%',
    trendColor: 'text-green-500'
  },
  {
    icon: <Play className='text-orange-500' size={22} />,
    label: 'Đang diễn ra',
    value: '2',
    trend: '+5%',
    trendColor: 'text-green-500'
  },
  {
    icon: <CheckCircle className='text-green-500' size={22} />,
    label: 'Hoàn thành',
    value: '1',
    trend: '+18%',
    trendColor: 'text-green-500'
  },
  {
    icon: <Target className='text-green-500' size={22} />,
    label: 'Lượng task done',
    value: '51%',
    trend: '+3%',
    trendColor: 'text-green-500'
  },
  {
    icon: <AlertTriangle className='text-red-500' size={22} />,
    label: 'Task quá hạn',
    value: '5',
    trend: '-2%',
    trendColor: 'text-red-500'
  },
  {
    icon: <Users className='text-gray-500' size={22} />,
    label: 'Số member online',
    value: '16',
    trend: '+7%',
    trendColor: 'text-green-500'
  }
]

const ProjectStats = () => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mt-[24px]'>
      {stats.map((item, i) => (
        <div
          key={i}
          className='flex flex-col justify-between bg-white border border-gray-200 rounded-2xl shadow-sm p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300'
        >
          <div className='flex justify-between items-center'>
            {item.icon}
            <div className='flex flex-col items-end'>
              <span className={`text-xs font-medium ${item.trendColor}`}>{item.trend}</span>
              <span className={`text-xs font-medium text-gray-500`}>(trong 7 ngày)</span>
            </div>
          </div>
          <div className='mt-4'>
            <p className='text-2xl font-semibold text-gray-900'>{item.value}</p>
            <p className='text-sm text-gray-500'>{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProjectStats
