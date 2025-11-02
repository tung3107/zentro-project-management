import { Ban, ShieldOff } from 'lucide-react'

interface BlockedChatUIProps {
  chatName: string
  iBlockedThem: boolean
  theyBlockedMe: boolean
  onUnblock: () => void
}

export default function BlockedChatUI({ chatName, iBlockedThem, theyBlockedMe, onUnblock }: BlockedChatUIProps) {
  if (iBlockedThem) {
    // Bạn đã block người khác
    return (
      <div className='p-6 border-t border-gray-200 bg-gray-50'>
        <div className='flex flex-col items-center justify-center gap-4 py-4'>
          <div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center'>
            <Ban size={32} className='text-red-500' />
          </div>
          <div className='text-center'>
            <p className='text-gray-700 font-medium mb-1'>Bạn đã chặn {chatName}</p>
            <p className='text-gray-500 text-sm'>Bạn sẽ không thể nhận tin nhắn từ người này cho đến khi bỏ chặn</p>
          </div>
          <button
            onClick={onUnblock}
            className='px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2'
          >
            <ShieldOff size={18} />
            Bỏ chặn
          </button>
        </div>
      </div>
    )
  }

  if (theyBlockedMe) {
    // Người khác đã block bạn
    return (
      <div className='p-6 border-t border-gray-200 bg-gray-50'>
        <div className='flex flex-col items-center justify-center gap-4 py-4'>
          <div className='w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center'>
            <Ban size={32} className='text-gray-400' />
          </div>
          <div className='text-center'>
            <p className='text-gray-700 font-medium mb-1'>Bạn không thể gửi tin nhắn</p>
            <p className='text-gray-500 text-sm'>Bạn không thể gửi tin nhắn hoặc gọi cho {chatName}</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
