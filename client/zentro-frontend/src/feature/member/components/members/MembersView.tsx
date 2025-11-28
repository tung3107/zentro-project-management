import { useState } from 'react'
import Avatar from '../../../../components/Avatar'
import { UserPlus, Trash2, Search } from 'lucide-react'
import type { MemberData, Role } from '../../service/member.service'
import { useAuthStore } from '../../../auth/stores/authStore'

interface MembersViewProps {
  members: MemberData[]
  roles: Role[]
  onAddMember: () => void
  onRemoveMember: (userId: string) => void
  onUpdateRole: (userId: string, roleId: number) => void
  canManageMembers: boolean
}

export default function MembersView({
  members,
  roles,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
  canManageMembers
}: MembersViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { user: currentUser } = useAuthStore()

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.user.first_name} ${member.user.last_name}`.toLowerCase()
    const email = member.user.email.toLowerCase()
    const userId = member.user.user_id.toLowerCase()
    const query = searchQuery.toLowerCase()

    return fullName.includes(query) || email.includes(query) || userId.includes(query)
  })

  // Get role badge color
  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'leader':
      case 'project manager':
        return 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-200'
      case 'developer':
        return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200'
      case 'tester':
        return 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200'
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className='flex flex-col h-full bg-gray-50'>
      {/* Header with search and add button */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between gap-4'>
          {/* Search */}
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={18} />
            <input
              type='text'
              placeholder='Tìm kiếm thành viên theo tên, email hoặc ID...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
            />
          </div>

          {/* Member count */}
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-gray-700'>
              Tổng số thành viên: <span className='text-blue-600 font-semibold'>{members.length}</span>
            </span>
          </div>

          {/* Add member button (only for users with manage_members permission) */}
          {canManageMembers && (
            <button
              onClick={onAddMember}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md'
            >
              <UserPlus size={18} />
              Thêm thành viên
            </button>
          )}
        </div>
      </div>

      {/* Members grid */}
      <div className='flex-1 p-6 overflow-auto'>
        {filteredMembers.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200'>
            <div className='text-gray-400 mb-2'>
              <UserPlus size={48} />
            </div>
            <p className='text-gray-500 text-sm'>
              {searchQuery ? 'Không tìm thấy thành viên nào' : 'Chưa có thành viên nào trong dự án'}
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredMembers.map((member) => (
              <div
                key={member.user.user_id}
                className='bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200'
              >
                {/* Member header */}
                <div className='flex items-start gap-3 mb-3'>
                  <Avatar
                    avatarUrl={member.user.avatar}
                    name={`${member.user.first_name} ${member.user.last_name}`}
                    size={48}
                  />
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-gray-900 truncate'>
                      {member.user.first_name} {member.user.last_name}
                    </h3>
                    <p className='text-sm text-gray-500 truncate'>{member.user.email}</p>
                    <p className='text-xs text-gray-400 mt-0.5'>ID: {member.user.user_id}</p>
                  </div>
                </div>

                {/* Role and actions */}
                <div className='flex items-center justify-between gap-2 pt-3 border-t border-gray-100'>
                  {canManageMembers ? (
                    <>
                      <select
                        value={member.role.role_id}
                        onChange={(e) => onUpdateRole(member.user.user_id, Number(e.target.value))}
                        className='flex-1 px-2.5 py-1.5 text-xs font-medium border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        disabled={canManageMembers && member.user.user_id === currentUser?.user_id}
                      >
                        {roles.map((role) => (
                          <option key={role.role_id} value={role.role_id}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                      {!(canManageMembers && member.user.user_id === currentUser?.user_id) && (
                        <button
                          onClick={() => onRemoveMember(member.user.user_id)}
                          className='p-2 rounded-lg border border-red-300 hover:bg-red-50 transition-colors group'
                          title='Xóa thành viên'
                        >
                          <Trash2 className='w-4 h-4 text-red-500 group-hover:scale-110 transition-transform' />
                        </button>
                      )}
                    </>
                  ) : (
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full border shadow-sm ${getRoleBadgeColor(member.role.role_name)}`}
                    >
                      {member.role.role_name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
