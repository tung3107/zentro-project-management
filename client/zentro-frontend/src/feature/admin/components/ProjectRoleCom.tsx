import { Divider } from 'primereact/divider'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import React, { useState, type ReactNode } from 'react'
import ReusableTable from '../../../components/ReusableTable'
import OverlayCenterModal from '../../../components/OverlayCenterModal'
import AddRoleCom, { type Role } from './AddRoleCom'
import EditRoleCom from './EditRoleCom'
import { deleteProjectRole } from '../service/role.service'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../auth/hooks/useAuth'

const PermissionTags = ({ permissions }: { permissions: any[] }) => {
  const [expanded, setExpanded] = useState(false)
  const visible = permissions.slice(0, 3)
  const hidden = permissions.slice(3)

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {(expanded ? permissions : visible).map((perm, i) => (
        <Tag
          key={i}
          value={perm.description}
          severity='info'
          rounded
          className='!text-[13px] !px-2 !py-[2px]'
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        />
      ))}
      {hidden.length > 0 && (
        <Button
          text
          label={expanded ? 'Thu gọn' : `+${hidden.length}`}
          className='!p-0 !text-sm text-blue-500 hover:underline'
          onClick={() => setExpanded(!expanded)}
        />
      )}
    </div>
  )
}

export default function ProjectRoleCom() {
  const [reloadKey, setReloadKey] = useState(0)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalContent, setAddModalContent] = useState<React.ReactNode | null>(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editModalContent, setEditModalContent] = useState<React.ReactNode | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteModalContent, setDeleteModalContent] = useState<React.ReactNode | null>(null)

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)

  const openDeleteModal = (element: ReactNode) => {
    setDeleteModalContent(element)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setSelectedRoleId(null)
    setDeleteModalContent(null)
    setDeleteModalOpen(false)
  }

  const handleDelete = (role: Role) => {
    setSelectedRoleId(role.role_id)
    openDeleteModal(
      <>
        <h2 className='title'>Bạn chắc chắn chưa?</h2>
        <p className='subtitle'>{`Bạn muốn xóa role ${role.role_name}`}</p>
      </>
    )
  }

  const openAddModal = (content: ReactNode) => {
    setAddModalOpen(true)
    setAddModalContent(content)
  }

  const closeAddModal = () => {
    setAddModalContent(null)
    setAddModalOpen(false)
  }

  const openEditModal = (content: ReactNode) => {
    setEditModalOpen(true)
    setEditModalContent(content)
  }

  const closeEditModal = () => {
    setEditModalContent(null)
    setEditModalOpen(false)
  }

  const handleAdd = () => {
    openAddModal(
      <AddRoleCom
        setAddModalOpen={setAddModalOpen}
        setAddModalContent={setAddModalContent}
        onSuccess={() => setReloadKey((prev) => prev + 1)}
      />
    )
  }

  const handleEdit = (role: Role) => {
    openEditModal(
      <EditRoleCom
        role={role}
        setEditModalContent={setEditModalContent}
        setEditModalOpen={setEditModalOpen}
        onSuccess={() => setReloadKey((prev) => prev + 1)}
      />
    )
  }

  const handleDeleteConfirm = async () => {
    ///// called API in here
    if (selectedRoleId !== null) {
      try {
        await deleteProjectRole(selectedRoleId)

        closeDeleteModal()
        setReloadKey((prev) => prev + 1)
        toast.success('Xóa dự án thành công')
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi thay đổi thông tin dự án!')
      }
    } else {
      console.log('hihi', selectedRoleId)
    }
  }

  return (
    <>
      <ReusableTable<Role>
        key={reloadKey}
        apiEndPoint='/roles/project-role'
        addButtonContent='Thêm role'
        showGridlines
        onAdd={handleAdd}
        title='Role'
        columns={[
          { field: 'role_id', header: 'ID', width: '30px' },
          { field: 'role_name', header: 'Role', clickableFields: ['role_name'] },
          {
            field: 'permissions',
            header: 'Quyền hạn',
            body: (row: any) => <PermissionTags permissions={row.permissions || []} />,
            width: '30px'
          }
        ]}
        onEdit={(row) => handleEdit(row)}
        onDelete={(row) => handleDelete(row)}
        disableDeleteCondition={(row) => ['Leader', 'Developer', 'Tester', 'Viewer'].includes(row.role_name)}
      />
      <OverlayCenterModal
        formable={true}
        isOpen={addModalOpen}
        onClose={closeAddModal}
        setModalOpen={setAddModalOpen}
        setModalContent={setAddModalContent}
        onSubmit={handleAdd}
        title='Tạo role'
        width='650px'
      >
        {addModalContent}
      </OverlayCenterModal>

      <OverlayCenterModal
        formable={true}
        isOpen={editModalOpen}
        onClose={closeEditModal}
        setModalOpen={setEditModalOpen}
        setModalContent={setEditModalContent}
        onSubmit={handleAdd}
        title='Sửa role'
        width='650px'
      >
        {editModalContent}
      </OverlayCenterModal>
      <OverlayCenterModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        setModalOpen={setDeleteModalOpen}
        setModalContent={setDeleteModalContent}
        onSubmit={handleDeleteConfirm}
        title='Xác nhận'
        formable={false}
      >
        {deleteModalContent}
      </OverlayCenterModal>
    </>
  )
}
