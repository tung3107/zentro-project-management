import { FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import type { TestCase, TestSuite } from '../../../../types/testcase'
import Avatar from '../../../../components/Avatar'

interface TestCaseListProps {
  testCases: TestCase[]
  testSuites: TestSuite[]
  onTestCaseClick: (testCase: TestCase) => void
}

export default function TestCaseList({ testCases, testSuites, onTestCaseClick }: TestCaseListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'Nghiêm trọng'
      case 'high':
        return 'Cao'
      case 'medium':
        return 'Trung bình'
      case 'low':
        return 'Thấp'
      default:
        return priority
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className='text-green-600' />
      case 'active':
        return <Clock size={16} className='text-blue-600' />
      case 'deprecated':
        return <XCircle size={16} className='text-gray-600' />
      case 'draft':
        return <AlertCircle size={16} className='text-yellow-600' />
      default:
        return <FileText size={16} className='text-gray-600' />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt'
      case 'active':
        return 'Đang hoạt động'
      case 'deprecated':
        return 'Ngưng sử dụng'
      case 'draft':
        return 'Nháp'
      default:
        return status
    }
  }

  // Group testcases by suite
  const grouped: { suite?: TestSuite; testcases: TestCase[] }[] = []

  // Add testcases without suite
  const withoutSuite = testCases.filter((tc) => !tc.suite_id)
  if (withoutSuite.length > 0) {
    grouped.push({ testcases: withoutSuite })
  }

  // Group by suite
  testSuites.forEach((suite) => {
    const suiteCases = testCases.filter((tc) => tc.suite_id === suite.suite_id)
    if (suiteCases.length > 0) {
      grouped.push({ suite, testcases: suiteCases })
    }
  })

  if (testCases.length === 0) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
        <FileText size={48} className='text-gray-400 mx-auto mb-3' />
        <p className='text-gray-600 font-medium'>Chưa có testcase nào</p>
        <p className='text-gray-500 text-sm mt-1'>Tạo testcase đầu tiên để bắt đầu</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {grouped.map((group, groupIdx) => (
        <div key={groupIdx} className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
          {/* Suite header */}
          {group.suite && (
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <FileText size={20} className='text-blue-600' />
                  <div>
                    <h3 className='font-semibold text-gray-900'>{group.suite.name}</h3>
                    {group.suite.description && (
                      <p className='text-sm text-gray-600 mt-0.5'>{group.suite.description}</p>
                    )}
                  </div>
                </div>
                <span className='text-sm text-gray-600 font-medium'>{group.testcases.length} testcase</span>
              </div>
            </div>
          )}

          {!group.suite && (
            <div className='bg-gray-50 px-4 py-3 border-b border-gray-200'>
              <h3 className='font-semibold text-gray-700'>Không thuộc bộ testcase nào</h3>
            </div>
          )}

          {/* Test cases */}
          <div className='divide-y divide-gray-200'>
            {group.testcases.map((testCase) => (
              <div
                key={testCase.testcase_id}
                onClick={() => onTestCaseClick(testCase)}
                className='px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors group'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    {/* Header row */}
                    <div className='flex items-center gap-3 mb-2'>
                      <span className='text-sm font-mono font-semibold text-blue-600'>{testCase.testcase_code}</span>
                      <h4 className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                        {testCase.name}
                      </h4>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(testCase.priority)}`}
                      >
                        {getPriorityLabel(testCase.priority)}
                      </span>
                    </div>

                    {/* Description */}
                    {testCase.description && (
                      <p className='text-sm text-gray-600 mb-2 line-clamp-2'>{testCase.description}</p>
                    )}

                    {/* Meta info */}
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      <div className='flex items-center gap-1.5'>
                        {getStatusIcon(testCase.status)}
                        <span>{getStatusLabel(testCase.status)}</span>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <span>{testCase.steps?.length || 0} bước</span>
                      </div>
                      {testCase.creator && (
                        <div className='flex items-center gap-1.5'>
                          <Avatar
                            avatarUrl={testCase.creator.avatar}
                            name={`${testCase.creator.first_name || ''} ${testCase.creator.last_name || ''}`.trim()}
                            size={20}
                          />
                          <span>
                            {`${testCase.creator.first_name || ''} ${testCase.creator.last_name || ''}`.trim() ||
                              'Unknown'}
                          </span>
                        </div>
                      )}
                      <div>
                        <span>v{testCase.version}</span>
                      </div>
                      <div>
                        <span>{new Date(testCase.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
