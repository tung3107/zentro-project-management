import React, { useEffect, useState } from 'react'
import Avatar from '../../../../components/Avatar'

interface Comment {
  comment_id: number
  task_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  content: string
  created_at: string
}

interface CommentListProps {
  taskId: string
  reload: boolean
}

// 🕒 Hàm tính thời gian tương đối
const timeAgo = (d: Date | null) => {
  if (!d) return ''
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 5) return 'vừa xong'
  if (diff < 60) return `${diff}s`
  const m = Math.floor(diff / 60)
  if (m < 60) return `${m} phút`
  const h = Math.floor(m / 60)
  return `${h} giờ`
}

const CommentList: React.FC<CommentListProps> = ({ taskId, reload }) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // 🧪 Mock API GET comments
  const fetchComments = async (): Promise<Comment[]> => {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          {
            comment_id: 1,
            task_id: taskId,
            user_id: 'u1',
            user_name: 'Nguyễn Văn A',
            user_avatar: 'https://i.pravatar.cc/40?img=1',
            content: '<b>Đã xong phần UI rồi nhé!</b>',
            created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
          },
          {
            comment_id: 2,
            task_id: taskId,
            user_id: 'u2',
            user_name: 'Trần Thị B',
            user_avatar: 'https://i.pravatar.cc/40?img=2',
            content: 'Chờ API task nha 🚀',
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          }
        ])
      }, 800)
    )
  }

  useEffect(() => {
    setLoading(true)
    fetchComments().then((res) => {
      setComments(res)
      setLoading(false)
    })
  }, [taskId, reload])

  if (loading)
    return (
      <div className='space-y-4 animate-pulse'>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className='flex items-start gap-3'>
            <div className='w-9 h-9 bg-gray-300 rounded-full' />
            <div className='flex-1 space-y-2'>
              <div className='w-1/3 h-4 bg-gray-300 rounded' />
              <div className='w-3/4 h-3 bg-gray-200 rounded' />
            </div>
          </div>
        ))}
      </div>
    )

  if (!comments.length) return <p className='text-gray-500 italic text-sm'>Chưa có bình luận nào.</p>

  return (
    <div className='space-y-3'>
      {comments.map((c) => (
        <div key={c.comment_id} className='flex items-start gap-3'>
          <Avatar name='HE' className='w-10 h-10 rounded-full border' avatarUrl={'https://i.pravatar.cc/40'} />

          <div className='bg-gray-50 rounded-xl p-3 w-full'>
            <div className='flex justify-between items-center mb-1'>
              <span className='font-semibold text-sm'>{c.user_name}</span>
              <span className='text-xs text-gray-500'>{timeAgo(new Date(c.created_at))}</span>
            </div>
            <div className='text-sm prose max-w-none' dangerouslySetInnerHTML={{ __html: c.content }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default CommentList
