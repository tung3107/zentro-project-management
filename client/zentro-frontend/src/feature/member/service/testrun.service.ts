import api from '../../../util/axiosClient'
export interface TestRun {
  test_run_id: number
  project_id: string
  name: string
  description: string
  status: 'active' | 'completed'
  created_by: string
  created_at: string
  completed_at?: string
  creator?: {
    user_id: string
    first_name: string
    last_name: string
    avatar: string
  }
  stats?: {
    total: number
    passed: number
    failed: number
  }
}

export interface TestRunDetail extends TestRun {
  testCases: TestRunTestCase[]
}

export interface TestRunTestCase {
  id: number
  test_run_id: number
  testcase_id: number
  status: 'untested' | 'passed' | 'failed' | 'blocked' | 'skipped'
  assigned_to?: string
  executed_by?: string
  executed_at?: string
  note?: string
  image_urls?: string[]
  is_locked?: boolean
  rerun_count?: number
  testcase: {
    testcase_id: number
    name: string
    testcase_code: string
    priority: string
    steps: any[]
    suite?: {
      suite_id: number
      name: string
    }
  }
  assignee?: {
    user_id: string
    first_name: string
    last_name: string
    avatar: string
  }
  executor?: {
    user_id: string
    first_name: string
    last_name: string
    avatar: string
  }
}

export interface TestRunStep {
  id: number
  test_run_testcase_id: number
  step_number: number
  status: 'untested' | 'passed' | 'failed' | 'blocked' | 'skipped'
  actual_result?: string
  evidence_url?: string
}

export interface TestRunHistory {
  history_id: number
  test_run_testcase_id: number
  status: 'untested' | 'passed' | 'failed' | 'blocked' | 'skipped'
  executed_by: string
  executed_at: string
  note?: string
  duration_seconds?: number
  image_urls?: string[]
  executor?: {
    user_id: string
    first_name: string
    last_name: string
    avatar: string
  }
}

export const getTestRunsAPI = async (projectId: string) => {
  const response = await api.get(`/projects/${projectId}/test-runs`)
  return response.data
}

export const createTestRunAPI = async (
  projectId: string,
  data: { name: string; description?: string; testcaseIds: number[] }
) => {
  const response = await api.post(`/projects/${projectId}/test-runs`, data)
  return response.data
}

export const getTestRunDetailAPI = async (runId: number) => {
  const response = await api.get(`/test-runs/${runId}`)
  return response.data
}

export const updateTestRunStatusAPI = async (runId: number, status: 'active' | 'completed') => {
  const response = await api.patch(`/test-runs/${runId}/status`, { status })
  return response.data
}

export const updateTestCaseResultAPI = async (
  runId: number,
  testcaseId: number,
  data: { status?: string; assigned_to?: string; note?: string; image_urls?: string[] }
) => {
  const response = await api.patch(`/test-runs/${runId}/testcases/${testcaseId}`, data)
  return response.data
}

export const updateStepResultAPI = async (
  runId: number,
  testcaseId: number,
  stepNumber: number,
  data: { status?: string; actual_result?: string; evidence_url?: string }
) => {
  const response = await api.patch(`/test-runs/${runId}/testcases/${testcaseId}/steps/${stepNumber}`, data)
  return response.data
}

export const getRunStepsAPI = async (runId: number, testcaseId: number) => {
  const response = await api.get(`/test-runs/${runId}/testcases/${testcaseId}/steps`)
  return response.data
}

export const duplicateTestRunAPI = async (runId: number) => {
  const response = await api.post(`/test-runs/${runId}/duplicate`)
  return response.data
}

export const updateTestRunAPI = async (runId: number, data: { name?: string; description?: string }) => {
  const response = await api.put(`/test-runs/${runId}`, data)
  return response.data
}

export const deleteTestRunAPI = async (runId: number) => {
  const response = await api.delete(`/test-runs/${runId}`)
  return response.data
}

export const getTestCaseHistoryAPI = async (runId: number, testcaseId: number) => {
  const response = await api.get(`/test-runs/${runId}/testcases/${testcaseId}/history`)
  return response.data
}

export const removeTestCaseFromRunAPI = async (runId: number, testcaseId: number) => {
  const response = await api.delete(`/test-runs/${runId}/testcases/${testcaseId}`)
  return response.data
}

export const bulkRemoveTestCasesAPI = async (runId: number, testcaseIds: number[]) => {
  const response = await api.post(`/test-runs/${runId}/bulk-remove`, { testcaseIds })
  return response.data
}

export const bulkAssignTestCasesAPI = async (runId: number, testcaseIds: number[], assigneeId: string | null) => {
  const response = await api.post(`/test-runs/${runId}/bulk-assign`, { testcaseIds, assigneeId })
  return response.data
}

export const assignTestCaseToMeAPI = async (runId: number, testcaseId: number, userId: string) => {
  const response = await api.patch(`/test-runs/${runId}/testcases/${testcaseId}`, { assigned_to: userId })
  return response.data
}

export const rerunTestCaseAPI = async (runId: number, testcaseId: number) => {
  const response = await api.post(`/test-runs/${runId}/testcases/${testcaseId}/rerun`)
  return response.data
}

export const uploadTestResultImagesAPI = async (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('images', file)
  })
  const response = await api.post('/test-runs/upload-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}
