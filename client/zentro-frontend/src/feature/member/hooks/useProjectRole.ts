import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../../auth/stores/authStore'

export type ProjectRole = 'Trưởng nhóm' | 'Nhân viên' | 'Người xem' | null

export interface ProjectPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canAccessReports: boolean
  canCreateTask: boolean
  role: ProjectRole
  isLeader: boolean
  isEmployee: boolean
  isViewer: boolean
  canCreateSprint: boolean
  canDragTaskSprint: boolean
  canCompleteSprint: boolean
  canDeleteSprint: boolean
  canComment: boolean
}

export const useProjectRole = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { user, projectPermissions } = useAuthStore()
  const [permissions, setPermissions] = useState<ProjectPermissions>({
    canView: false,
    canEdit: false,
    canDelete: false,
    canAccessReports: false,
    canCreateTask: false,
    role: null,
    isLeader: false,
    isEmployee: false,
    isViewer: false,
    canCreateSprint: false,
    canDragTaskSprint: false,
    canCompleteSprint: false,
    canDeleteSprint: false,
    canComment: false
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const mapPermissions = () => {
      if (!projectId || !user?.user_id || !projectPermissions) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const projectPerms = projectPermissions[projectId]
      if (!projectPerms) {
        // Không có permission cho project này
        setPermissions((prev) => ({ ...prev }))
        setIsLoading(false)
        return
      }

      // Nếu full access (Trưởng nhóm đặc biệt)
      if (projectPerms.__full_access) {
        setPermissions({
          canView: true,
          canEdit: true,
          canDelete: true,
          canAccessReports: true,
          canCreateTask: true,
          role: 'Trưởng nhóm',
          isLeader: true,
          isEmployee: false,
          isViewer: false,
          canCreateSprint: true,
          canDragTaskSprint: true,
          canCompleteSprint: true,
          canDeleteSprint: true,
          canComment: true
        })
        setIsLoading(false)
        return
      }

      // Map từ API dạng: { resource: { action: boolean } } => FE props
      const get = (res: string, act: string) => !!projectPerms[res]?.[act]

      const role: ProjectRole = projectPerms.role ?? null
      const isLeader = role === 'Trưởng nhóm'
      const isEmployee = role === 'Nhân viên'
      const isViewer = role === 'Người xem'

      setPermissions({
        canView: true, // Tất cả đều view được
        canEdit: get('task', 'update') || false,
        canDelete: get('task', 'delete') || false,
        canAccessReports: get('report', 'view') || false,
        canCreateTask: get('task', 'create') || false,
        role,
        isLeader,
        isEmployee,
        isViewer,
        canCreateSprint: get('sprint', 'create') || false,
        canDragTaskSprint: get('sprint', 'drag') || false,
        canCompleteSprint: get('sprint', 'complete') || false,
        canDeleteSprint: get('sprint', 'delete') || false,
        canComment: get('comment', 'comment') || false
      })

      setIsLoading(false)
    }

    mapPermissions()
  }, [projectId, user?.user_id, projectPermissions])

  return { permissions, isLoading }
}
