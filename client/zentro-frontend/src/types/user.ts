export interface User {
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role_id?: number
  role_name?: string
  Role: {
    role_name: string
  }
  // num_of_mem: number
  avatar?: string | File
  [key: string]: unknown
}
