import React, { useEffect, type Dispatch, type SetStateAction } from 'react'
import type { MemberType, RoleType } from './MemberListEdit'
import { getRoleForProjectAPI } from '../service/role.service'
import { toast } from 'sonner'
import { searchUserAPI } from '../service/user.service'
import MemberListEdit from './MemberListEdit'

export default function Step3Com({
  members,
  memberRoles,
  setMemberRoles,
  setMembers,
  errors
}: {
  members: MemberType[]
  memberRoles: RoleType[]
  setMemberRoles: Dispatch<SetStateAction<RoleType[]>>
  setMembers: (members: MemberType[]) => void
  errors: Record<string, string>
}) {
  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getRoleForProjectAPI()
        setMemberRoles(res.data ?? [])
      } catch (err) {
        toast.error('Không lấy được roles!')
      }
    }
    fetchRoles()
  }, [setMemberRoles])

  const searchUsers = async (kw: string) => {
    const res = await searchUserAPI(kw)
    return res.data
  }
  return (
    <div className='mt-[24px]'>
      <MemberListEdit
        value={members}
        roles={memberRoles}
        onChange={setMembers}
        searchUsers={searchUsers}
        isAddedNew={true}
      />
      <p style={{ fontSize: '12px', fontWeight: '400', lineHeight: '150%', width: '40%' }} className='text-gray-600'>
        Sau khi tạo dựa án thành công, một nhóm chat của dự án sẽ được tạo với tên của dự án
      </p>
      {errors.members && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.members}</p>}
    </div>
  )
}
