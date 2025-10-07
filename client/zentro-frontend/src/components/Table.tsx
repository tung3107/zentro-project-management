import React, { useEffect, useMemo, useState } from 'react'
import type { TableAction, TableProps } from '../types/table'
import styled, { css } from 'styled-components'
import {
  SearchIcon,
  ChevronLast,
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  ArrowUpDown
} from 'lucide-react'
import { useTable } from '../util/useTable'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type SortingState } from '@tanstack/react-table'
import Loading from './Loading'

type ActionType = 'view' | 'edit' | 'delete'

const colors = {
  view: '#3B82F6', // blue
  edit: '#22C55E', // green
  delete: '#EF4444' // red
}

const ActionButtonWrapper = styled.button<{ action: ActionType }>`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  ${({ action }) => {
    const color = colors[action]
    return css`
      background-color: ${color}22; // nhạt và trong
      border: 1px solid ${color};
      color: ${color};

      &:hover {
        background-color: ${color}33;
      }
    `
  }}
`

export const ActionButton: React.FC<{
  action: TableAction<unknown>
  row: unknown
  className?: string
}> = ({ action, row, className = '' }) => {
  const isDisabled = action.disabled?.(row) || false
  const isHidden = action.hidden?.(row) || false

  if (isHidden) return null

  return (
    <ActionButtonWrapper
      onClick={(e) => {
        e.stopPropagation()
        if (!isDisabled) {
          action.onClick(row)
        }
      }}
      disabled={isDisabled}
      title={action.tooltips || action.label}
      action={action.action}
    >
      {action.icon}
    </ActionButtonWrapper>
  )
}

const TableSearch: React.FC<{
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}> = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div style={{ position: 'relative' }}>
      <SearchIcon strokeWidth={1.5} style={{ marginLeft: '12px' }} />
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '0.5rem 0.75rem', // py-2 px-3
          border: '1px solid #D1D5DB', // border-gray-300
          borderRadius: '6px', // rounded-md
          outline: 'none',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'transparent'
          e.currentTarget.style.boxShadow = '0 0 0 2px #3B82F6' // focus:ring-blue-500
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#D1D5DB'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

const TablePagination: React.FC<{
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: number[]
  className?: string
}> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '1rem',
      ...(className ? { className } : {})
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.875rem', color: '#374151' /* gray-700 */ }}>
        Hiển thị {currentPage * pageSize + 1} đến {Math.min((currentPage + 1) * pageSize, totalItems)} của {totalItems}{' '}
        kết quả
      </span>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        style={{
          padding: '4px 8px',
          border: '1px solid #D1D5DB',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {size} / trang
          </option>
        ))}
      </select>

      <button
        onClick={() => onPageChange(0)}
        disabled={currentPage === 0}
        style={{
          padding: '4px 8px',
          border: '1px solid #D1D5DB',
          borderRadius: '4px',
          fontSize: '0.875rem',
          opacity: currentPage === 0 ? 0.5 : 1,
          cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
        }}
      >
        <ChevronFirst strokeWidth={1.5} />
      </button>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        style={{
          padding: '4px 8px',
          border: '1px solid #D1D5DB',
          borderRadius: '4px',
          fontSize: '0.875rem',
          opacity: currentPage === 0 ? 0.5 : 1,
          cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
        }}
      >
        <ChevronLeft strokeWidth={1.5} />
      </button>

      <span style={{ padding: '4px 8px', fontSize: '0.875rem' }}>
        Trang {currentPage + 1} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        style={{
          padding: '4px 8px',
          border: '1px solid #D1D5DB',
          borderRadius: '4px',
          fontSize: '0.875rem',
          opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
          cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer'
        }}
      >
        <ChevronRight strokeWidth={1.5} />
      </button>

      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={currentPage >= totalPages - 1}
        style={{
          padding: '4px 8px',
          border: '1px solid #D1D5DB',
          borderRadius: '4px',
          fontSize: '0.875rem',
          opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
          cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer'
        }}
      >
        <ChevronLast strokeWidth={1.5} />
      </button>
    </div>
  </div>
)

export default function Table<T extends Record<string, unknown>>({
  apiEndPoint,
  column,
  actions = [],
  actionsWidth = 120,
  actionsLabel = 'Thao tác',
  enableSorting = true,
  enableFiltering = true,
  enableSearch = true,
  enablePagination = true,
  enableSelection = false,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  searchPlaceholder = 'Tìm kiếm...',
  emptyMessage = 'Không có dữ liệu',
  loadingMessage = 'Đang tải...',
  className = '',
  tableClassName = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  onRowClick,
  onRowSelect,
  onDataChange,
  initialFilters = {},
  initialSorting,
  initialSearch = ''
}: TableProps<T>) {
  const {
    data,
    loading,
    error,
    pagination,
    totalItems,
    totalPages,
    updatePagination,
    sorting,
    updateSorting,
    filters,
    globalFilter,
    setGlobalFilter,
    updateFilters,
    resetFilters,
    refetch
  } = useTable<T>(apiEndPoint, initialFilters, initialSorting, initialSearch, pageSize)

  const [rowSelection, setRowSelection] = useState({})

  /// server sorting => tanstack format

  const tableSorting: SortingState = useMemo(() => {
    if (!sorting) return []
    return [{ id: sorting.field, desc: sorting.order === 'desc' }]
  }, [sorting])

  /// Tao column
  const tableColumns: ColumnDef<T>[] = useMemo(() => {
    const cols: ColumnDef<T>[] = column.map((col) => ({
      accessorKey: col.accessorKey as string,
      header: col.header,
      cell: col.cell,
      enableSorting: enableSorting && col.enableSorting !== false,
      size: typeof col.width === 'number' ? col.width : undefined,
      minSize: col.minWidth,
      maxSize: col.maxWidth
    }))

    if (enableSelection) {
      cols.unshift({
        id: 'select',
        header: ({ table }) => (
          <input
            type='checkbox'
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input type='checkbox' checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
        ),
        enableSorting: false,
        size: 50
      })
    }

    if (actions.length > 0) {
      cols.push({
        id: 'actions',
        header: actionsLabel,
        cell: ({ row }) =>
          actions.map((action: TableAction<T>) => <ActionButton key={action.label} action={action} row={row} />),
        enableSorting: false,
        size: actionsWidth
      })
    }
    return cols
  }, [column, enableSorting, enableSelection, actions, actionsLabel, actionsWidth])

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: pagination.page,
        pageSize: pagination.limit
      },
      sorting: tableSorting,
      globalFilter,
      rowSelection
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex: pagination.page, pageSize: pagination.limit }) : updater
      updatePagination({
        page: newPagination.pageIndex,
        limit: newPagination.pageSize
      })
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(tableSorting) : updater
      if (newSorting.length === 0) {
        updateSorting(undefined)
      } else {
        const sort = newSorting[0]
        updateSorting({
          field: sort.id,
          order: sort.desc ? 'desc' : 'asc'
        })
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection
  })

  useEffect(() => {
    if (enableSelection && onRowSelect) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
      onRowSelect(selectedRows)
    }
  }, [rowSelection, enableSelection, onRowSelect, table])

  useEffect(() => {
    if (onDataChange) {
      onDataChange(data)
    }
  }, [data, onDataChange])

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>Lỗi: {error}</p>
        <button
          onClick={refetch}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2563eb'
          }}
          onMouseOut={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3b82f6'
          }}
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className={className}>
      {enableSearch && <TableSearch value={globalFilter} onChange={setGlobalFilter} placeholder={searchPlaceholder} />}

      {enableFiltering && (
        <div
          style={{
            marginBottom: '1rem',
            display: 'flex',
            gap: '0.5rem'
          }}
        >
          <button
            onClick={resetFilters}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.875rem',
              backgroundColor: '#e5e7eb',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#d1d5db' // hover:bg-gray-300
            }}
            onMouseOut={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e5e7eb'
            }}
          >
            Reset bộ lọc
          </button>
          {/* Add your custom filters here */}
        </div>
      )}

      {loading && <Loading />}
      {!loading && (
        <>
          <div>
            <table className={`${tableClassName}`} style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className={headerClassName}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        style={{
                          border: '1px solid #d1d5db',
                          padding: '0.5rem 1rem',
                          textAlign: 'left',
                          backgroundColor: '#f9fafb',
                          width: header.getSize()
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              cursor: header.column.getCanSort() ? 'pointer' : 'default',
                              userSelect: 'none'
                            }}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <span style={{ marginLeft: '0.5rem' }}>
                                {header.column.getIsSorted() === 'asc' ? (
                                  <SortAsc />
                                ) : header.column.getIsSorted() === 'desc' ? (
                                  <SortDesc />
                                ) : (
                                  <ArrowUpDown />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f9fafb'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor = ''
                    }}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        style={{ border: '1px solid #d1d5db', padding: '0.5rem 1rem' }}
                        key={cell.id}
                        className={`${cellClassName}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6b7280' }}>{emptyMessage}</div>
          )}

          {enablePagination && totalPages > 0 && (
            <TablePagination
              currentPage={pagination.page}
              totalPages={totalPages}
              pageSize={pagination.limit}
              totalItems={totalItems}
              onPageSizeChange={(limit) => updatePagination({ limit, page: 0 })}
              pageSizeOptions={pageSizeOptions}
              onPageChange={(page) => updatePagination({ page })}
            />
          )}
        </>
      )}
    </div>
  )
}
