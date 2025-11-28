export interface TestCaseStep {
  step_number: number
  description: string
  data?: string
  expected_result?: string
}

export interface TestCase {
  testcase_id: number
  project_id: number
  suite_id?: number
  testcase_code: string
  name: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  pre_condition?: string
  steps: TestCaseStep[]
  expected_result?: string
  actual_result?: string
  status: 'draft' | 'approved' | 'deprecated' | 'active'
  created_by: number
  updated_by?: number
  created_at: string
  updated_at: string
  version: number
  creator?: {
    user_id: number
    first_name?: string
    last_name?: string
    email: string
    avatar?: string
  }
  updater?: {
    user_id: number
    first_name?: string
    last_name?: string
    email: string
    avatar?: string
  }
  suite?: {
    suite_id: number
    name: string
  }
  attachments?: TestCaseAttachment[]
  taskRelations?: TestCaseTaskRelation[]
}

export interface TestSuite {
  suite_id: number
  project_id: number
  parent_suite_id?: number | null
  name: string
  description?: string
  created_by: number
  created_at: string
  updated_at: string
  creator?: {
    user_id: number
    first_name?: string
    last_name?: string
    email: string
    avatar?: string
  }
  statistics?: {
    testcase_count: number
    suite_count: number
  }
}

export interface TestCaseVersion {
  version_id: number
  testcase_id: number
  version_number: number
  name: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  pre_condition?: string
  steps: TestCaseStep[]
  expected_result?: string
  actual_result?: string
  status: 'draft' | 'approved' | 'deprecated' | 'active'
  updated_by: number
  created_at: string
  updater?: {
    user_id: number
    first_name?: string
    last_name?: string
    email: string
    avatar?: string
  }
}

export interface TestCaseAttachment {
  attachment_id: number
  testcase_id: number
  file_name: string
  file_path: string
  file_size?: number
  uploaded_by: number
  uploaded_at: string
  uploader?: {
    user_id: number
    first_name?: string
    last_name?: string
    email: string
    avatar?: string
  }
}

export interface TestCaseTaskRelation {
  relation_id: number
  testcase_id?: number
  task_id?: number
  suite_id?: number
  relation_type: 'testcase' | 'suite'
  created_at: string
  task?: {
    task_id: number
    title: string
    status_id: number
    type: string
  }
  testcase?: TestCase
  suite?: TestSuite
}

export interface TestCaseFilters {
  suite_id?: number
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'draft' | 'approved' | 'deprecated' | 'active'
  created_by?: string
  search?: string
  date_from?: string
  date_to?: string
}
