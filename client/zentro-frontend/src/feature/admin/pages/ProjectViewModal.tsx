import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { X } from 'lucide-react'
import { useState } from 'react'
import type { Project } from '../../../types/project'
import Dashboard from './Dashboard'
import ProjectBadge from '../components/ProjectBadge'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`

const ModalContainer = styled.div`
  background: white;

  width: 95%;
  height: 90%;
  padding: 0; /* bỏ padding ở đây, chuyển vào phần nội dung */
  position: relative;
  overflow-y: overlay;
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.4s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`

// 👇 Header cố định
const ModalHeader = styled.div`
  position: sticky; /* dính khi cuộn */
  top: 0;
  background: white;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
`

const CloseButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.15s ease;
  &:hover {
    transform: scale(1.1);
  }
`

const ModalContent = styled.div`
  padding: 0 30px 30px 30px;
`

export default function ProjectViewModal() {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [project] = useState<Project>({
    project_id: 'PRJ-246454',
    project_name: 'E-commerce website',
    description:
      'Chúng mình là hihi, một góc nhỏ xinh giữa thế giới online — nơi bạn tìm thấy những món đồ hợp gu, hữu dụng và dễ thương cho mọi ngày. ',
    start_date: '2025-10-08T06:00:55.000Z',
    end_date: '2025-10-29T17:00:00.000Z',
    status: 'ĐANG CHUẨN BỊ',
    priority: 2,
    avatar: null,
    createdAt: '2025-10-08T06:00:55.000Z',
    members: [
      {
        project_id: 'PRJ-246454',
        user_id: '2025823165',
        role_id: 7,
        is_delete: false,
        role: { role_name: 'Leader' },
        user: { user_id: '2025823165', first_name: 'Tung', last_name: 'Duong' }
      }
    ],
    leader_name: 'Tung Duong'
  })

  const handleClose = () => {
    navigate('/admin/projects')
  }

  return (
    <Backdrop onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ProjectBadge projectId={project.project_id} projectName={project.project_name} imageUrl={project.avatar} />
          <CloseButton onClick={handleClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <Dashboard />
        </ModalContent>
      </ModalContainer>
    </Backdrop>
  )
}
