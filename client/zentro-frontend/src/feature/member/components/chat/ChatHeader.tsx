import { MoreVertical } from 'lucide-react'
import type { Chat } from '../../../../types/chat'
import Avatar from '../../../../components/Avatar'
import { useAuthStore } from '../../../auth/stores/authStore'

export default function ChatHeader({ chat, onToggleSettings }: { chat: Chat; onToggleSettings: () => void }) {
  const { user } = useAuthStore()

  // Lấy email của người đang chat (cho chat 1-1)
  const getOtherUserEmail = () => {
    if (chat.is_group || !chat.memberDetails) return null
    const otherUser = chat.memberDetails.find((m) => m.user_id !== user?.user_id)
    return otherUser?.email
  }

  return (
    <div className='h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white'>
      <div className='flex items-center gap-3'>
        <Avatar avatarUrl={chat.avatar} name={chat.name} size={34} />
        <div>
          <h2 className='font-semibold text-gray-900'>{chat.name}</h2>
          {chat.is_group && chat.members && <p className='text-xs text-gray-500'>{chat.members.length} thành viên</p>}
          {!chat.is_group && getOtherUserEmail() && <p className='text-xs text-gray-500'>{getOtherUserEmail()}</p>}
        </div>
      </div>
      <button onClick={onToggleSettings} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
        <MoreVertical size={20} className='text-gray-600' />
      </button>
    </div>
  )
}
