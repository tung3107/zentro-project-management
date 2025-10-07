import DateRangePicker from './DateRangePicker'
import Dropdown from './Dropdown'
import StatusDropdown from './StatusDropdown'
// import DatePicker from './DatePicker' // giả sử có component này

const FilterBar = ({ columns, filterState, setFilterState }: any) => {
  return (
    <>
      {columns
        .filter((col: any) => col.filterable)
        .map((col: any) => {
          const value = filterState[col.apiQuery] ?? ''
          const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setFilterState((prev: any) => ({
              ...prev,
              [col.apiQuery]: e.target.value
            }))
          }

          if (col.filterType === 'dropdown') {
            if (col.apiEndPoint) {
              return (
                <Dropdown
                  key={col.field}
                  name={col.field}
                  value={value}
                  onChange={handleChange}
                  apiEndPoint={col.apiEndPoint}
                  placeholder={col.placeholder}
                  className={'h-10'}
                />
              )
            } else {
              // StatusDropdown expects onChange: (status: string) => void
              return (
                <StatusDropdown
                  key={col.field}
                  value={value}
                  onChange={(status: string) => {
                    setFilterState((prev: any) => ({
                      ...prev,
                      [col.apiQuery]: status
                    }))
                  }}
                  className={'h-10'}
                />
              )
            }
          }

          if (col.filterType === 'date') {
            return (
              <input
                key={col.field}
                type='date'
                name={col.field}
                value={value}
                onChange={handleChange}
                className='border border-gray-300 rounded-md px-3 py-1.5 text-sm'
              />
            )
          }

          if (col.filterType === 'daterange' && Array.isArray(col.apiQuery)) {
            return (
              <div key={col.field} className='flex items-center'>
                <DateRangePicker
                  onChange={({ startDate, endDate }) => {
                    setFilterState((prev: typeof filterState) => ({
                      ...prev,
                      [`${col.apiQuery[0]}From`]: startDate, // startDateFrom
                      [`${col.apiQuery[1]}To`]: endDate // endDateFrom
                    }))
                  }}
                  value={[filterState[`${col.apiQuery[0]}From`] || null, filterState[`${col.apiQuery[1]}To`] || null]}
                  className='h-10'
                />
              </div>
            )
          }

          return null
        })}
    </>
  )
}

export default FilterBar
