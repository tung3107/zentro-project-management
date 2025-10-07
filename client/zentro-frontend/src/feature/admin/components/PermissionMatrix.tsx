import React from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'

export interface Role {
  role_id: number
  role_name: string
  description: string
  icon: string
  permissions?: {
    name: string
    allowed: boolean
  }[]
}

interface PermissionMatrixProps {
  roles: Role[]
}

export default function PermissionMatrix({ roles }: PermissionMatrixProps) {
  // Lấy tất cả permission
  const allPermissions = Array.from(new Set(roles.flatMap((r) => r.permissions.map((p) => p.name))))

  // Build dữ liệu cho bảng
  const tableData = allPermissions.map((perm) => {
    const row: any = { permission: perm }
    roles.forEach((role) => {
      const found = role.permissions.find((p) => p.name === perm)
      row[role.role_name] = found ? found.allowed : false
    })
    return row
  })

  // Render ✅ / ❌
  const permissionBody = (rowData: any, col: any) => {
    const allowed = rowData[col.field]
    return allowed ? (
      <Tag value='Cho phép' severity='success' className='px-3 py-1' />
    ) : (
      <Tag value='Không cho phép' severity='danger' className='px-3 py-1' />
    )
  }

  // Render header role (icon + name + desc)
  const roleHeader = (role: Role) => (
    <div className='flex flex-col items-center text-center'>
      <i className={`${role.icon} text-[#cb0404] text-lg mb-1`} />
      <span className='font-semibold'>{role.role_name}</span>
      <span className='text-xs text-gray-500'>{role.description}</span>
    </div>
  )

  return (
    <div className='card'>
      <h2 className='text-xl font-bold mb-4 text-[#cb0404]'>Permission Matrix</h2>
      <DataTable value={tableData} stripedRows showGridlines rowHover>
        <Column field='permission' header='Permission' frozen style={{ width: '250px' }} />
        {roles.map((role) => (
          <Column
            key={role.role_id}
            field={role.role_name}
            header={roleHeader(role)}
            body={permissionBody}
            alignHeader='center'
            style={{ textAlign: 'center', width: '220px' }}
          />
        ))}
      </DataTable>
    </div>
  )
}
