import axiosClient from '../../../util/axiosClient'
import type { Chat, Message } from '../../../types/chat'

export interface AIMessageRequest {
  message: string
  chatId: number
}

export interface AIMessageResponse {
  userMessage: Message
  aiMessage: Message
}

export interface ProjectContextStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  blockedTasks: number
  cancelledTasks: number
  highPriorityTasks: number
  overdueTasks: number
  activeSprints: number
  completedSprints: number
  totalEstimate: number
  totalSpent: number
  completionRate: string
}

export interface TaskSummaryResponse {
  summary: string
  taskInfo: {
    task_id: string
    title: string
    status: string
    priority: string
    assignee: string
    progress: string
    deadline: string
    isOverdue: boolean
  }
}

class AIChatService {
  // Create AI chat for project
  async createAIChatForProject(projectId: string): Promise<Chat> {
    const response = await axiosClient.post(`/ai-chat/${projectId}`)
    return response.data.data
  }

  // Send message to AI and get response
  async sendAIMessage(projectId: string, data: AIMessageRequest): Promise<AIMessageResponse> {
    const response = await axiosClient.post(`/ai-chat/${projectId}/message`, data)
    return response.data.data
  }

  // Get project context/stats
  async getProjectContext(projectId: string): Promise<{
    stats: ProjectContextStats
    taskCount: number
    sprintCount: number
    memberCount: number
  }> {
    const response = await axiosClient.get(`/ai-chat/${projectId}/context`)
    return response.data.data
  }

  // Generate task description with AI
  async generateTaskDescription(projectId: string, prompt: string): Promise<string> {
    const response = await axiosClient.post(`/ai-chat/${projectId}/generate-description`, { prompt })
    return response.data.data.description
  }

  // Generate task summary with AI
  async generateTaskSummary(projectId: string, taskId: string): Promise<TaskSummaryResponse> {
    const response = await axiosClient.post(`/ai-chat/${projectId}/task/${taskId}/summary`)
    return response.data.data
  }
}

export default new AIChatService()
