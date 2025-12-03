import { useState, useEffect } from 'react'
import { FileText, FolderOpen, ExternalLink } from 'lucide-react'
import type { TestCase, TestSuite } from '../../../../types/testcase'
import { getTestCasesByTaskAPI, getTestSuitesByTaskAPI } from '../../service/testcase.service'

interface TaskTestCaseRelationsProps {
  taskId: number
}

export default function TaskTestCaseRelations({ taskId }: TaskTestCaseRelationsProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadRelations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const loadRelations = async () => {
    setIsLoading(true)
    try {
      const [tcRes, tsRes] = await Promise.all([getTestCasesByTaskAPI(taskId), getTestSuitesByTaskAPI(taskId)])
      setTestCases(tcRes.data.data || [])
      setTestSuites(tsRes.data.data || [])
    } catch (err) {
      console.error('Failed to load test case relations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700'
      case 'high':
        return 'bg-orange-100 text-orange-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'active':
        return 'bg-blue-100 text-blue-700'
      case 'deprecated':
        return 'bg-gray-100 text-gray-700'
      case 'draft':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg border border-gray-200 p-4'>
        <p className='text-sm text-gray-500'>Đang tải...</p>
      </div>
    )
  }

  if (testCases.length === 0 && testSuites.length === 0) {
    return (
      <div className='bg-white rounded-lg border border-gray-200 p-4'>
        <p className='text-sm text-gray-500'>Chưa có test case hoặc test suite liên quan</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Test Suites */}
      {testSuites.length > 0 && (
        <div className='bg-white rounded-lg border border-gray-200'>
          <div className='px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'>
            <div className='flex items-center gap-2'>
              <FolderOpen size={18} className='text-blue-600' />
              <h4 className='font-semibold text-gray-900'>Test Suites liên quan</h4>
              <span className='text-sm text-gray-600'>({testSuites.length})</span>
            </div>
          </div>
          <div className='divide-y divide-gray-200'>
            {testSuites.map((suite) => (
              <div key={suite.suite_id} className='px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h5 className='font-medium text-gray-900 group-hover:text-blue-600 transition-colors'>
                      {suite.name}
                    </h5>
                    {suite.description && (
                      <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{suite.description}</p>
                    )}
                    {suite.testCases && suite.testCases.length > 0 && (
                      <p className='text-xs text-gray-500 mt-2'>{suite.testCases.length} test case</p>
                    )}
                  </div>
                  <ExternalLink
                    size={16}
                    className='text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity'
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Cases */}
      {testCases.length > 0 && (
        <div className='bg-white rounded-lg border border-gray-200'>
          <div className='px-4 py-3 border-b border-gray-200 bg-gray-50'>
            <div className='flex items-center gap-2'>
              <FileText size={18} className='text-gray-700' />
              <h4 className='font-semibold text-gray-900'>Test Case liên quan</h4>
              <span className='text-sm text-gray-600'>({testCases.length})</span>
            </div>
          </div>
          <div className='divide-y divide-gray-200'>
            {testCases.map((testCase) => (
              <div
                key={testCase.testcase_id}
                className='px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-xs font-mono font-semibold text-blue-600'>{testCase.testcase_code}</span>
                      <h5 className='font-medium text-gray-900 group-hover:text-blue-600 transition-colors'>
                        {testCase.name}
                      </h5>
                    </div>
                    {testCase.description && (
                      <p className='text-sm text-gray-600 mt-1 line-clamp-1'>{testCase.description}</p>
                    )}
                    <div className='flex items-center gap-2 mt-2'>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(testCase.priority)}`}
                      >
                        {testCase.priority}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(testCase.status)}`}>
                        {testCase.status}
                      </span>
                      <span className='text-xs text-gray-500'>v{testCase.version}</span>
                    </div>
                  </div>
                  <ExternalLink
                    size={16}
                    className='text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity'
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
