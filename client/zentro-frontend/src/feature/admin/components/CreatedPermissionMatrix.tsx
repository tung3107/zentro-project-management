import React, { useEffect, useState } from 'react'
import { Checkbox } from 'primereact/checkbox'
import { getPermissionAPI } from '../service/permission.service'

export interface Permission {
  permission_id: number
  action: string
  description: string
  permission_name: string
  resource: string
  RolePermission?: {
    permission_id: number
    role_id?: number
  }
}

interface GroupedPermissions {
  [resource: string]: Permission[]
}

export default function CreatedPermissionMatrix({
  selected,
  setSelected
}: {
  selected: number[]
  setSelected: React.Dispatch<React.SetStateAction<number[]>>
}) {
  const [permissions, setPermissions] = useState<GroupedPermissions>({})
  const [loading, setLoading] = useState(false)

  const handleToggle = (permission: Permission) => {
    const permId = permission.permission_id
    const resourcePerms = permissions[permission.resource]
    const viewPerm = resourcePerms.find((p) => p.action === 'read')

    const mustHaveReadActions = ['create', 'update', 'delete', 'comment', 'manage_members']

    let newSelected = [...selected]

    if (selected.includes(permId)) {
      newSelected = newSelected.filter((id) => id !== permId)

      // Nếu bỏ tick read → bỏ luôn các quyền phụ thuộc
      if (permission.action === 'read') {
        const dependentIds = resourcePerms
          .filter((p) => mustHaveReadActions.includes(p.action))
          .map((p) => p.permission_id)
        newSelected = newSelected.filter((id) => !dependentIds.includes(id))
      }
    } else {
      newSelected.push(permId)

      // Nếu tick quyền phụ thuộc → auto tick read
      if (
        mustHaveReadActions.includes(permission.action) &&
        viewPerm &&
        !newSelected.includes(viewPerm.permission_id)
      ) {
        newSelected.push(viewPerm.permission_id)
      }
    }

    setSelected(newSelected)
  }

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true)
        const response = await getPermissionAPI()
        setPermissions(response.data) // backend trả về grouped permissions
      } catch (err) {
        console.error('Error fetching permissions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  if (loading) {
    return <p>Đang tải danh sách quyền...</p>
  }

  return (
    <div className='border rounded-xl p-4 w-full'>
      <p className='text-gray-700 font-medium mb-3'>Phân quyền cho Role này</p>
      <div className='overflow-x-auto'>
        <table className='min-w-full border border-gray-200 text-sm'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='border px-3 py-2 text-left font-medium w-[100px]'>Chức năng</th>
              <th className='border px-3 py-2 text-center'>Comment</th>
              <th className='border px-3 py-2 text-center'>Quản lý</th>
              <th className='border px-3 py-2 text-center'>Xem</th>
              <th className='border px-3 py-2 text-center'>Tạo</th>
              <th className='border px-3 py-2 text-center'>Xóa</th>

              <th className='border px-3 py-2 text-center'>Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(permissions).map(([resource, perms]) => (
              <tr key={resource}>
                <td className='border px-3 py-2 font-medium text-gray-700'>
                  {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </td>
                {['comment', 'manage_members', 'read', 'create', 'delete', 'update'].map((action) => {
                  const perm = perms.find((p) => p.action === action)
                  return (
                    <td key={action} className='border px-3 py-2 text-center'>
                      {perm ? (
                        <Checkbox
                          inputId={`${resource}-${action}`}
                          checked={selected.includes(perm.permission_id)}
                          onChange={() => handleToggle(perm)}
                        />
                      ) : (
                        <Checkbox checked={false} disabled />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
