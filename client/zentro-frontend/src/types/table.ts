export type FilterType = 'text' | 'dropdown' | 'date' | 'daterange'

export interface ColumnMeta<T> {
  field: keyof T | string
  header: string
  sortable?: boolean
  className?: string
  filterable?: boolean
  body?: (row: T) => React.ReactNode
  clickableFields?: Array<string>
  filterType?: FilterType
  options?: any[]
  placeholder?: string

  width?: string
  apiEndPoint?: string
  apiQuery?: string | Array<string>
}

export interface TableProps<T> {
  apiEndPoint: string
  columns: ColumnMeta<T>[]
  defaultPageSize?: number
  queryParams?: Record<string, string | number | boolean>
  addButtonContent?: string
  customFilters?: React.ReactNode
  title?: string
  showGridlines?: boolean
  disableDeleteCondition?: (row: T) => boolean

  onAdd?: () => void
  onView?(row: T): void
  onEdit?(row: T): void
  onDelete?(row: T): void
}
