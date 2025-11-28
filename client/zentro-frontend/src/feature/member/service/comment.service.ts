import api from '../../../util/axiosClient'

export interface Comment {
  comment_id: number
  task_id: string
  user_id: string
  content: string
  created_at: string
  mentionedUsers?: Array<{
    user_id: string
    username: string
  }>
  mentionedTasks?: Array<{
    task_id: string
    title: string
  }>
}

export const getAllCommentsByTask = async (task_id: string): Promise<Comment[]> => {
  const response = await api.get(`/comments/task/${task_id}`)
  return response.data.data
}

export const postComment = async (task_id: string, content: string): Promise<Comment> => {
  const response = await api.post('/comments', { task_id, content })
  return response.data.data
}

export const updateComment = async (comment_id: number, content: string): Promise<Comment> => {
  const response = await api.put(`/comments/${comment_id}`, { content })
  return response.data.data
}

export const deleteComment = async (comment_id: number): Promise<void> => {
  await api.delete(`/comments/${comment_id}`)
}
