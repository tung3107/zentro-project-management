import styled from 'styled-components'
import AdminNavigation from '../components/AdminNavigation'
import ReusableTable from '../../../components/ReusableTable'
import { useState, type ReactNode, type SetStateAction } from 'react'
import OverlayRightModal from '../../../components/OverlayRightModal'
import OverlayCenterModal from '../../../components/OverlayCenterModal'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../auth/hooks/useAuth'
import type { User } from '../../../types/user'
import EditUserCom from '../components/EditUserCom'
import { deleteUserAPI } from '../service/user.service'
import AddUserCom from '../components/AddUserCom'
import Avatar from '../../../components/Avatar'

const ContentLayout = styled.div`
  padding: 30px 40px;
`

export default function User() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null)
  const [modalTitle, setmodalTitle] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteModalContent, setDeleteModalContent] = useState<React.ReactNode | null>(null)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalContent, setAddModalContent] = useState<React.ReactNode | null>(null)

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const openModal = (content: ReactNode, title: string) => {
    setModalOpen(true)
    setModalContent(content)
    setmodalTitle(title)
  }

  const openAddModal = (content: ReactNode) => {
    setAddModalOpen(true)
    setAddModalContent(content)
  }

  const closeAddModal = () => {
    setAddModalContent(null)
    setAddModalOpen(false)
  }

  const closeModal = () => {
    setModalContent(null)
    setModalOpen(false)
    setmodalTitle('')
  }

  const openDeleteModal = (element: ReactNode) => {
    setDeleteModalContent(element)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setSelectedProjectId(null)
    setDeleteModalContent(null)
    setDeleteModalOpen(false)
  }

  const handleDelete = (user: User) => {
    setSelectedProjectId(user.user_id)
    openDeleteModal(
      <>
        <h2 className='title'>Bạn chắc chắn chưa?</h2>
        <p className='subtitle'>{`Bạn muốn xóa người dùng ${user.first_name} ${user.last_name}`}</p>
      </>
    )
  }

  const handleAdd = () => {
    openAddModal(
      <AddUserCom
        setAddModalOpen={setAddModalOpen}
        setAddModalContent={setAddModalContent}
        onSuccess={() => setReloadKey((prev) => prev + 1)}
      />
    )
  }

  const handleDeleteConfirm = async () => {
    ///// called API in here
    if (selectedProjectId !== null) {
      try {
        await deleteUserAPI(selectedProjectId)

        closeDeleteModal()
        setReloadKey((prev) => prev + 1)
        toast.success('Xóa thành công')
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi xóa!')
      }
    } else {
      console.log('hihi', selectedProjectId)
    }
  }

  const handleEdit = (user: User) => {
    openModal(
      <EditUserCom
        user={user}
        setModalOpen={setModalOpen}
        setModalContent={setModalContent}
        onSuccess={() => setReloadKey((prev) => prev + 1)}
      />,
      'Sửa thông tin user'
    )
  }

  return (
    <ContentLayout>
      <div className='main-content-header'>
        <AdminNavigation />

        <ReusableTable<User>
          key={reloadKey}
          apiEndPoint='/users'
          addButtonContent='Thêm người dùng'
          onAdd={handleAdd}
          showGridlines={true}
          title='User'
          columns={[
            { field: 'user_id', header: 'ID', width: '30px' },
            // {
            //   field: 'avatar',
            //   header: 'Ảnh',
            //   body: (row: unknown) => (row.avatar ? <Avatar avatarUrl={row.avatar} name='hihi' size={50} /> : 'N/A'),
            //   width: '30px'
            // },
            {
              field: 'first_name',
              header: 'Họ',
              sortable: true,
              clickableFields: ['first_name'],
              width: '30px'
            },
            { field: 'last_name', header: 'Tên', sortable: true, clickableFields: ['last_name'], width: '30px' },

            { field: 'email', header: 'Email' },

            {
              field: 'Role.role_name',
              header: 'Role hệ thống',
              sortable: true,
              filterable: true,
              filterType: 'dropdown',
              apiEndPoint: '/roles/system',
              apiQuery: 'role_id',
              placeholder: 'role',
              width: '50px'
            },

            {
              field: 'phone',
              header: 'Điện thoại',
              width: '50px'
            }
          ]}
          onEdit={(row) => handleEdit(row)}
          onDelete={(row) => handleDelete(row)}
        />
      </div>
      <OverlayRightModal modalTitle={modalTitle} isOpen={modalOpen} onClose={closeModal}>
        {modalContent}
      </OverlayRightModal>
      <OverlayCenterModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        setModalOpen={setDeleteModalOpen}
        setModalContent={setDeleteModalContent}
        onSubmit={handleDeleteConfirm}
        formable={false}
        title='Xác nhận'
      >
        {deleteModalContent}
      </OverlayCenterModal>
      <OverlayCenterModal
        formable={true}
        isOpen={addModalOpen}
        onClose={closeAddModal}
        setModalOpen={setAddModalOpen}
        setModalContent={setAddModalContent}
        onSubmit={handleAdd}
        title='Tạo user'
      >
        {addModalContent}
      </OverlayCenterModal>
    </ContentLayout>
  )
}
