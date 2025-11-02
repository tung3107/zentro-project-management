import { ChartColumnIncreasing, ListFilter, Repeat, Search } from 'lucide-react'
import { Tooltip } from 'primereact/tooltip'
import React, { useEffect, useState } from 'react'
import BacklogBoard from './BacklogBoard'

export default function BacklogTab() {
  const [query, setQuery] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
  }
  return (
    <div className='grid grid-cols-5 gap-6'>
      <div className='col-span-5 flex flex-row  justify-between'>
        <div className='flex flex-row gap-2'>
          <div className='relative w-[250px]'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
            <input
              type='text'
              placeholder='Search board'
              value={query}
              onChange={handleChange}
              className='pl-9 pr-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm'
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
          </div>

          {/* Filter */}
          <div>
            <button
              className='flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer'
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <ListFilter size={18} className='text-gray-700' />
              Filter
            </button>
          </div>
        </div>

        <div className='flex flex-row gap-2'>
          <Tooltip target='.burndown-btn' />

          {/* Burn down chart */}
          <div
            className='burndown-btn flex items-center gap-2 px-2 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer'
            data-pr-tooltip='Biểu đồ burndown'
            data-pr-position='bottom'
          >
            <ChartColumnIncreasing size={18} className='text-gray-700' />
          </div>
        </div>
      </div>
      <BacklogBoard searchQuery={query} />
    </div>
  )
}
