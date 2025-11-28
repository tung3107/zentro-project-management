import React, { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Checkbox } from 'primereact/checkbox'
import { Button } from 'primereact/button'
import { toast } from 'sonner'
import type { ProjectWithRolePermissions, PermissionUpdate } from '../service/projectrole.service'
import { updateProjectRolePermissionsAPI } from '../service/projectrole.service'
import styled from 'styled-components'

const StyledContainer = styled.div`
  font-family: 'Space Grotesk', sans-serif;

  .p-datatable {
    .p-datatable-header {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      padding: 1rem;
    }

    .p-datatable-thead > tr > th {
      background: #f8f9fa;
      color: #495057;
      font-weight: 600;
      border: 1px solid #dee2e6;
      padding: 0.75rem;
    }

    .p-datatable-tbody > tr > td {
      border: 1px solid #dee2e6;
      padding: 0.75rem;
    }

    .p-datatable-tbody > tr:hover {
      background: #f8f9fa;
    }
  }

  .role-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;

    .role-name {
      font-weight: 600;
      color: #cb0404;
      font-size: 14px;
    }

    .role-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 12px;
      background: #fff3cd;
      color: #856404;
    }

    .role-badge.full-access {
      background: #d4edda;
      color: #155724;
    }
  }

  .permission-cell {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .save-button {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }

  .project-header {
    margin-bottom: 1.5rem;
    h3 {
      color: #cb0404;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    p {
      color: #666;
      font-size: 0.875rem;
    }
  }
`

interface Props {
  project: ProjectWithRolePermissions
  onBack: () => void
}

export default function ProjectRolePermissionMatrix({ project, onBack }: Props) {
  const [permissionMatrix, setPermissionMatrix] = useState<any[]>([])
  const [changes, setChanges] = useState<Map<string, PermissionUpdate>>(new Map())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    buildPermissionMatrix()
  }, [project])

  const buildPermissionMatrix = () => {
    // Get all unique permissions from roles
    const allPermissions = new Set<string>()
    const permissionMap = new Map<string, any>()

    project.roles.forEach((role) => {
      role.permissions.forEach((perm) => {
        const key = `${perm.resource}_${perm.action}`
        allPermissions.add(key)
        if (!permissionMap.has(key)) {
          permissionMap.set(key, {
            permission_id: perm.permission_id,
            resource: perm.resource,
            action: perm.action,
            description: perm.description,
            permission_name: perm.permission_name
          })
        }
      })
    })

    // Build matrix data
    const matrixData = Array.from(allPermissions).map((key) => {
      const permInfo = permissionMap.get(key)!
      const row: any = {
        key,
        ...permInfo
      }

      // Add each role's permission status
      project.roles.forEach((role) => {
        const perm = role.permissions.find((p) => p.permission_id === permInfo.permission_id)
        row[`role_${role.role_id}`] = {
          forbidden: perm?.forbidden ?? true,
          full_access: role.full_access ?? false,
          role_id: role.role_id,
          permission_id: permInfo.permission_id
        }
      })

      return row
    })

    // Sort by resource and action
    matrixData.sort((a, b) => {
      if (a.resource !== b.resource) {
        return a.resource.localeCompare(b.resource)
      }
      return a.action.localeCompare(b.action)
    })

    setPermissionMatrix(matrixData)
  }

  const handlePermissionChange = (role_id: number, permission_id: number, currentForbidden: boolean) => {
    const key = `${role_id}_${permission_id}`
    const newChanges = new Map(changes)

    newChanges.set(key, {
      role_id,
      permission_id,
      forbidden: !currentForbidden // Toggle
    })

    setChanges(newChanges)

    // Update local state for immediate UI feedback
    setPermissionMatrix((prev) =>
      prev.map((row) => {
        if (row.permission_id === permission_id) {
          return {
            ...row,
            [`role_${role_id}`]: {
              ...row[`role_${role_id}`],
              forbidden: !currentForbidden
            }
          }
        }
        return row
      })
    )
  }

  const handleSave = async () => {
    if (changes.size === 0) {
      toast.info('Không có thay đổi nào để lưu')
      return
    }

    try {
      setLoading(true)
      const updates = Array.from(changes.values())
      await updateProjectRolePermissionsAPI(project.project_id, updates)
      toast.success('Cập nhật quyền thành công!')
      setChanges(new Map())
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Lỗi khi cập nhật quyền!')
    } finally {
      setLoading(false)
    }
  }

  const roleHeader = (role: any) => (
    <div className='role-header'>
      <span className='role-name'>{role.role_name}</span>
      {role.full_access && <span className='role-badge full-access'>Toàn quyền</span>}
    </div>
  )

  const permissionBody = (rowData: any, field: string) => {
    const data = rowData[field]
    if (!data) return null

    const { forbidden, full_access, role_id, permission_id } = data

    // Trưởng nhóm cannot be changed
    if (full_access) {
      return (
        <div className='permission-cell'>
          <Checkbox checked={true} disabled />
        </div>
      )
    }

    return (
      <div className='permission-cell'>
        <Checkbox checked={!forbidden} onChange={() => handlePermissionChange(role_id, permission_id, forbidden)} />
      </div>
    )
  }

  const resourceBody = (rowData: any) => {
    return (
      <div>
        <div style={{ fontWeight: 600 }}>{rowData.resource}</div>
        <div style={{ fontSize: '0.75rem', color: '#666' }}>{rowData.action}</div>
      </div>
    )
  }

  const descriptionBody = (rowData: any) => {
    return <div style={{ fontSize: '0.875rem' }}>{rowData.description}</div>
  }

  return (
    <StyledContainer>
      <div className='project-header'>
        <Button icon='pi pi-arrow-left' text onClick={onBack} className='mb-3' label='Quay lại danh sách dự án' />
        <h3>{project.project_name}</h3>
        <p>Quản lý quyền của các role trong dự án này</p>
      </div>

      <DataTable value={permissionMatrix} stripedRows showGridlines rowHover scrollable scrollHeight='500px'>
        <Column field='resource' header='Chức năng' body={resourceBody} frozen style={{ minWidth: '180px' }} />
        <Column field='description' header='Mô tả' body={descriptionBody} style={{ minWidth: '250px' }} />
        {project.roles.map((role) => (
          <Column
            key={role.role_id}
            field={`role_${role.role_id}`}
            header={roleHeader(role)}
            body={(rowData) => permissionBody(rowData, `role_${role.role_id}`)}
            alignHeader='center'
            style={{ textAlign: 'center', minWidth: '150px' }}
          />
        ))}
      </DataTable>

      {changes.size > 0 && (
        <div className='save-button'>
          <Button
            label={`Lưu thay đổi (${changes.size})`}
            icon='pi pi-save'
            onClick={handleSave}
            loading={loading}
            severity='success'
          />
        </div>
      )}
    </StyledContainer>
  )
}
