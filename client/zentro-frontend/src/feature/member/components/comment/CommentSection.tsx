import React, { useRef, useState } from 'react'
import JoditEditor from 'jodit-react'
import Avatar from '../../../../components/Avatar'
import CommentList from './CommentList'
import DescriptionEditor from '../../../../components/DescriptionEditor'

interface CommentSectionProps {
  taskId: string
  currentUser: {
    id: string
    name: string
    avatar?: string
  }
}

const CommentSection: React.FC<CommentSectionProps> = ({ taskId, currentUser }) => {
  const editor = useRef<JoditEditor | null>(null)
  const [content, setContent] = useState<string>('')
  const [reload, setReload] = useState<boolean>(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    // 🧪 Mock POST API
    await new Promise((resolve) => setTimeout(resolve, 500))

    // sau này đổi thành axios.post("/api/comments", { ... })
    setContent('')
    setReload((prev) => !prev) // trigger reload list
  }

  return (
    <div>
      <h3 className='font-semibold mb-4 text-lg text-gray-900'>Bình luận</h3>

      <div className='flex items-start gap-3 mb-4'>
        <Avatar name='he' className='w-10 h-10 rounded-full border' avatarUrl='https://i.pravatar.cc/40' />

        <div className='flex-1'>
          <div className='border border-gray-400 rounded-md hover:border-gray-500 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all bg-white mb-3'>
            <DescriptionEditor
              placeholder='We support markdown! Try **bold**, `inline code`, or ``` for code blocks.'
              className='w-full'
              value={content}
              height={200}
              onChange={(val) => setContent(val)}
            />
          </div>

          <div className='flex justify-end'>
            <button
              onClick={handleSubmit}
              className='flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer'
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Gửi
            </button>
          </div>
        </div>
      </div>

      <div className='mt-6'>
        <CommentList taskId={taskId} reload={reload} />
      </div>
    </div>
  )
}

export default CommentSection
