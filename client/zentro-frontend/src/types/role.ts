export interface Role {
  role_id: number
  role_name: string
  description: string
  permissions?: {
    description: string
    permission_name: string
  }
  [key: string]: unknown
}
