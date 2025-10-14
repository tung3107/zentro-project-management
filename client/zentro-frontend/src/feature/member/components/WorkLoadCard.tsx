import React, { useState } from 'react'
import styled from 'styled-components'
import { ChartWrapper, Header } from './TaskProgressCard'
import Avatar from '../../../components/Avatar'

interface WorkLoadData {
  user_id: string
  name: string
  percent: number
  avatar: string | null
}

interface WorkLoadDataProps {
  data: WorkLoadData[]
}

const PRIORITY_COLORS = ['#2072FA']

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 14px 0;
  gap: 22px;
  min-height: 32px;
  border-bottom: 0.5px solid #c4c4c4;
`
const Label = styled.div<{ color: string }>`
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: ${({ color }) => color};
  width: 120px;
  font-size: 18px;
  display: flex;
  gap: 10px;
  align-items: center;
`
const ProgressTrack = styled.div`
  flex: 1;
  height: 20px;
  border-radius: 4px;
  background: #eaeaeb;
  position: relative;
  overflow: visible;
  display: flex;
  align-items: center;
`
const ProgressFillWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
`
const ProgressFill = styled.div<{ percent: number; color: string }>`
  width: ${({ percent }) => percent}%;
  height: 100%;
  background: ${({ color }) => color};
  border-radius: ${({ percent }) => (percent >= 99.9 ? '4px' : '4px 0 0 4px')};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  transition: width 0.5s;
  font-size: 16px;
  position: relative;
  cursor: pointer;
  z-index: 1;
`
const ProgressPercent = styled.span`
  color: #fff;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 15px;
  z-index: 2;
  position: relative;
  right: 10px;
`
const BarTooltip = styled.div<{ show: boolean; percent: number }>`
  display: ${({ show }) => (show ? 'block' : 'none')};
  position: absolute;
  left: ${({ percent }) => (percent > 10 ? `${percent}%` : '10%')};
  top: -40px;
  transform: translateX(-50%);
  background: #212121;
  color: #fff;
  font-size: 15px;
  padding: 7px 16px;
  border-radius: 6px;
  font-family: 'Space Grotesk', sans-serif;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 7px 24px 0 #0002;
  z-index: 10;
  transition: opacity 0.2s;
`

export default function WorkLoadCard({ data }: WorkLoadDataProps) {
  const [hoverBarIndex, setHoverBarIndex] = useState<number | null>(null)

  return (
    <ChartWrapper className='pt-[40px]! pb-[0px]! col-span-3 row-start-3 col-start-3'>
      <Header>Phân bổ ưu tiên</Header>
      <div style={{ width: '100%' }}>
        {data.map((item, idx) => (
          <ProgressBarContainer key={item.name}>
            <Label color={'#101828'}>
              <Avatar name={item.name} avatarUrl={item.avatar} size={25} />
              <span className='text-[16px]'>{item.name}</span>
            </Label>
            <ProgressTrack>
              <ProgressFillWrapper
                onMouseEnter={() => setHoverBarIndex(idx)}
                onMouseLeave={() => setHoverBarIndex(null)}
              >
                <ProgressFill color={'#2260FF'} percent={item.percent}>
                  <ProgressPercent>{item.percent}%</ProgressPercent>
                  <BarTooltip show={hoverBarIndex === idx} percent={item.percent}>
                    {item.percent}%
                  </BarTooltip>
                </ProgressFill>
              </ProgressFillWrapper>
            </ProgressTrack>
          </ProgressBarContainer>
        ))}
      </div>
    </ChartWrapper>
  )
}
