import React from 'react'
import { Card } from 'primereact/card'
import { Chart } from 'primereact/chart'
import { ProgressBar } from 'primereact/progressbar'

const priorityColors = [
  '#cb0404', // Highest
  '#f37121', // High
  '#d23232', // Medium
  '#3498db', // Low
  '#95a5a6' // Lowest
]

const Dashboard: React.FC = () => {
  // Data dummy, bạn thay bằng data thực của bạn
  const totalTasks = 100
  const completedTasks = 100
  const inProgressTasks = 100
  const blockedTasks = 100
  const dueTasks = 100

  // ChartJS data
  const doughnutData = {
    labels: ['Hoàn thành', 'Chưa hoàn thành'],
    datasets: [
      {
        data: [completedTasks, totalTasks - completedTasks],
        backgroundColor: ['var(--primary)', '#e0e0e0'],
        borderWidth: 0
      }
    ]
  }

  const barData = {
    labels: ['Highest', 'High', 'Medium', 'Low', 'Lowest'],
    datasets: [
      {
        label: 'Số lượng',
        backgroundColor: priorityColors,
        data: [80, 80, 80, 80, 80],
        borderRadius: 8
      }
    ]
  }

  const groupWorkData = {
    labels: ['Thanh Hai', 'Thanh Hai', 'Thanh Hai'],
    datasets: [
      {
        label: 'Khối lượng (%)',
        backgroundColor: 'var(--primary-light)',
        data: [80, 80, 80],
        borderRadius: 8
      }
    ]
  }

  return (
    <div style={{ padding: 32, background: '#f9fafd' }}>
      <h2 style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Dự án Zentro</h2>

      {/* Các thống kê tổng quan */}
      <div style={{ display: 'flex', gap: 16, marginBlock: 32 }}>
        {[
          ['Số task đã tạo', totalTasks],
          ['Số task hoàn thành', completedTasks],
          ['Số task đang thực hiện', inProgressTasks],
          ['Số task bị chặn', blockedTasks],
          ['Số task sắp đến hạn', dueTasks]
        ].map((stat, i) => (
          <Card key={i} style={{ flex: 1, textAlign: 'center', background: 'var(--primary-light)', color: '#fff' }}>
            <div style={{ fontSize: 18, fontWeight: 500 }}>{stat[0]}</div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{stat[1]}</div>
          </Card>
        ))}
      </div>

      {/* Charts & Diagrams */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 32 }}>
        {/* Tiến độ công việc */}
        <Card title='Tiến độ công việc' style={{ width: 350, textAlign: 'center' }}>
          <Chart
            type='doughnut'
            data={doughnutData}
            options={{
              cutout: '75%',
              plugins: {
                legend: { display: false }
              }
            }}
          />
          <div style={{ position: 'relative', top: '-110px', fontSize: 24, color: 'var(--primary)', fontWeight: 700 }}>
            {totalTasks}
            <br />
            <span style={{ fontSize: 14, color: 'var(--text)' }}>Tổng số task</span>
          </div>
        </Card>

        {/* Phân bổ ưu tiên */}
        <Card title='Phân bổ ưu tiên' style={{ flex: 1, minWidth: 300 }}>
          <Chart
            type='bar'
            data={barData}
            options={{
              plugins: { legend: { display: false } },
              indexAxis: 'y',
              scales: { x: { min: 0, max: 100 } }
            }}
          />
        </Card>

        {/* Workload */}
        <Card title='Khối lượng công việc của nhóm' style={{ flex: 1, minWidth: 300 }}>
          {groupWorkData.labels.map((member, idx) => (
            <div key={idx} style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 500, color: 'var(--text)' }}>{member}</div>
              <ProgressBar
                value={groupWorkData.datasets[0].data[idx]}
                color='var(--primary)'
                style={{ height: '16px', borderRadius: 8 }}
              />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
