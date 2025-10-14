import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Project } from '../../../types/project'
import { getProjectAPI } from '../../admin/service/project.service'
import { toast } from 'sonner'
import ProjectBadge from '../../admin/components/ProjectBadge'
import Dashboard from './Dashboard'
import { useAuthStore } from '../../auth/stores/authStore'
import Unauthorized from '../../../components/Unauthorized'

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>() // ✅ lấy param từ URL
  const { isUnauthorized } = useAuthStore()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (isUnauthorized) {
    return <Unauthorized />
  }

  return (
    <div>
      {project ? (
        <ProjectBadge projectId={project.project_id} projectName={project.project_name} imageUrl={project.avatar} />
      ) : (
        <span className='text-gray-500 text-sm italic'>
          {loading ? 'Đang tải thông tin dự án...' : 'Không tìm thấy dự án 😢'}
        </span>
      )}
      <Dashboard />
    </div>
  )
}
