import React, { useState, useEffect, useRef } from 'react'
import Avatar from '../../../components/Avatar'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export type MemberType = {
  user: {
    user_id: string
    first_name: string
    last_name: string
    email: string
    avatar: string
  }
  role: {
    role_name: string
    role_id: number
  }
}

export type RoleType = {
  role_name: string
  role_id: number
}

interface MemberListEditProps {
  value: MemberType[]
  roles: RoleType[]
  onChange: (members: MemberType[]) => void
  searchUsers: (keyword: string) => Promise<MemberType[]> // search API FE callback
}

export default function MemberListEdit({ value, roles, onChange, searchUsers }: MemberListEditProps) {
  const [editMode, setEditMode] = useState(false)
  const [members, setMembers] = useState<MemberType[]>(value)
  const [searchVal, setSearchVal] = useState('')
  const [suggest, setSuggest] = useState<MemberType[]>([])
  const [searching, setSearching] = useState(false)

  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Ẩn dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearching(false)
        setSearchVal('')
        setSuggest([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!editMode) setMembers(value)
  }, [editMode, value])

  // Search user API gọi vào đây
  useEffect(() => {
    if (!editMode || !searchVal.trim()) {
      setSuggest([])
      return
    }
    setSearching(true)
    const delay = setTimeout(() => {
      searchUsers(searchVal.trim())
        .then((users) => {
          // Nếu trả về mảng phẳng:
          const mapped = (users as any[]).map((u) => ({
            user: {
              user_id: u.user_id,
              email: u.email,
              first_name: u.first_name,
              last_name: u.last_name,
              avatar: u.avatar
            },
            role: {
              role_name: u['Role.role_name'] || 'User',
              role_id: u['Role.role_id']
            }
          }))
          setSuggest(mapped)
        })
        .finally(() => setSearching(false))
    }, 400)
    return () => clearTimeout(delay)
  }, [searchVal, editMode, members, searchUsers])

  const handleRemove = (id: string) => setMembers(members.filter((m) => m.user.user_id !== id))
  const handleAdd = (user: MemberType) => {
    setMembers([...members, user])
    setSearchVal('')
    setSuggest([])
  }
  const handleRole = (id: string, role: RoleType) =>
    setMembers(
      members.map((m) =>
        m.user.user_id === id ? { ...m, role: { ...m.role, role_name: role.role_name, role_id: role.role_id } } : m
      )
    )

  const handleSave = () => {
    const leaderCount = members.filter((m) => m.role.role_id === 7).length

    if (leaderCount > 1) {
      toast.error('Trong một dự án chỉ được có duy nhất 1 Leader')
      return
    }

    if (leaderCount < 1) {
      toast.error('Trong một dự án phải có 1 Leader')
      return
    }

    setEditMode(false)
    onChange(members)
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-semibold text-base'>Thành viên dự án</h3>
        <button
          type='button'
          className='border px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-sm'
          onClick={() => setEditMode((e) => !e)}
        >
          {editMode ? 'Hủy' : 'Chỉnh sửa'}
        </button>
      </div>
      {editMode && (
        <div className='mb-3 relative' ref={dropdownRef}>
          <input
            className='border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-0'
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder='Tìm kiếm thành viên để thêm...'
            autoFocus
          />
          {editMode && (searching || suggest.length > 0 || searchVal.trim()) && (
            <div className='absolute mt-1 p-3 w-full rounded-lg shadow bg-white border z-10 max-h-60 overflow-y-auto'>
              {searching && <span className='block p-3 text-sm text-gray-400 text-center'>Đang tìm...</span>}

              {!searching &&
                suggest.length > 0 &&
                suggest.map((u) => {
                  const isAdded = !!(u.user && members.some((m) => m?.user?.user_id === u.user.user_id))
                  return (
                    <div
                      key={u.user?.user_id || Math.random()}
                      className={`flex items-center gap-2 px-3 py-2 transition ${
                        !isAdded ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() =>
                        !isAdded &&
                        handleAdd({ ...u, role: { role_name: roles[0].role_name, role_id: roles[0].role_id } })
                      }
                    >
                      <Avatar
                        avatarUrl={u.user?.avatar}
                        name={`${u.user?.first_name ?? ''} ${u.user?.last_name ?? ''}`}
                        size={28}
                      />
                      <div className='flex flex-col'>
                        <span className='font-medium text-md'>
                          {u.user?.first_name} {u.user?.last_name}
                        </span>
                        <span className='text-md text-gray-500'>
                          {u.user?.email} • ID: {u.user?.user_id}
                        </span>
                      </div>
                      {isAdded && <span className='ml-auto text-xs text-green-600 font-medium'>(Đã thêm)</span>}
                    </div>
                  )
                })}

              {!searching && suggest.length === 0 && searchVal.trim() && (
                <span className='block p-3 text-sm text-red-500 text-center'>Không tìm thấy kết quả</span>
              )}
            </div>
          )}
        </div>
      )}
      <div className='flex flex-col gap-2'>
        {members.map((m) => (
          <div
            key={m.user.user_id}
            className='flex items-center py-2 gap-2'
            style={{ borderBottom: '1px solid #e3e3e3' }}
          >
            <Avatar avatarUrl={m.user.avatar} name={`${m.user.first_name} ${m.user.last_name}`} size={36} />
            <div className='flex-1 ml-2'>
              <div className='font-medium'>
                {m.user.first_name} {m.user.last_name}
              </div>
              <div className='flex flex-wrap items-center gap-1 text-sm'>
                <span className='text-gray-500'>{m.user.email}</span>
                <span className='text-gray-400'>• ID: {m.user.user_id}</span>
              </div>
            </div>
            {editMode && (
              <>
                <select
                  value={m.role.role_id ?? ''}
                  className='border px-2 py-1 mr-1 rounded text-sm'
                  onChange={(e) => {
                    const selectedId = Number(e.target.value) // hoặc String tuỳ role_id là gì
                    const selectedRole = roles.find((r) => r.role_id === selectedId)
                    handleRole(m.user.user_id, {
                      role_id: selectedRole?.role_id ?? roles[0].role_id,
                      role_name: selectedRole?.role_name ?? roles[0].role_name
                    })
                  }}
                >
                  {roles.map((role) => (
                    <option value={role.role_id} key={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>

                <div className='p-2 rounded-lg border border-red-300'>
                  <Trash2
                    className='w-4 h-4 cursor-pointer  hover:scale-110 transition-transform text-red-500'
                    onClick={() => handleRemove(m.user.user_id ?? '')}
                    strokeWidth={1.5}
                  />
                </div>
              </>
            )}
            {!editMode && (
              <span className='ml-auto px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'>
                {m.role.role_name}
              </span>
            )}
          </div>
        ))}
      </div>
      {editMode && (
        <div className='flex justify-end mt-3'>
          <button
            className='bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700'
            type='button'
            onClick={handleSave}
          >
            Lưu thông tin
          </button>
        </div>
      )}
    </div>
  )
}
