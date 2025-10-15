import React, { useEffect, useState } from 'react'
import DragnDropColumn, { type Column } from './DragnDropColumn'
import { ChartColumnIncreasing, ListFilter, Repeat, Search } from 'lucide-react'
import { Tooltip } from 'primereact/tooltip'
import { getCurrentSprintDetails } from '../service/sprint.service'
import { useParams } from 'react-router-dom'
import { Sprint } from '../../../types/sprint'
import { getBoard } from '../service/task.service'
import { Skeleton } from 'primereact/skeleton'

export default function BoardTab() {
  const [query, setQuery] = useState('')
  const [columns, setColumns] = useState<Column[]>([])
  const [sprint, setSprint] = useState<Sprint>()
  const [isLoading, setLoading] = useState(false)
  const { projectId } = useParams()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await getCurrentSprintDetails(projectId)
        setSprint(res.data)

        const res_2 = await getBoard(projectId)
        setColumns(res_2.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [projectId])

  const handleSearch = (query: string) => {
    console.log('Search:', query)
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch(query)
    }, 400)
    return () => clearTimeout(delay)
  }, [query])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
  }

  const renderSkeleton = () => {
    const skeletonCols = Array.from({ length: 4 })

    return (
      <div className='w-full'>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex gap-3'>
            <Skeleton width='250px' height='36px' borderRadius='8px' />
            <Skeleton width='90px' height='36px' borderRadius='8px' />
          </div>
          <div className='flex gap-3'>
            <Skeleton width='130px' height='36px' borderRadius='8px' />
            <Skeleton width='40px' height='36px' borderRadius='8px' />
            <Skeleton width='40px' height='36px' borderRadius='8px' />
          </div>
        </div>

        <div className='flex gap-4 overflow-x-auto items-stretch'>
          {skeletonCols.map((_, idx) => (
            <div key={idx} className='w-[280px] bg-white border border-gray-200 rounded-lg p-4 flex-shrink-0 shadow-sm'>
              <Skeleton width='60%' height='20px' className='mb-4' />
              <div className='flex flex-col gap-3'>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className='border border-gray-200 rounded-lg p-3 shadow-sm bg-gray-50'>
                    <Skeleton width='80%' height='16px' className='mb-2' />
                    <Skeleton width='40%' height='14px' />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-5 gap-6'>
      <div className='col-span-5' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {isLoading ? (
          renderSkeleton()
        ) : (
          <>
            {/* Header bar */}
            <div className='flex flex-row justify-between mb-6'>
              <div className='flex flex-row gap-2'>
                {/* Search bar */}
                <div className='relative w-[250px]'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
                  <input
                    type='text'
                    placeholder='Search board'
                    value={query}
                    onChange={handleChange}
                    className='pl-9 pr-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm'
                  />
                </div>

                {/* Filter button */}
                <button className='flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer'>
                  <ListFilter size={18} className='text-gray-700' />
                  Filter
                </button>
              </div>

              {/* Sprint buttons */}
              <div className='flex flex-row gap-2'>
                <Tooltip target='.sprint-btn' />
                <Tooltip target='.burndown-btn' />

                <button className='flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 bg-[var(--color-lowest)] text-white transition-colors duration-150 cursor-pointer'>
                  Hoàn thành sprint
                </button>

                <div
                  className='sprint-btn flex items-center gap-2 px-2 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer'
                  data-pr-tooltip='Chi tiết sprint'
                  data-pr-position='bottom'
                >
                  <Repeat size={18} className='text-gray-700' />
                </div>

                <div
                  className='burndown-btn flex items-center gap-2 px-2 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer'
                  data-pr-tooltip='Biểu đồ burndown'
                  data-pr-position='bottom'
                >
                  <ChartColumnIncreasing size={18} className='text-gray-700' />
                </div>
              </div>
            </div>

            {/* Board columns */}
            <div className='flex gap-4 mb-[20px]'>
              <DragnDropColumn columns={columns} setColumns={setColumns} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
