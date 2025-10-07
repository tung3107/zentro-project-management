import { useCallback, useEffect, useState } from 'react'
import type { TableFilters, TablePagination, TableSorting, ServerResponse } from '../types/table'
import api from '../util/axiosClient'

export function useTable<T>(
  apiEndpoint: string,
  initialFilters: TableFilters = {},
  initialSorting?: TableSorting,
  initialSearch = '',
  pageSize = 10
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [pagination, setPagination] = useState<TablePagination>({
    page: 0, // default la 0
    limit: pageSize
  })

  const [sorting, setSorting] = useState<TableSorting | undefined>(initialSorting)
  const [filters, setFilters] = useState<TableFilters>(initialFilters)
  const [globalFilter, setGlobalFilter] = useState(initialSearch) /// search

  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const getData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: (pagination.page + 1).toString(),
        limit: pagination.limit.toString()
      })

      console.log(params.toString())

      if (sorting) {
        params.append('sortBy', sorting.field)
        params.append('sortOrder', sorting.order.toUpperCase())
      }
      if (globalFilter) {
        params.append('search', globalFilter)
      }

      console.log(filters)

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            params.append(key, value.join(','))
          } else {
            params.append(key, value.toString())
          }
        }
      })

      const response = await api.get(`${apiEndpoint}?${params.toString()}`)

      const result: ServerResponse<T> = response.data

      if (result.status === 'success') {
        setData(result.data)
        setTotalItems(result.pagination.totalItems)
        setTotalPages(result.pagination.totalPages)
      } else {
        throw new Error('Không lấy được data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, pagination, sorting, filters, globalFilter])

  useEffect(() => {
    getData()
  }, [getData])

  const refetch = useCallback(() => {
    getData()
  }, [getData])

  const updatePagination = useCallback((newPagination: Partial<TablePagination>) => {
    setPagination((prev) => ({ ...prev, ...newPagination }))
  }, [])

  const updateSorting = useCallback((newSorting: TableSorting | undefined) => {
    setSorting(newSorting)
  }, [])

  const updateFilters = useCallback((newFilters: Partial<TableFilters>) => {
    setFilters((preps) => ({ ...preps, ...newFilters }))
    setPagination((prev) => ({ ...prev, page: 0 }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    setGlobalFilter(initialSearch)
    setPagination((prev) => ({ ...prev, page: 0 }))
  }, [initialFilters, initialSearch])

  return {
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
  }
}
