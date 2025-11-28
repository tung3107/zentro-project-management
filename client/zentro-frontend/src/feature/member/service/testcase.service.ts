import api from '../../../util/axiosClient'
import type { TestCaseFilters } from '../../../types/testcase'

// TestCase services
export const createTestCaseAPI = async (projectId: string, data: any) => {
  return await api.post(`/projects/${projectId}/testcases`, data)
}

export const getTestCasesAPI = async (projectId: string, filters?: TestCaseFilters) => {
  return await api.get(`/projects/${projectId}/testcases`, { params: filters })
}

export const getTestCaseByIdAPI = async (testcaseId: number) => {
  return await api.get(`/testcases/${testcaseId}`)
}

export const updateTestCaseAPI = async (testcaseId: number, data: any) => {
  return await api.put(`/testcases/${testcaseId}`, data)
}

export const deleteTestCaseAPI = async (testcaseId: number) => {
  return await api.delete(`/testcases/${testcaseId}`)
}

export const getVersionHistoryAPI = async (testcaseId: number) => {
  return await api.get(`/testcases/${testcaseId}/versions`)
}

export const uploadAttachmentAPI = async (testcaseId: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return await api.post(`/testcases/${testcaseId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const deleteAttachmentAPI = async (attachmentId: number) => {
  return await api.delete(`/testcases/attachments/${attachmentId}`)
}

// TestSuite services
export const createTestSuiteAPI = async (projectId: string, data: any) => {
  return await api.post(`/projects/${projectId}/testsuites`, data)
}

export const getTestSuitesAPI = async (projectId: string) => {
  return await api.get(`/projects/${projectId}/testsuites`)
}

export const updateTestSuiteAPI = async (suiteId: number, data: any) => {
  return await api.put(`/testsuites/${suiteId}`, data)
}

export const deleteTestSuiteAPI = async (suiteId: number, moveToSuiteId?: number) => {
  return await api.delete(`/testsuites/${suiteId}`, {
    data: { moveToSuiteId }
  })
}

export const duplicateTestSuiteAPI = async (suiteId: number, targetParentSuiteId?: number) => {
  return await api.post(`/testsuites/${suiteId}/duplicate`, { targetParentSuiteId })
}

export const getSuiteChildrenAPI = async (suiteId: number) => {
  return await api.get(`/testsuites/${suiteId}/children`)
}

// Task relations
export const getTestCasesByTaskAPI = async (taskId: number) => {
  return await api.get(`/tasks/${taskId}/testcases`)
}

export const getTestSuitesByTaskAPI = async (taskId: number) => {
  return await api.get(`/tasks/${taskId}/testsuites`)
}

// Import/Export
export const exportTestCasesAPI = async (projectId: string, format: 'csv' | 'excel' = 'csv') => {
  return await api.get(`/projects/${projectId}/testcases/export`, {
    params: { format },
    responseType: 'blob'
  })
}

export const importTestCasesAPI = async (projectId: string, file: File, suiteId?: number) => {
  const formData = new FormData()
  formData.append('file', file)
  if (suiteId) {
    formData.append('suite_id', suiteId.toString())
  }
  return await api.post(`/projects/${projectId}/testcases/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
