import styled from 'styled-components'
import AdminNavigation from '../components/AdminNavigation'
import { type Project } from '../../../types/project'
import ReusableTable from '../../../components/ReusableTable'
import { useState, type ReactNode } from 'react'
import OverlayRightModal from '../../../components/OverlayRightModal'
import EditProjectCom from '../components/EditProjectCom'
import Status from '../../../components/Status'
import OverlayCenterModal from '../../../components/OverlayCenterModal'
import { deleteProjectAPI } from '../service/project.service'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../auth/hooks/useAuth'
import AddProjectCom from '../components/AddProjectCom'

const ContentLayout = styled.div`
  padding: 30px 40px;
`

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

export default function Project() {
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

  const openAddModal = (content: ReactNode) => {
    setAddModalOpen(true)
    setAddModalContent(content)
  }

  const closeAddModal = () => {
    setAddModalContent(null)
    setAddModalOpen(false)
  }

  const handleDelete = (project: Project) => {
    setSelectedProjectId(project.project_id)
    openDeleteModal(
      <>
        <h2 className='title'>Bạn chắc chắn chưa?</h2>
        <p className='subtitle'>{`Bạn muốn xóa dự án ${project.project_name}`}</p>
      </>
    )
  }

  const handleAdd = () => {
    openAddModal(
      <AddProjectCom
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
        await deleteProjectAPI(selectedProjectId)

        closeDeleteModal()
        setReloadKey((prev) => prev + 1)
        toast.success('Xóa dự án thành công')
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi thay đổi thông tin dự án!')
      }
    } else {
      console.log('hihi', selectedProjectId)
    }
  }

  const handleView = (project: Project) => {
    openModal(
      <EditProjectCom
        project={project}
        setModalOpen={setModalOpen}
        setModalContent={setModalContent}
        onSuccess={() => setReloadKey((prev) => prev + 1)}
      />,
      'Sửa thông tin dự án'
    )
  }

  return (
    <ContentLayout>
      <div className='main-content-header'>
        <AdminNavigation />

        <ReusableTable<Project>
          key={reloadKey}
          apiEndPoint='/projects'
          addButtonContent='Tạo dự án'
          title='Dự án'
          onAdd={handleAdd}
          showGridlines={true}
          columns={[
            { field: 'project_id', header: 'ID', width: '30px' },
            {
              field: 'project_name',
              header: 'Project',
              sortable: true,
              className: 'font-bold text-blue-500',
              clickableFields: ['project_name']
            },

            {
              field: 'leader_name',
              header: 'Leader/PM',
              sortable: true,
              filterable: true,
              filterType: 'dropdown',
              apiEndPoint: '/users/leader',
              placeholder: 'leader',
              apiQuery: 'leader_id',
              width: '30px',
              body: (row) => (row.members && row.members.length > 0 ? row.leader_name : 'N/A')
            },

            {
              field: 'start_date',
              header: 'Ngày bắt đầu',
              sortable: true,
              width: '30px',
              body: (row: unknown) => formatDate(row.start_date)
            },

            {
              field: 'end_date',
              header: 'Ngày kết thúc',
              sortable: true,
              width: '30px',
              body: (row: unknown) => formatDate(row.end_date)
            },
            {
              field: 'status',
              header: 'Trạng thái',
              sortable: true,
              filterable: true,
              filterType: 'dropdown',
              apiQuery: 'status',
              body: (row: unknown) => <Status center={true} status={row.status} />
            }
          ]}
          onView={(row) => handleView(row)}
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
        title='Xác nhận'
        formable={false}
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
        title='Tạo dự án'
        width='700px'
      >
        {addModalContent}
      </OverlayCenterModal>
    </ContentLayout>
  )
}
