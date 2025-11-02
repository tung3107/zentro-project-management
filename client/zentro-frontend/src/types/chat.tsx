export interface Message {
  message_id: number
  chat_id?: number
  sender_id: string
  senderName?: string
  senderAvatar?: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'video' | 'system'
  file_url?: string
  file_name?: string
}

export interface Chat {
  chat_id: number
  name: string
  avatar?: string
  is_group: boolean
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
  members?: string[]
  memberDetails?: Array<{
    user_id: string
    name: string
    avatar?: string
    email?: string
  }>
  chat_color?: string
  created_by?: string
  created_at?: Date
  isBlocked?: boolean
  blockedBy?: string | null
  iBlockedThem?: boolean
  theyBlockedMe?: boolean
}

export interface MediaFile {
  media_file_id: number
  url: string
  name: string
  type: 'image' | 'file' | 'video'
  timestamp: Date
}

export const mockChats: Chat[] = [
  {
    chat_id: 1,
    name: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?img=1',
    is_group: false,
    lastMessage: 'Hẹn gặp lại bạn nhé!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    chat_color: '#cb0404'
  },
  {
    chat_id: 2,
    name: 'Team Dev',
    avatar: 'https://i.pravatar.cc/150?img=2',
    is_group: true,
    lastMessage: 'Meeting lúc 3pm nhé các bạn',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 5,
    members: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'],
    chat_color: '#2574ff'
  },
  {
    chat_id: 3,
    name: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/150?img=3',
    is_group: false,
    lastMessage: 'Cảm ơn bạn nhiều!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0,
    chat_color: '#f37121'
  }
]

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      message_id: 1,
      sender_id: '1',
      senderName: 'Nguyễn Văn A',
      content: 'Chào bạn! Dự án tiến triển thế nào rồi?',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      type: 'text'
    },
    {
      message_id: 2,
      sender_id: 'me',
      senderName: 'Tôi',
      content: 'Dự án đang tiến triển tốt, sắp hoàn thành rồi!',
      timestamp: new Date(Date.now() - 1000 * 60 * 8),
      type: 'text'
    },
    {
      message_id: 3,
      sender_id: '1',
      senderName: 'Nguyễn Văn A',
      content: 'Tuyệt vời! Hẹn gặp lại bạn nhé!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'text'
    }
  ],
  '2': [
    {
      message_id: 4,
      sender_id: '2',
      senderName: 'Trần Thị B',
      content: 'Xin chào team!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      type: 'text'
    },
    {
      message_id: 5,
      sender_id: '3',
      senderName: 'Lê Văn C',
      content: 'Meeting lúc 3pm nhé các bạn',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: 'text'
    }
  ]
}

export const mockMediaFiles: Record<string, MediaFile[]> = {
  '1': [
    {
      media_file_id: 1,
      url: 'https://picsum.photos/200/200?random=1',
      name: 'image1.jpg',
      type: 'image',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
    },
    {
      media_file_id: 2,
      url: 'document.pdf',
      name: 'project-proposal.pdf',
      type: 'file',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48)
    }
  ]
}
