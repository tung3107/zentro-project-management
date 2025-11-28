import api from '../../../util/axiosClient'

export interface ProjectRolePermission {
  permission_id: number
  permission_name: string
  resource: string
  action: string
  description: string
  forbidden: boolean
  prp_id?: number | null
}

export interface RolePermissionData {
  role_id: number
  role_name: string
  full_access?: boolean
  permissions: ProjectRolePermission[]
}

export interface ProjectWithRolePermissions {
  project_id: string
  project_name: string
  roles: RolePermissionData[]
}

export interface PermissionUpdate {
  role_id: number
  permission_id: number
  forbidden: boolean
}

export const getAllProjectsWithRolePermissionsAPI = async () => {
  const response = await api.get(`/permission/project/admin-matrix`)
  return response.data
}

export const updateProjectRolePermissionsAPI = async (project_id: string, updates: PermissionUpdate[]) => {
  const response = await api.put(`/permission/project/admin-matrix`, {
    project_id,
    updates
  })
  return response.data
}
