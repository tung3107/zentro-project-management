import { ChartColumnIncreasing, ListFilter, Search } from 'lucide-react'
import { Tooltip } from 'primereact/tooltip'
import React, { useState } from 'react'
import BacklogBoard from './BacklogBoard'
import FilterMenu from '../modal/FilterMenu'
import { useParams } from 'react-router-dom'

export default function BacklogTab() {
  const [query, setQuery] = useState('')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [filters, setFilters] = useState<{ assignee_id?: string; priority?: number; type?: string }>({})
  const { projectId } = useParams()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
  }

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <div className='grid grid-cols-5 gap-6'>
      <div className='col-span-5 flex flex-row  justify-between'>
        <div className='flex flex-row gap-2'>
          <div className='relative w-[250px]'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
            <input
              type='text'
              placeholder='Tìm kiếm bảng'
              value={query}
              onChange={handleChange}
              className='pl-9 pr-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm'
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
          </div>

          {/* Filter */}
          <div>
            <button
              onClick={() => setShowFilterMenu(true)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer ${
                Object.keys(filters).length > 0
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'border-gray-400 text-gray-700 hover:bg-gray-100'
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <ListFilter size={18} />
              Lọc
              {Object.keys(filters).length > 0 && (
                <span className='px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full'>
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className='flex flex-row gap-2'></div>
      </div>
      <BacklogBoard searchQuery={query} filters={filters} />

      {/* Filter Menu */}
      {projectId && (
        <FilterMenu
          project_id={projectId}
          isOpen={showFilterMenu}
          onClose={() => setShowFilterMenu(false)}
          onApply={handleApplyFilters}
          currentFilters={filters}
        />
      )}
    </div>
  )
}
