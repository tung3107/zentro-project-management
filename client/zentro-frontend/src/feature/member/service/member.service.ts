import api from '../../../util/axiosClient'
import type { User } from '../../../types/user'

export interface MemberData {
  user: {
    user_id: string
    first_name: string
    last_name: string
    email: string
    avatar?: string
  }
  role: {
    role_id: number
    role_name: string
  }
}

export interface Role {
  role_id: number
  role_name: string
  description?: string
}

// Get all members in a project
export const getMembersByProject = async (projectId: string) => {
  const response = await api.get(`/members/${projectId}`)
  return response.data
}

// Get members for dropdown (simplified format)
export const getMembersForDropdown = async (projectId: string) => {
  const response = await api.get(`/members/dropdown/${projectId}`)
  return response.data
}

// Search members in a project
export const searchMembersByProject = async (projectId: string, query: string) => {
  const response = await api.get(`/members/search/${projectId}`, {
    params: { q: query }
  })
  return response.data
}

// Add members to project
export const addMembersToProject = async (projectId: string, members: MemberData[]) => {
  const response = await api.post('/members', {
    project_id: projectId,
    members
  })
  return response.data
}

// Update project members
export const updateProjectMembers = async (projectId: string, members: MemberData[]) => {
  const response = await api.put('/members', {
    project_id: projectId,
    members
  })
  return response.data
}

// Check if user has permission to manage members
export const checkMemberPermission = async (projectId: string) => {
  const response = await api.get(`/members/permission/${projectId}`)
  return response.data
}

// Get available users to add to project (not already in project)
export const getAvailableUsers = async (projectId: string, search?: string) => {
  const response = await api.get(`/members/available/${projectId}`, {
    params: { search }
  })
  return response.data
}

// Get roles for project members
export const getProjectRoles = async () => {
  const response = await api.get('/roles/project')
  return response.data
}
