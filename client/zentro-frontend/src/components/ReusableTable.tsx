import React, { useCallback, useEffect, useState } from 'react'
import type { TableProps } from '../types/table'
import {
  DataTable,
  type DataTablePageEvent,
  type DataTableSortEvent,
  type DataTableFilterMeta
} from 'primereact/datatable'
import api from '../util/axiosClient'
import { Eye, Loader, Pencil, PlusCircle, Search, Trash2 } from 'lucide-react'
import { InputText } from 'primereact/inputtext'
import { Column } from 'primereact/column'
import Loading from './Loading'
import Button from './Button'
import Dropdown from './Dropdown'
import FilterBar from './FilterBar'

export default function ReusableTable<T>({
  apiEndPoint,
  addButtonContent,
  onAdd,
  columns,
  showGridlines,
  defaultPageSize = 10,
  queryParams = {},
  onView,
  onDelete,
  onEdit,
  disableDeleteCondition
}: TableProps<T>) {
  const [data, setData] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [pagination, setPagination] = useState<{ page: number | undefined; limit: number | undefined }>({
    page: 0,
    limit: defaultPageSize
  })

  const [sortField, setSortField] = useState<string | undefined>()
  const [sortOrder, setSortOrder] = useState<1 | -1 | 0 | null | undefined>(null)

  const [globalFilter, setGlobalFilter] = useState('')

  const [filters, setFilters] = useState<DataTableFilterMeta>({})
  const [filterState, setFilterState] = useState({})

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: ((pagination.page ?? 0) + 1).toString(),
        limit: (pagination.limit ?? defaultPageSize).toString()
      })

      if (sortField && sortOrder !== null && sortOrder !== 0) {
        params.append('sortBy', sortField)
        params.append('sortOrder', sortOrder === 1 ? 'asc' : 'desc')
      }
      if (globalFilter) {
        params.append('search', globalFilter)
      }

      Object.entries(filters).forEach(([k, v]) => params.append(k, String(v)))

      const response = await api.get(`${apiEndPoint}?${params.toString()}`)

      const result = response.data

      if (result.status === 'success') {
        setData(result.data)
        setTotalItems(result.pagination.totalItems)
      } else {
        throw new Error('Không lấy được data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [apiEndPoint, pagination, sortField, sortOrder, globalFilter, filters, defaultPageSize])

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData()
    }, 400)

    return () => clearTimeout(delay)
  }, [globalFilter, fetchData])

  const onPageChange = (e: DataTablePageEvent) => {
    setPagination({ page: e.page, limit: e.rows })
  }

  const onSortingChange = (e: DataTableSortEvent) => {
    setSortField(e.sortField)
    setSortOrder(e.sortOrder)
  }

  const actionCellTemplate = (row: T) => {
    const disableDelete = typeof disableDeleteCondition === 'function' && disableDeleteCondition(row)

    return (
      <div className='flex gap-3'>
        {onView && (
          <div className='p-2 rounded-lg border border-green-300'>
            <Eye
              className='w-4 h-4 cursor-pointer hover:scale-110 transition-transform text-green-500'
              onClick={() => onView(row)}
              strokeWidth={1.5}
            />
          </div>
        )}
        {onEdit && (
          <div className='p-2 rounded-lg border border-blue-300'>
            <Pencil
              className='w-4 h-4 cursor-pointer hover:scale-110 transition-transform text-blue-500'
              onClick={() => onEdit(row)}
              strokeWidth={1.5}
            />
          </div>
        )}
        {onDelete && (
          <div
            className={`p-2 rounded-lg border ${
              disableDelete ? 'border-gray-300 opacity-40 cursor-not-allowed' : 'border-red-300'
            }`}
          >
            <Trash2
              className={`w-4 h-4 transition-transform ${
                disableDelete ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 cursor-pointer hover:scale-110'
              }`}
              strokeWidth={1.5}
              onClick={() => {
                if (!disableDelete) onDelete(row)
              }}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='space-y-4 mt-6 px-4 py-4 bg-white rounded-lg'>
      {/* Search box */}
      <div className='flex justify-between'>
        <div
          className='flex justify-center gap-4 flex-wrap'
          style={{ fontFamily: '"Inter var", sans-serif', color: '#4b5563', fontSize: '1rem' }}
        >
          <div className='relative w-50 flex items-center'>
            <InputText
              placeholder='Search...'
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value)
                setPagination((prep) => ({ ...prep, page: 0 }))
              }}
              className='pl-10 pr-4 h-10 w-full'
            />
            <Search
              strokeWidth={1.5}
              className='absolute right-3  top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none'
            />
          </div>
          <FilterBar columns={columns} filterState={filters} setFilterState={setFilters} />
        </div>
        {addButtonContent && (
          <Button className='flex items-center gap-2' type='button' onClick={onAdd}>
            <PlusCircle strokeWidth={1.5} size={18} />
            <span className='text-md'>{addButtonContent}</span>
          </Button>
        )}
      </div>

      {error && <div className='text-red-500 text-sm'>Error: {error}</div>}

      <div className='overflow-x-auto'>
        <DataTable
          lazy
          value={data}
          stripedRows
          sortField={sortField}
          sortOrder={sortOrder}
          rows={pagination.limit}
          rowsPerPageOptions={[10, 25, 50, 100]}
          loading={loading}
          loadingIcon={<Loading />}
          scrollable
          showGridlines={showGridlines}
          scrollHeight='550px'
          totalRecords={totalItems}
          first={(pagination.page ?? 0) * (pagination.limit ?? defaultPageSize)}
          paginator
          removableSort
          onPage={onPageChange}
          onSort={onSortingChange}
          dataKey='id'
          className={`max-w-full ${loading ? 'opacity-50 w-full pointer-events-none' : ''}`}
        >
          {columns.map((col) => {
            let bodyTemplate = col.body

            const clickableFields = col.clickableFields

            if (!bodyTemplate && clickableFields?.includes(col.field)) {
              bodyTemplate = (row: T) => (
                <span className='text-blue-600 cursor-pointer hover:underline' onClick={() => onView?.(row)}>
                  {String(row[col.field as keyof T] ?? '')}
                </span>
              )
            }

            return (
              <Column
                key={String(col.field)}
                className={col.className}
                field={String(col.field)}
                style={{ minWidth: col.width ? col.width : '200px' }}
                header={() => (
                  <div className='flex items-center gap-3 text-sm text-gray-600'>
                    {col.header}
                    {col.sortable && (
                      <i
                        className='pi pi-sort-alt'
                        style={{
                          fontSize: '12px !important',
                          color: 'grey !important'
                        }}
                      />
                    )}
                  </div>
                )}
                sortable={col.sortable}
                body={bodyTemplate}
              ></Column>
            )
          })}

          {(onView || onEdit || onDelete) && (
            <Column header='Hành động' body={actionCellTemplate} style={{ width: '8rem' }} />
          )}
        </DataTable>
      </div>
    </div>
  )
}
