import React, { useState, useEffect } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Skeleton } from 'primereact/skeleton'
import styled from 'styled-components'
import type { ProjectWithRolePermissions } from '../service/projectrole.service'
import { getAllProjectsWithRolePermissionsAPI } from '../service/projectrole.service'
import { toast } from 'sonner'

const StyledContainer = styled.div`
  font-family: 'Space Grotesk', sans-serif;

  .header-section {
    margin-bottom: 2rem;

    h2 {
      color: #cb0404;
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    p {
      color: #666;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .search-box {
      max-width: 400px;

      .p-inputtext {
        width: 100%;
        padding: 0.75rem;
        border-radius: 8px;
      }
    }
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .project-card {
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    border-radius: 12px;
    overflow: hidden;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(203, 4, 4, 0.15);
      border-color: #cb0404;
    }

    .p-card-body {
      padding: 1.5rem;
    }

    .p-card-title {
      color: #1c272d;
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .p-card-content {
      padding: 0;
    }

    .role-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #f8f9fa;
      color: #495057;
      border: 1px solid #dee2e6;
    }

    .view-button {
      margin-top: 1rem;
      width: 100%;
    }
  }

  .no-results {
    text-align: center;
    padding: 3rem;
    color: #666;

    i {
      font-size: 3rem;
      color: #dee2e6;
      margin-bottom: 1rem;
    }

    p {
      font-size: 1rem;
      margin-top: 0.5rem;
    }
  }

  .skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
`

interface Props {
  onSelectProject: (project: ProjectWithRolePermissions) => void
}

export default function ProjectListForRolePermission({ onSelectProject }: Props) {
  const [projects, setProjects] = useState<ProjectWithRolePermissions[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithRolePermissions[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(
        (project) =>
          project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.project_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProjects(filtered)
    }
  }, [searchTerm, projects])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await getAllProjectsWithRolePermissionsAPI()
      setProjects(response.data)
      setFilteredProjects(response.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Lỗi khi tải danh sách dự án!')
    } finally {
      setLoading(false)
    }
  }

  const renderSkeleton = () => (
    <div className='skeleton-grid'>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <Skeleton width='100%' height='2rem' className='mb-3' />
          <Skeleton width='60%' height='1rem' className='mb-2' />
          <Skeleton width='80%' height='1rem' className='mb-2' />
          <Skeleton width='100%' height='2.5rem' />
        </Card>
      ))}
    </div>
  )

  return (
    <StyledContainer>
      <div className='header-section'>
        <h2>Quản lý Quyền Theo Dự Án</h2>
        <p>Chọn dự án để xem và chỉnh sửa quyền của các role trong dự án đó</p>

        <div className='search-box'>
          <span className='p-input-icon-left w-full'>
            <i className='pi pi-search' />
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Tìm kiếm dự án...'
            />
          </span>
        </div>
      </div>

      {loading ? (
        renderSkeleton()
      ) : filteredProjects.length === 0 ? (
        <div className='no-results'>
          <i className='pi pi-inbox' />
          <p>{searchTerm ? 'Không tìm thấy dự án phù hợp' : 'Chưa có dự án nào'}</p>
        </div>
      ) : (
        <div className='projects-grid'>
          {filteredProjects.map((project) => (
            <Card key={project.project_id} className='project-card' onClick={() => onSelectProject(project)}>
              <div className='p-card-title'>
                <i className='pi pi-briefcase' style={{ color: '#cb0404' }} />
                {project.project_name}
              </div>
              <div className='p-card-content'>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>ID: {project.project_id}</div>
                <div className='role-badges'>
                  {project.roles.map((role) => (
                    <span key={role.role_id} className='role-badge'>
                      {role.role_name}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </StyledContainer>
  )
}
