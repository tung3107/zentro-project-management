export interface User {
  user_id: string
  email: string
  first_name: string
  last_name: string
  role_id: string
  role?: Role
}

export interface Role {
  role_id: string
  role_name: string
  description?: string
  is_System: boolean
  permissions: Permission[]
}

export interface Permission {
  action: string
  resource: string
}
