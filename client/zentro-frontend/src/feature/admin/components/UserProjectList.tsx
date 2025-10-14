import React, { useEffect, useState } from 'react'
import Avatar from '../../../components/Avatar'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react' // hoặc bất cứ icon nào bạn thích
import { userProjectAPI } from '../service/project.service'
import type { Project } from '../../../types/project'
import Status from '../../../components/Status'

export default function UserProjectList({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const fetchProjects = async () => {
      try {
        const res = await userProjectAPI(userId) // hoặc axios.get(...)
        if (mounted) setProjects(res.data)
      } catch (error) {
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()

    return () => {
      mounted = false
    }
  }, [userId])

  return (
    <div className='py-4'>
      {loading && <div className='text-gray-500'>Đang tải dự án...</div>}
      {!loading && projects.length === 0 && (
        <div className='text-sm italic text-gray-400'>Chưa tham gia dự án nào.</div>
      )}
      <div className='space-y-3'>
        {projects.map((p) => (
          <div
            key={p.project_id}
            className='flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow transition'
          >
            {p.avatar ? (
              <img src={p.avatar} alt='avatar' className='w-12 h-12 rounded-lg object-cover bg-gray-200' />
            ) : (
              <Avatar name={p.project_name} avatarUrl={p.avatar} size={48} />
            )}
            <div className='flex flex-col min-w-0  '>
              <span className='text-base font-medium text-blue-600 truncate'>{p.project_name}</span>

              {p.members?.[0]?.role?.role_name && (
                <span className='text-sm text-gray-500 truncate'>
                  Role:{' '}
                  <span className='text-sm mt-0.5 font-large text-green-600 italic'>{p.members[0].role.role_name}</span>
                </span>
              )}

              <div>
                <Status center={false} status={p.status} />
              </div>
            </div>
            <button
              className='ml-auto flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition'
              onClick={() => navigate(`/admin/projects/${p.project_id}`)}
              title='Xem chi tiết dự án'
            >
              <span>Xem chi tiết</span>
              <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
