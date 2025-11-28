import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  MessageSquare,
  Bot,
  ChevronRight
} from 'lucide-react'
import { Skeleton } from 'primereact/skeleton'
import { useAuthStore } from '../../auth/stores/authStore'
import { userProjectAPI } from '../../admin/service/project.service'
import type { Project } from '../../../types/project'
import ProjectAvatar from '../../../components/ProjectAvatar'
import Avatar from '../../../components/Avatar'

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle?: string
  color: string
  bgColor: string
}

const StatCard = ({ icon, title, value, subtitle, color, bgColor }: StatCardProps) => (
  <div className='bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200'>
    <div className='flex items-start justify-between'>
      <div className='flex-1'>
        <p className='text-sm font-medium text-gray-600 mb-1'>{title}</p>
        <h3 className='text-3xl font-bold text-gray-900 mb-1'>{value}</h3>
        {subtitle && <p className='text-xs text-gray-500'>{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <div style={{ color }}>{icon}</div>
      </div>
    </div>
  </div>
)

interface QuickActionProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  color: string
}

const QuickAction = ({ icon, title, description, onClick, color }: QuickActionProps) => (
  <button
    onClick={onClick}
    className='bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left w-full group'
  >
    <div className='flex items-start gap-4'>
      <div className={`p-3 rounded-lg`} style={{ backgroundColor: color + '15' }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className='flex-1'>
        <h4 className='font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors'>{title}</h4>
        <p className='text-sm text-gray-600'>{description}</p>
      </div>
      <ChevronRight size={20} className='text-gray-400 group-hover:text-blue-600 transition-colors' />
    </div>
  </button>
)

export default function HomePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.user_id) return
      try {
        setIsLoading(true)
        const res = await userProjectAPI(user.user_id)
        if (res?.data) setProjects(res.data)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [user?.user_id])

  const userName = user?.first_name || user?.last_name ? `${user.first_name} ${user.last_name}` : 'User'

  const quickActions = [
    {
      icon: <FolderKanban size={24} />,
      title: 'Xem dự án',
      description: 'Truy cập và quản lý các dự án của bạn',
      onClick: () => {
        // Navigate to first project if available
        if (projects.length > 0) {
          navigate(`/member/projects/${projects[0].project_id}`)
        }
      },
      color: '#3B82F6'
    },
    {
      icon: <MessageSquare size={24} />,
      title: 'Trò chuyện',
      description: 'Giao tiếp với nhóm và thành viên',
      onClick: () => navigate('/member/chat'),
      color: '#8B5CF6'
    },
    {
      icon: <Bot size={24} />,
      title: 'AI Chatbot',
      description: 'Trợ lý AI hỗ trợ công việc của bạn',
      onClick: () => navigate('/member/ai-chatbot'),
      color: '#10B981'
    }
  ]

  return (
    <div className='flex flex-col h-full' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className='px-6 py-6 bg-white rounded-xl border border-gray-200 mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Xin chào, <span className='text-blue-600'>{userName}</span>
            </h1>
            <p className='text-gray-600'>Chào mừng bạn trở lại! Đây là tổng quan về công việc của bạn.</p>
          </div>
          <div className='hidden md:block'>
            <Avatar avatarUrl={user?.avatar} name={userName} size={64} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <StatCard
          icon={<FolderKanban size={24} />}
          title='Tổng số dự án'
          value={projects.length}
          subtitle='Dự án bạn tham gia'
          color='#3B82F6'
          bgColor='bg-blue-50'
        />
        <StatCard
          icon={<Clock size={24} />}
          title='Nhiệm vụ đang làm'
          value='0'
          subtitle='Cần hoàn thành'
          color='#F59E0B'
          bgColor='bg-amber-50'
        />
        <StatCard
          icon={<CheckCircle2 size={24} />}
          title='Đã hoàn thành'
          value='0'
          subtitle='Tuần này'
          color='#10B981'
          bgColor='bg-green-50'
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          title='Hiệu suất'
          value='100%'
          subtitle='Tỷ lệ hoàn thành'
          color='#8B5CF6'
          bgColor='bg-purple-50'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1'>
        {/* Quick Actions */}
        <div className='lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Thao tác nhanh</h2>
          <div className='space-y-3'>
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </div>

        {/* My Projects */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 overflow-auto'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-bold text-gray-900'>Dự án của tôi</h2>
            <span className='text-sm font-medium text-gray-500'>{projects.length} dự án</span>
          </div>

          {isLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg'>
                  <Skeleton shape='circle' size='40px' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton width='70%' height='1rem' />
                    <Skeleton width='50%' height='0.75rem' />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8'>
              <img src='/Not Found.png' alt='No Projects' className='w-32 h-32 object-contain opacity-70 mb-4' />
              <p className='text-gray-500 text-sm text-center'>
                Bạn chưa được thêm vào dự án nào. <br />
                <span className='text-gray-400'>Liên hệ Admin để được thêm vào dự án.</span>
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {projects.map((project) => (
                <button
                  key={project.project_id}
                  onClick={() => navigate(`/member/projects/${project.project_id}`)}
                  className='w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group'
                >
                  <ProjectAvatar imageUrl={project.avatar} projectName={project.project_name} size={40} />
                  <div className='flex-1 text-left'>
                    <h4 className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate'>
                      {project.project_name}
                    </h4>
                    <p className='text-xs text-gray-500 truncate'>{project.project_key || project.project_id}</p>
                  </div>
                  <ChevronRight size={16} className='text-gray-400 group-hover:text-blue-600 transition-colors' />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
