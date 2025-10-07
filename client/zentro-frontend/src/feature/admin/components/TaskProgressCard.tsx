import { Doughnut } from 'react-chartjs-2'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
import styled from 'styled-components'

// Bắt buộc đăng ký phần tử cho chart.js
Chart.register(ArcElement, Tooltip, Legend)

const COLORS = [
  '#162964', // Đang thực hiện (navy)
  '#2574FF', // Đã xong
  '#A9C8FF', // Cần làm
  '#7EB3FF' // Bị chặn
]

const TASK_LABELS = ['Đang thực hiện', 'Đã xong', 'Cần làm', 'Bị chặn']

export const ChartWrapper = styled.div`
  background: #fff;
  border: 4px solid #2574ff;
  border-radius: 5px;
  padding: 50px 30px 20px 20px;
  display: flex;
  justify-content: center;
  gap: 36px;
  align-items: flex-start;
  position: relative;
`

export const Header = styled.div`
  position: absolute;
  top: -1px;
  left: 0;
  background: var(--color-accent-blue);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 1px 0 5px 0;
  font-family: 'Space Grotesk', sans-serif;
`

const DoughnutWrap = styled.div`
  width: 230px;
  height: 230px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
`

const DoughnutCenter = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: -1;
  justify-content: center;
  pointer-events: none;
`

const DoughnutTotal = styled.div`
  color: #2574ff;
  font-weight: 700;
  font-size: 50px;
  font-family: 'Space Grotesk', sans-serif;
  line-height: 1.1;
`

const DoughnutLabel = styled.div`
  color: #222;
  font-size: 18px;
  font-weight: 500;
  margin-top: 8px;
  font-family: 'Space Grotesk', sans-serif;
`

const LegendBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 10px;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 16px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 400;
`

const ColorDot = styled.div`
  width: 27px;
  height: 27px;
  border-radius: 7px;
  background: ${(props) => props.color};
`

export default function TaskProgressCard({ TASK_DATA }: { TASK_DATA: Array<number> }) {
  const TOTAL = TASK_DATA.reduce((a, b) => a + b, 0)

  const chartData = {
    labels: TASK_LABELS,
    datasets: [
      {
        data: TASK_DATA,
        backgroundColor: COLORS,
        borderColor: '#fff',
        borderWidth: 4,
        hoverOffset: 6,
        borderRadius: 8 // làm segment bo tròn
      }
    ]
  }

  const chartOptions = {
    cutout: '70%',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#212121'
      }
    }
  }

  return (
    <ChartWrapper className='col-span-2'>
      <Header>Tiến độ công việc</Header>
      <DoughnutWrap>
        <Doughnut data={chartData} options={chartOptions} width={230} height={230} />
        <DoughnutCenter>
          <DoughnutTotal>{TOTAL}</DoughnutTotal>
          <DoughnutLabel>Tổng số task</DoughnutLabel>
        </DoughnutCenter>
      </DoughnutWrap>
      <LegendBox>
        {TASK_LABELS.map((label, i) => (
          <LegendItem key={label}>
            <ColorDot color={COLORS[i]} />
            {label}
          </LegendItem>
        ))}
      </LegendBox>
    </ChartWrapper>
  )
}
