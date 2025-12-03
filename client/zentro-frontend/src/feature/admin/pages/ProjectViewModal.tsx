import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Project } from '../../../types/project'
import Dashboard from '../../member/pages/Dashboard'
import ProjectBadge from '../components/ProjectBadge'
import { getProjectAPI } from '../service/project.service'
import { toast } from 'sonner'

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
  width: 100%;
  height: 100%;
  padding: 0;
  position: relative;
  overflow-y: overlay;
  border-radius: 0;
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

const ModalHeader = styled.div`
  position: sticky;
  top: 0;
  background: white;
  z-index: 90;
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
  const { projectId } = useParams<{ projectId: string }>() // ✅ lấy param từ URL

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const handleClose = () => {
    navigate('/admin/projects')
  }

  useEffect(() => {
    async function fetchData() {
      if (!projectId) return
      try {
        setLoading(true)
        const res = await getProjectAPI(projectId)
        if (res?.data) {
          setProject(res.data)
        } else {
          toast.error('Không tìm thấy dự án!')
        }
      } catch (err) {
        console.error(err)
        toast.error('Không lấy được thông tin dự án!')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [projectId])

  return (
    <Backdrop onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          {project && (
            <ProjectBadge projectId={project.project_id} projectName={project.project_name} imageUrl={project.avatar} />
          )}
          <CloseButton onClick={handleClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          {loading ? (
            <p className='text-gray-500 text-sm italic'>Đang tải dữ liệu...</p>
          ) : project ? (
            <Dashboard />
          ) : (
            <p className='text-gray-500 text-sm italic'>Không có dữ liệu để hiển thị.</p>
          )}
        </ModalContent>
      </ModalContainer>
    </Backdrop>
  )
}
