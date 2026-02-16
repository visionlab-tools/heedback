export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    perPage: number
    lastPage: number
  }
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  errors: Array<{
    message: string
    field?: string
    rule?: string
  }>
}

export type SortDirection = 'asc' | 'desc'

export interface PaginationParams {
  page?: number
  perPage?: number
}
