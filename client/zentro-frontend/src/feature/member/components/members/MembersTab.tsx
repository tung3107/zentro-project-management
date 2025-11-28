import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Skeleton } from 'primereact/skeleton'
import MembersView from './MembersView'
import AddMemberModal from './AddMemberModal'
import type { MemberData, Role } from '../../service/member.service'
import {
  getMembersByProject,
  addMembersToProject,
  updateProjectMembers,
  getAvailableUsers,
  getProjectRoles
} from '../../service/member.service'
import type { User } from '../../../../types/user'
import OverlayCenterModal from '../../../../components/OverlayCenterModal'
import { useAuthStore } from '../../../auth/stores/authStore'
import { useProjectRole } from '../../hooks/useProjectRole'

export default function MembersTab() {
  const { projectId } = useParams<{ projectId: string }>()
  const [members, setMembers] = useState<MemberData[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null)
  const [canManageMembers, setCanManageMembers] = useState(false)

  const { permissions, isLoading: roleLoading } = useProjectRole()

  useEffect(() => {
    if (!roleLoading) {
      setCanManageMembers(permissions.isLeader)
    }
  }, [permissions, roleLoading])

  useEffect(() => {
    if (projectId) {
      loadMembers()
      loadRoles()
    }
  }, [projectId])

  const loadMembers = async () => {
    setIsLoading(true)
    try {
      const response = await getMembersByProject(projectId!)

      // Transform the response to match MemberData format
      const transformedMembers: MemberData[] = response.data.map((item: any) => ({
        user: {
          user_id: item.user.user_id,
          first_name: item.user.first_name,
          last_name: item.user.last_name,
          email: item.user.email,
          avatar: item.user.avatar
        },
        role: {
          role_id: item.role.role_id,
          role_name: item.role.role_name
        }
      }))

      setMembers(transformedMembers)
    } catch (error: any) {
      console.error('Failed to load members:', error)
      // Only show error if user has read permission (otherwise they wouldn't see this page)
      if (error.response?.status !== 403) {
        toast.error('Không thể tải danh sách thành viên')
      }
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await getProjectRoles()
      setRoles(response.data || [])
    } catch (error) {
      console.error('Failed to load roles:', error)
      toast.error('Không thể tải danh sách vai trò')
    }
  }

  const handleAddMembers = async (newMembers: MemberData[]) => {
    if (!canManageMembers) {
      toast.error('Bạn không có quyền thêm thành viên')
      return
    }

    try {
      await addMembersToProject(projectId!, newMembers)
      toast.success(`Đã thêm ${newMembers.length} thành viên vào dự án`)
      loadMembers()
    } catch (error: any) {
      console.error('Failed to add members:', error)
      if (error.response?.status === 403) {
        toast.error('Bạn không có quyền thêm thành viên')
      } else {
        toast.error(error.response?.data?.error?.message || 'Không thể thêm thành viên')
      }
    }
  }

  const handleRemoveMember = (userId: string) => {
    setMemberToDelete(userId)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return

    if (!canManageMembers) {
      toast.error('Bạn không có quyền xóa thành viên')
      setDeleteModalOpen(false)
      setMemberToDelete(null)
      return
    }

    try {
      // Remove the member from the list
      const updatedMembers = members.filter((m) => m.user.user_id !== memberToDelete)
      await updateProjectMembers(projectId!, updatedMembers)

      toast.success('Đã xóa thành viên khỏi dự án')
      setMembers(updatedMembers)
      setDeleteModalOpen(false)
      setMemberToDelete(null)
    } catch (error: any) {
      console.error('Failed to remove member:', error)
      if (error.response?.status === 403) {
        toast.error('Bạn không có quyền xóa thành viên')
      } else {
        toast.error(error.response?.data?.error?.message || 'Không thể xóa thành viên')
      }
    }
  }

  const handleUpdateRole = async (userId: string, roleId: number) => {
    if (!canManageMembers) {
      toast.error('Bạn không có quyền thay đổi vai trò')
      return
    }

    try {
      // Update the member's role in the list
      const updatedMembers = members.map((m) =>
        m.user.user_id === userId
          ? {
              ...m,
              role: {
                role_id: roleId,
                role_name: roles.find((r) => r.role_id === roleId)?.role_name || m.role.role_name
              }
            }
          : m
      )

      // Check if there's exactly one leader
      const leaderCount = updatedMembers.filter((m) => m.role.role_name.toLowerCase() === 'leader').length

      if (leaderCount > 1) {
        toast.error('Trong một dự án chỉ được có duy nhất 1 Leader')
        return
      }

      if (leaderCount < 1) {
        toast.error('Trong một dự án phải có 1 Leader')
        return
      }

      await updateProjectMembers(projectId!, updatedMembers)
      setMembers(updatedMembers)
      toast.success('Đã cập nhật vai trò thành viên')
    } catch (error: any) {
      console.error('Failed to update role:', error)
      if (error.response?.status === 403) {
        toast.error('Bạn không có quyền thay đổi vai trò')
      } else {
        toast.error(error.response?.data?.error?.message || 'Không thể cập nhật vai trò')
      }
    }
  }

  const memberToDeleteData = members.find((m) => m.user.user_id === memberToDelete)

  return (
    <div className='flex flex-col h-full' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className='px-6 py-4 bg-white border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>Quản lý thành viên</h2>
            <p className='text-sm text-gray-500 mt-1'>Quản lý thành viên tham gia dự án</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-hidden'>
        {isLoading ? (
          <div className='p-6 space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='bg-white rounded-xl border border-gray-200 p-4'>
                  <div className='flex items-start gap-3 mb-3'>
                    <Skeleton shape='circle' size='48px' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton width='70%' height='1.25rem' />
                      <Skeleton width='90%' height='0.875rem' />
                      <Skeleton width='50%' height='0.75rem' />
                    </div>
                  </div>
                  <Skeleton width='100%' height='2rem' className='mt-3' />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <MembersView
            members={members}
            roles={roles}
            onAddMember={() => setShowAddModal(true)}
            onRemoveMember={handleRemoveMember}
            onUpdateRole={handleUpdateRole}
            canManageMembers={canManageMembers}
          />
        )}
      </div>

      {/* Add member modal */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMembers}
        roles={roles}
        projectName={projectName || projectId || 'Dự án'}
        currentMembers={members}
      />

      {/* Delete confirmation modal */}
      <OverlayCenterModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setMemberToDelete(null)
        }}
        setModalOpen={setDeleteModalOpen}
        setModalContent={() => {}}
        onSubmit={handleDeleteConfirm}
        title='Xác nhận xóa thành viên'
        formable={false}
      >
        <div>
          <h2 className='title'>Bạn chắc chắn chưa?</h2>
          {memberToDeleteData && (
            <p className='subtitle'>
              Bạn muốn xóa thành viên{' '}
              <strong>
                {memberToDeleteData.user.first_name} {memberToDeleteData.user.last_name}
              </strong>{' '}
              khỏi dự án
            </p>
          )}
        </div>
      </OverlayCenterModal>
    </div>
  )
}
