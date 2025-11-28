import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface BurndownData {
  sprint: {
    name: string
    start_date: string
    end_date: string
  }
  totalEstimate: number
  completedEstimate: number
  burndownData: Array<{
    date: string
    ideal: number
    actual: number | null
  }>
}

interface BurndownModalProps {
  isOpen: boolean
  onClose: () => void
  data: BurndownData | null
}

export default function BurndownModal({ isOpen, onClose, data }: BurndownModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !data) return null

  const chartData = {
    labels: data.burndownData.map((d) => {
      const date = new Date(d.date)
      return `${date.getDate()}/${date.getMonth() + 1}`
    }),
    datasets: [
      {
        label: 'Lý tưởng',
        data: data.burndownData.map((d) => d.ideal),
        borderColor: '#cbd5e1',
        backgroundColor: '#cbd5e1',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.1
      },
      {
        label: 'Thực tế',
        data: data.burndownData.map((d) => (d.actual !== null ? d.actual : NaN)),
        borderColor: 'var(--color-primary)',
        backgroundColor: 'var(--color-primary)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        spanGaps: true
      }
    ]
  }

  console.log(data.burndownData.map((d) => d.actual))

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            family: "'Space Grotesk', sans-serif"
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          family: "'Space Grotesk', sans-serif"
        },
        bodyFont: {
          size: 12,
          family: "'Space Grotesk', sans-serif"
        },
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1) + ' giờ'
            }
            return label
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Công việc còn lại (giờ)',
          font: {
            size: 12,
            family: "'Space Grotesk', sans-serif"
          }
        },
        ticks: {
          font: {
            size: 11,
            family: "'Space Grotesk', sans-serif"
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Ngày trong sprint',
          font: {
            size: 12,
            family: "'Space Grotesk', sans-serif"
          }
        },
        ticks: {
          font: {
            size: 11,
            family: "'Space Grotesk', sans-serif"
          }
        }
      }
    }
  }

  const completionPercentage =
    data.totalEstimate > 0 ? Math.round((data.completedEstimate / data.totalEstimate) * 100) : 0

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />

      {/* Modal */}
      <div
        className='relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden'
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Biểu đồ Burndown</h2>
            <p className='text-sm text-gray-600 mt-1'>{data.sprint.name}</p>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
            <X size={24} className='text-gray-600' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto' style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Sprint Info */}
          <div className='grid grid-cols-4 gap-4 mb-6'>
            <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
              <p className='text-xs text-gray-600 mb-1'>Tổng công việc</p>
              <p className='text-2xl font-bold text-gray-900'>{data.totalEstimate.toFixed(1)}h</p>
            </div>
            <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
              <p className='text-xs text-gray-600 mb-1'>Đã hoàn thành</p>
              <p className='text-2xl font-bold text-gray-900'>{data.completedEstimate.toFixed(1)}h</p>
            </div>
            <div className='bg-orange-50 p-4 rounded-lg border border-orange-200'>
              <p className='text-xs text-gray-600 mb-1'>Còn lại</p>
              <p className='text-2xl font-bold text-gray-900'>
                {(data.totalEstimate - data.completedEstimate).toFixed(1)}h
              </p>
            </div>
            <div className='bg-purple-50 p-4 rounded-lg border border-purple-200'>
              <p className='text-xs text-gray-600 mb-1'>Tiến độ</p>
              <p className='text-2xl font-bold text-gray-900'>{completionPercentage}%</p>
            </div>
          </div>

          {/* Sprint Dates */}
          <div className='flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg'>
            <div>
              <p className='text-xs text-gray-600'>Bắt đầu</p>
              <p className='text-sm font-medium text-gray-900'>
                {new Date(data.sprint.start_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className='text-gray-400'>→</div>
            <div>
              <p className='text-xs text-gray-600'>Kết thúc</p>
              <p className='text-sm font-medium text-gray-900'>
                {new Date(data.sprint.end_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className='bg-white border border-gray-200 rounded-lg p-6' style={{ height: '400px' }}>
            <Line data={chartData} options={options} />
          </div>

          {/* Legend Explanation */}
          <div className='mt-4 p-4 bg-blue-50 rounded-lg space-y-2'>
            <p className='text-sm text-gray-700'>
              <strong>Đường lý tưởng (nét đứt):</strong> Tiến độ hoàn thành đều đặn mỗi ngày
            </p>
            <p className='text-sm text-gray-700'>
              <strong>Đường thực tế (nét liền):</strong> Tiến độ hoàn thành thực tế của team
            </p>
            <p className='text-xs text-gray-600 mt-2 italic'>
              * Đường thực tế hiển thị trạng thái hiện tại của các task. Để theo dõi chính xác tiến độ theo ngày, cần có
              hệ thống ghi lại lịch sử thay đổi trạng thái.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
