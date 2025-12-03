import React, { useEffect, useState, useRef } from 'react'
import Avatar from '../../../../components/Avatar'
import { formatTime } from '../../../../util/helper'
import { getAllCommentsByTask, deleteComment } from '../../service/comment.service'
import type { Comment } from '../../service/comment.service'
import { Link } from 'react-router-dom'
import api from '../../../../util/axiosClient'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../../auth/stores/authStore'
import CommentEditor from './CommentEditor'
import { useParams } from 'react-router-dom'
import ConfirmModal from '../../../../components/ConfirmModal'

interface CommentWithUser extends Comment {
  user?: {
    user_id: string
    first_name: string
    last_name: string
    avatar?: string
  }
}

interface CommentListProps {
  taskId: string
  reload: boolean
}

interface MentionPopupData {
  type: 'user' | 'task'
  data: any
  position: { x: number; y: number }
  commentId: number
  mentionElement: HTMLElement
}

const CommentList: React.FC<CommentListProps> = ({ taskId, reload }) => {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [mentionPopup, setMentionPopup] = useState<MentionPopupData | null>(null)
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const { user } = useAuthStore()
  const { projectId } = useParams<{ projectId: string }>()
  const menuRef = useRef<HTMLDivElement>(null)
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchComments = async () => {
    try {
      setLoading(true)
      const data = await getAllCommentsByTask(taskId)
      setComments(data as CommentWithUser[])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [taskId, reload])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current)
    }
  }, [])

  const handleMentionHover = async (e: React.MouseEvent, type: 'user' | 'task', id: string, commentId: number) => {
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current)

    const mentionElement = e.currentTarget as HTMLElement

    popupTimeoutRef.current = setTimeout(async () => {
      try {
        const rect = mentionElement.getBoundingClientRect()
        const position = {
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY + 5
        }

        if (type === 'user') {
          const res = await api.get(`/users/${id}`)
          setMentionPopup({ type: 'user', data: res.data.data, position, commentId, mentionElement })
        } else if (type === 'task') {
          const res = await api.get(`/tasks/${id}`)
          setMentionPopup({ type: 'task', data: res.data.data, position, commentId, mentionElement })
        }
      } catch (error) {
        console.error('Error fetching mention data:', error)
      }
    }, 300)
  }

  const handleMentionLeave = () => {
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current)
    // Don't close immediately - let the popup handle its own hover
  }

  const handleDeleteClick = (commentId: number) => {
    setCommentToDelete(commentId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return

    try {
      await deleteComment(commentToDelete)
      setComments(comments.filter((c) => c.comment_id !== commentToDelete))
      setActiveMenu(null)
      setCommentToDelete(null)
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Không thể xóa bình luận. Vui lòng thử lại.')
    }
  }

  const handleEditComment = (commentId: number) => {
    setEditingCommentId(commentId)
    setActiveMenu(null)
  }

  const handleUpdateComment = async () => {
    setEditingCommentId(null)
    fetchComments()
  }

  const renderCommentContent = (content: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const mentionElements = doc.querySelectorAll('.mention')

    mentionElements.forEach((mention) => {
      const isUser = mention.classList.contains('user-mention')
      const isTask = mention.classList.contains('task-mention')

      if (isUser) {
        const userId = mention.getAttribute('data-user')
        mention.setAttribute(
          'class',
          'inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 bg-blue-100 text-blue-700 rounded text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors mention-hover'
        )
        mention.setAttribute('data-type', 'user')
        mention.setAttribute('data-id', userId || '')
      } else if (isTask) {
        const taskId = mention.getAttribute('data-task-id')
        mention.setAttribute(
          'class',
          'inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 bg-purple-100 text-purple-700 rounded text-sm font-medium cursor-pointer hover:bg-purple-200 transition-colors mention-hover'
        )
        mention.setAttribute('data-type', 'task')
        mention.setAttribute('data-id', taskId || '')
      }
    })

    return doc.body.innerHTML
  }

  const handleMentionClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('mention-hover') || target.closest('.mention-hover')) {
      const mentionEl = target.classList.contains('mention-hover') ? target : target.closest('.mention-hover')
      const type = mentionEl?.getAttribute('data-type')
      const id = mentionEl?.getAttribute('data-id')

      if (type === 'user' && id) {
        window.location.href = `/member/profile/${id}`
      } else if (type === 'task' && id) {
        // Navigate to task detail if needed
        // window.location.href = `/member/tasks/${id}`
      }
    }
  }

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
      {comments.map((c) => {
        const userName = c.user ? `${c.user.first_name} ${c.user.last_name}` : 'Unknown User'
        const userAvatar = c.user?.avatar
        const isOwner = user?.user_id === c.user_id
        const isEditing = editingCommentId === c.comment_id

        return (
          <div key={c.comment_id} className='flex items-start gap-3 group'>
            <div className='w-10 h-10 rounded-full border overflow-hidden flex-shrink-0'>
              <Avatar name={userName} size={40} avatarUrl={userAvatar} />
            </div>

            {isEditing ? (
              <div className='flex-1'>
                <CommentEditor
                  placeholder='Chỉnh sửa bình luận...'
                  onSubmit={handleUpdateComment}
                  projectId={projectId || ''}
                  initialContent={c.content}
                  commentId={c.comment_id}
                  onCancel={() => setEditingCommentId(null)}
                />
              </div>
            ) : (
              <div className='bg-gray-50 rounded-xl p-3 flex-1 relative border border-gray-200 transition-all hover:border-gray-300'>
                <div className='flex justify-between items-center mb-1'>
                  <Link
                    to={`/member/profile/${c?.user?.user_id}`}
                    className='text-sm font-semibold text-gray-800 hover:text-blue-600 hover:underline transition-colors'
                  >
                    {c?.user?.first_name} {c.user?.last_name}
                  </Link>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-500'>{formatTime(new Date(c.created_at))}</span>
                    {isOwner && (
                      <div className='relative' ref={activeMenu === c.comment_id ? menuRef : null}>
                        <button
                          onClick={() => setActiveMenu(activeMenu === c.comment_id ? null : c.comment_id)}
                          className='p-1 rounded hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100'
                          title='Tùy chọn'
                        >
                          <MoreVertical size={16} className='text-gray-600' />
                        </button>
                        {activeMenu === c.comment_id && (
                          <div className='absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[140px] py-1'>
                            <button
                              onClick={() => handleEditComment(c.comment_id)}
                              className='w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
                            >
                              <Edit2 size={14} />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => handleDeleteClick(c.comment_id)}
                              className='w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors'
                            >
                              <Trash2 size={14} />
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className='text-sm prose max-w-none'
                  dangerouslySetInnerHTML={{ __html: renderCommentContent(c.content) }}
                  onClick={handleMentionClick}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLElement
                    if (target.classList.contains('mention-hover') || target.closest('.mention-hover')) {
                      const mentionEl = target.classList.contains('mention-hover')
                        ? target
                        : target.closest('.mention-hover')
                      const type = mentionEl?.getAttribute('data-type') as 'user' | 'task'
                      const id = mentionEl?.getAttribute('data-id')
                      if (type && id) {
                        handleMentionHover(e, type, id, c.comment_id)
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement
                    const relatedTarget = e.relatedTarget as HTMLElement

                    // Only hide if not moving to the popup
                    if (target.classList.contains('mention-hover') || target.closest('.mention-hover')) {
                      if (!relatedTarget?.closest('.mention-popup')) {
                        handleMentionLeave()
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        )
      })}

      {/* Mention Popup */}
      {mentionPopup && (
        <div
          className='fixed z-[10000] bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-72 mention-popup'
          style={{
            top: `${mentionPopup.position.y}px`,
            left: `${mentionPopup.position.x}px`
          }}
          onMouseEnter={() => {
            if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current)
          }}
          onMouseLeave={() => {
            setMentionPopup(null)
          }}
        >
          {mentionPopup.type === 'user' ? (
            <div className='flex items-start gap-3'>
              <Avatar
                name={`${mentionPopup.data.first_name} ${mentionPopup.data.last_name}`}
                size={48}
                avatarUrl={mentionPopup.data.avatar}
              />
              <div className='flex-1 min-w-0'>
                <div className='font-semibold text-gray-900 truncate'>
                  {mentionPopup.data.first_name} {mentionPopup.data.last_name}
                </div>
                <div className='text-sm text-gray-500 truncate'>{mentionPopup.data.email}</div>
                <div className='text-xs text-gray-400 mt-1'>ID: {mentionPopup.data.user_id}</div>
                <Link
                  to={`/member/profile/${mentionPopup.data.user_id}`}
                  className='text-xs text-blue-600 hover:underline mt-2 inline-block'
                >
                  View Profile →
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className='font-semibold text-gray-900 mb-1'>Task: {mentionPopup.data.task_id}</div>
              <div className='text-sm text-gray-700 mb-2'>{mentionPopup.data.title}</div>
              {mentionPopup.data.description && (
                <div className='text-xs text-gray-500 line-clamp-2 mb-2'>
                  {mentionPopup.data.description.replace(/<[^>]*>/g, '')}
                </div>
              )}
              {mentionPopup.data.status && (
                <div className='flex items-center gap-2 text-xs'>
                  <div
                    className='w-2.5 h-2.5 rounded-full'
                    style={{ backgroundColor: mentionPopup.data.status.color }}
                  />
                  <span className='text-gray-600'>{mentionPopup.data.status.status_name}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title='Xóa bình luận'
        message='Bạn có chắc chắn muốn xóa bình luận này?'
        confirmText='Xóa'
        confirmButtonColor='bg-red-600 hover:bg-red-700'
      />
    </div>
  )
}

export default CommentList
