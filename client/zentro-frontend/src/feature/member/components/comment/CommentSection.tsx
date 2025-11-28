import React, { useState } from 'react'
import Avatar from '../../../../components/Avatar'
import CommentList from './CommentList'
import TaskActivityLog from './TaskActivityLog'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../../../auth/stores/authStore'
import { postComment } from '../../service/comment.service'
import CommentEditor from './CommentEditor'
import { useProjectRole } from '../../hooks/useProjectRole'
import { toast } from 'sonner'

interface CommentSectionProps {
  taskId: string
  currentUser: {
    id: string
    name: string
    avatar?: string
  }
}

const CommentSection: React.FC<CommentSectionProps> = ({ taskId }) => {
  const [reload, setReload] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'comment' | 'activity'>('comment')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuthStore()

  const { permissions } = useProjectRole()

  const handleSubmit = async (content: string) => {
    if (!permissions.canComment) {
      toast.error('Bạn không có quyền comment trong dự án này')
      return
    }
    if (!content.trim()) return

    try {
      setIsSubmitting(true)
      await postComment(taskId, content)
      setReload((prev) => !prev)
    } catch (error) {
      console.error('Error posting comment:', error)
      alert('Failed to post comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <h3 className='font-semibold mb-4 text-lg text-gray-900'>Activity</h3>

      {/* Tab Navigation */}
      <div className='flex gap-1 mb-4 border-b border-gray-200'>
        <button
          onClick={() => setActiveTab('comment')}
          className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded-t-md relative ${
            activeTab === 'comment'
              ? 'text-blue-600 border border-blue-600 border-b-0 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 border border-transparent border-b-0'
          }`}
        >
          Bình luận
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded-t-md relative ${
            activeTab === 'activity'
              ? 'text-blue-600 border border-blue-600 border-b-0 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 border border-transparent border-b-0'
          }`}
        >
          Hoạt động
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'comment' ? (
        <>
          <div className='flex items-start gap-3 mb-6'>
            <div className='w-10 h-10 rounded-full border overflow-hidden flex-shrink-0'>
              <Avatar name={`${user?.first_name} ${user?.last_name}`} size={40} avatarUrl={user?.avatar} />
            </div>

            <div className='flex-1'>
              <CommentEditor
                placeholder='Viết bình luận... Sử dụng @ để tag người hoặc # để tag task'
                onSubmit={handleSubmit}
                projectId={projectId || ''}
                key={reload ? 'reload' : 'initial'}
              />
            </div>
          </div>

          <div className='mt-6'>
            <CommentList taskId={taskId} reload={reload} />
          </div>
        </>
      ) : (
        <div className='mt-2'>{projectId && taskId && <TaskActivityLog projectId={projectId} taskId={taskId} />}</div>
      )}
    </div>
  )
}

export default CommentSection
