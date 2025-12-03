import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  MinusCircle,
  Play,
  ChevronDown,
  ChevronRight,
  Search,
  MoreVertical,
  Trash2,
  UserPlus,
  X,
  Edit,
  UserCheck
} from 'lucide-react'
import {
  getTestRunDetailAPI,
  updateTestRunStatusAPI,
  removeTestCaseFromRunAPI,
  bulkRemoveTestCasesAPI,
  bulkAssignTestCasesAPI,
  assignTestCaseToMeAPI,
  type TestRunDetail,
  type TestRunTestCase
} from '../../service/testrun.service'
import Avatar from '../../../../components/Avatar'
import TestRunnerModal from './TestRunnerModal'
import { getMembersByProject, type MemberData } from '../../service/member.service'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from 'primereact/skeleton'
import ConfirmModal from '../../../../components/ConfirmModal'

interface TestRunDetailProps {
  runId: number
  onBack: () => void
  projectId?: string
}

interface GroupedTestCases {
  suiteId: number | null
  suiteName: string
  testCases: TestRunTestCase[]
}

export default function TestRunDetail({ runId, onBack, projectId }: TestRunDetailProps) {
  const navigate = useNavigate()
  const [run, setRun] = useState<TestRunDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTestCase, setSelectedTestCase] = useState<TestRunTestCase | null>(null)
  const [expandedSuites, setExpandedSuites] = useState<Set<number | string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTestCases, setSelectedTestCases] = useState<Set<number>>(new Set())
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null)
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const [members, setMembers] = useState<MemberData[]>([])
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [testCaseToRemove, setTestCaseToRemove] = useState<number | null>(null)
  const [showRemoveTestCaseConfirm, setShowRemoveTestCaseConfirm] = useState(false)
  const [showBulkRemoveConfirm, setShowBulkRemoveConfirm] = useState(false)

  const fetchDetail = async () => {
    setIsLoading(true)
    try {
      const res = await getTestRunDetailAPI(runId)
      if (res.success) {
        setRun(res.data)
        // Expand all suites by default
        const allSuiteIds = new Set<number | string>()
        const grouped = groupTestCases(res.data.testCases)
        grouped.forEach((g) => allSuiteIds.add(g.suiteId ?? 'orphan'))
        setExpandedSuites(allSuiteIds)

        // Update selectedTestCase if it's currently open
        if (selectedTestCase) {
          const updatedTestCase = res.data.testCases.find(
            (tc: TestRunTestCase) => tc.testcase_id === selectedTestCase.testcase_id
          )
          if (updatedTestCase) {
            setSelectedTestCase(updatedTestCase)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch run detail:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
    if (projectId) {
      fetchMembers()
    }
  }, [runId, projectId])

  const fetchMembers = async () => {
    if (!projectId) return
    try {
      const res = await getMembersByProject(projectId)
      setMembers(res.data)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  const handleCompleteRunClick = () => {
    setShowCompleteConfirm(true)
  }

  const handleConfirmCompleteRun = async () => {
    if (!run) return

    try {
      const res = await updateTestRunStatusAPI(runId, 'completed')
      if (res.success) {
        fetchDetail()
      }
    } catch (error) {
      console.error('Failed to complete run:', error)
    }
  }

  const groupTestCases = (testCases: TestRunTestCase[]): GroupedTestCases[] => {
    const groups: Record<string, GroupedTestCases> = {}
    const orphanGroup: GroupedTestCases = {
      suiteId: null,
      suiteName: 'Test case không có suite',
      testCases: []
    }

    testCases.forEach((tc) => {
      // Filter logic
      if (filterStatus !== 'all' && tc.status !== filterStatus) return
      if (
        searchTerm &&
        !tc.testcase.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !tc.testcase.testcase_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return

      const suite = tc.testcase?.suite
      if (suite) {
        if (!groups[suite.suite_id]) {
          groups[suite.suite_id] = {
            suiteId: suite.suite_id,
            suiteName: suite.name,
            testCases: []
          }
        }
        groups[suite.suite_id].testCases.push(tc)
      } else {
        orphanGroup.testCases.push(tc)
      }
    })

    const result = Object.values(groups)
    if (orphanGroup.testCases.length > 0) {
      result.push(orphanGroup)
    }
    return result
  }

  const toggleSuite = (id: number | string) => {
    const newExpanded = new Set(expandedSuites)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedSuites(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'blocked':
        return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'skipped':
        return 'text-gray-700 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={14} className='text-green-600' />
      case 'failed':
        return <XCircle size={14} className='text-red-600' />
      case 'blocked':
        return <AlertCircle size={14} className='text-orange-600' />
      case 'skipped':
        return <MinusCircle size={14} className='text-gray-600' />
      default:
        return <div className='w-3.5 h-3.5 rounded-full border-2 border-gray-300' />
    }
  }

  const handleCheckboxChange = (testcaseId: number) => {
    const newSelected = new Set(selectedTestCases)
    if (newSelected.has(testcaseId)) {
      newSelected.delete(testcaseId)
    } else {
      newSelected.add(testcaseId)
    }
    setSelectedTestCases(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedTestCases.size === run?.testCases.length) {
      setSelectedTestCases(new Set())
    } else {
      setSelectedTestCases(new Set(run?.testCases.map((tc) => tc.testcase_id)))
    }
  }

  const handleRemoveTestCaseClick = (testcaseId: number) => {
    setTestCaseToRemove(testcaseId)
    setShowRemoveTestCaseConfirm(true)
  }

  const handleConfirmRemoveTestCase = async () => {
    if (!testCaseToRemove) return
    try {
      await removeTestCaseFromRunAPI(runId, testCaseToRemove)
      fetchDetail()
      setShowMoreMenu(null)
      setTestCaseToRemove(null)
    } catch (error) {
      console.error('Failed to remove test case:', error)
    }
  }

  const handleBulkRemoveClick = () => {
    setShowBulkRemoveConfirm(true)
  }

  const handleConfirmBulkRemove = async () => {
    try {
      await bulkRemoveTestCasesAPI(runId, Array.from(selectedTestCases))
      setSelectedTestCases(new Set())
      fetchDetail()
    } catch (error) {
      console.error('Failed to bulk remove test cases:', error)
    }
  }

  const handleBulkAssign = async (assigneeId: string | null) => {
    try {
      await bulkAssignTestCasesAPI(runId, Array.from(selectedTestCases), assigneeId)
      setSelectedTestCases(new Set())
      setShowAssignDropdown(false)
      fetchDetail()
    } catch (error) {
      console.error('Failed to bulk assign test cases:', error)
    }
  }

  const handleEditTestCase = (testcaseId: number) => {
    if (!projectId) return
    setShowMoreMenu(null)
    navigate(`/member/projects/${projectId}/qa?testcase=${testcaseId}`)
  }

  const handleAssignToMe = async (testcaseId: number) => {
    try {
      const currentUserId = localStorage.getItem('user_id')
      if (!currentUserId) return
      await assignTestCaseToMeAPI(runId, testcaseId, currentUserId)
      setShowMoreMenu(null)
      fetchDetail()
    } catch (error) {
      console.error('Failed to assign test case to me:', error)
    }
  }

  if (isLoading) {
    return (
      <div className='h-full flex flex-col bg-gray-50' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {/* Header Skeleton */}
        <div className='flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200'>
          <div className='flex items-center gap-4 flex-1'>
            <Skeleton shape='circle' size='2.5rem' />
            <div className='flex-1'>
              <Skeleton width='300px' height='1.5rem' className='mb-2' />
              <Skeleton width='200px' height='1rem' />
            </div>
          </div>
          <Skeleton width='120px' height='2.5rem' />
        </div>

        <div className='flex-1 overflow-hidden flex flex-col lg:flex-row'>
          {/* Main Content Skeleton */}
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <Skeleton width='250px' height='2.5rem' />
                <Skeleton width='300px' height='2.5rem' />
              </div>
              <Skeleton width='150px' height='1.25rem' />
            </div>

            <div className='space-y-4'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                  <div className='px-4 py-3 bg-gray-50 border-b border-gray-200'>
                    <Skeleton width='200px' height='1.25rem' />
                  </div>
                  <div className='divide-y divide-gray-200'>
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className='px-4 py-3 flex items-center gap-4'>
                        <Skeleton shape='circle' size='2rem' />
                        <div className='flex-1'>
                          <Skeleton width='60%' height='1rem' className='mb-2' />
                          <Skeleton width='40%' height='0.875rem' />
                        </div>
                        <Skeleton width='100px' height='1.5rem' />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className='w-full lg:w-80 bg-white border-l border-gray-200 p-6'>
            <Skeleton width='150px' height='1rem' className='mb-6' />
            <Skeleton shape='circle' size='10rem' className='mx-auto mb-8' />
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='flex items-center justify-between'>
                  <Skeleton width='80px' height='1rem' />
                  <Skeleton width='60px' height='1rem' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!run) return null

  const groupedCases = groupTestCases(run.testCases)

  // Stats
  const total = run.testCases.length
  const passed = run.testCases.filter((tc) => tc.status === 'passed').length
  const failed = run.testCases.filter((tc) => tc.status === 'failed').length
  const blocked = run.testCases.filter((tc) => tc.status === 'blocked').length
  const skipped = run.testCases.filter((tc) => tc.status === 'skipped').length
  const untested = total - passed - failed - blocked - skipped
  const completionRate = total > 0 ? Math.round(((passed + failed + blocked + skipped) / total) * 100) : 0

  // Pie chart gradient
  const chartData = [
    { label: 'Passed', value: passed, color: '#16a34a' },
    { label: 'Failed', value: failed, color: '#dc2626' },
    { label: 'Blocked', value: blocked, color: '#ea580c' },
    { label: 'Skipped', value: skipped, color: '#9ca3af' },
    { label: 'Untested', value: untested, color: '#e5e7eb' }
  ]

  let cumulativePercent = 0
  const conicGradient = chartData
    .map((d) => {
      const percent = (d.value / total) * 100
      const segment = `${d.color} ${cumulativePercent}% ${cumulativePercent + percent}%`
      cumulativePercent += percent
      return segment
    })
    .join(', ')

  return (
    <div className='h-full flex flex-col bg-gray-50' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <button onClick={onBack} className='p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500'>
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-xl font-bold text-gray-900'>{run.name}</h1>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  run.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {run.status === 'completed' ? 'HOÀN THÀNH' : 'ĐANG CHẠY'}
              </span>
            </div>
            <p className='text-sm text-gray-500 mt-1'>{run.description || 'Không có mô tả'}</p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {run.status !== 'completed' && (
            <button
              onClick={handleCompleteRunClick}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 text-sm'
            >
              <CheckCircle size={16} />
              Hoàn thành
            </button>
          )}
        </div>
      </div>

      <div className='flex-1 overflow-hidden flex flex-col lg:flex-row'>
        {/* Main Content: Test Cases List */}
        <div className='flex-1 overflow-y-auto p-6'>
          {/* Filters */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='relative'>
                <Search size={16} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder='Tìm kiếm test cases...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                />
              </div>
              <div className='flex items-center bg-white border border-gray-200 rounded-lg p-1'>
                {['all', 'passed', 'failed', 'untested'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                      filterStatus === status ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {status === 'all'
                      ? 'Tất cả'
                      : status === 'passed'
                        ? 'Đạt'
                        : status === 'failed'
                          ? 'Thất bại'
                          : status === 'untested'
                            ? 'Chưa test'
                            : status}
                  </button>
                ))}
              </div>
            </div>
            <div className='text-sm text-gray-500'>
              Hiển thị{' '}
              <span className='font-medium text-gray-900'>
                {groupedCases.reduce((acc, g) => acc + g.testCases.length, 0)}
              </span>{' '}
              test case
            </div>
          </div>

          {/* Grouped List */}
          <div className='space-y-4'>
            {groupedCases.map((group) => {
              const isExpanded = expandedSuites.has(group.suiteId ?? 'orphan')
              const groupStatus = {
                passed: group.testCases.filter((tc) => tc.status === 'passed').length,
                failed: group.testCases.filter((tc) => tc.status === 'failed').length,
                total: group.testCases.length
              }

              return (
                <div
                  key={group.suiteId ?? 'orphan'}
                  className='bg-white rounded-xl border border-gray-200 overflow-hidden'
                >
                  <div
                    className='px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors'
                    onClick={() => toggleSuite(group.suiteId ?? 'orphan')}
                  >
                    <div className='flex items-center gap-3'>
                      <button className='text-gray-400 hover:text-gray-600'>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                      <h3 className='font-semibold text-gray-900 text-sm'>{group.suiteName}</h3>
                      <span className='text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200'>
                        {group.testCases.length} cases
                      </span>
                    </div>

                    {/* Mini progress bar for suite */}
                    <div className='flex items-center gap-4'>
                      <div className='flex h-2 w-24 bg-gray-200 rounded-full overflow-hidden'>
                        <div
                          className='bg-green-500 h-full'
                          style={{ width: `${(groupStatus.passed / groupStatus.total) * 100}%` }}
                        />
                        <div
                          className='bg-red-500 h-full'
                          style={{ width: `${(groupStatus.failed / groupStatus.total) * 100}%` }}
                        />
                      </div>
                      <span className='text-xs text-gray-700 font-medium min-w-[35px] text-right'>
                        {Math.round(((groupStatus.passed + groupStatus.failed) / groupStatus.total) * 100)}%
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className='divide-y divide-gray-200'>
                      {group.testCases.map((tc) => (
                        <div
                          key={tc.id}
                          className='px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors group'
                        >
                          {/* Checkbox */}
                          <div className='flex-shrink-0 mr-3'>
                            <input
                              type='checkbox'
                              checked={selectedTestCases.has(tc.testcase_id)}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleCheckboxChange(tc.testcase_id)
                              }}
                              className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer'
                            />
                          </div>

                          <div
                            className='flex items-center gap-4 flex-1 min-w-0 cursor-pointer'
                            onClick={() => setSelectedTestCase(tc)}
                          >
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                tc.status === 'passed'
                                  ? 'bg-green-100 text-green-600'
                                  : tc.status === 'failed'
                                    ? 'bg-red-100 text-red-600'
                                    : tc.status === 'blocked'
                                      ? 'bg-orange-100 text-orange-600'
                                      : tc.status === 'skipped'
                                        ? 'bg-gray-100 text-gray-600'
                                        : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {getStatusIcon(tc.status)}
                            </div>
                            <div className='min-w-0 flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='text-xs font-mono text-gray-500 font-medium'>
                                  {tc.testcase.testcase_code}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                    tc.testcase.priority === 'critical'
                                      ? 'bg-red-100 text-red-700'
                                      : tc.testcase.priority === 'high'
                                        ? 'bg-orange-100 text-orange-700'
                                        : tc.testcase.priority === 'medium'
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {tc.testcase.priority}
                                </span>
                              </div>
                              <h4 className='text-sm font-medium text-gray-900 truncate'>{tc.testcase.name}</h4>
                            </div>
                          </div>

                          <div className='flex items-center gap-6'>
                            <div className='flex items-center gap-2 min-w-[120px]'>
                              {tc.executor ? (
                                <>
                                  <Avatar
                                    avatarUrl={tc.executor?.avatar}
                                    name={`${tc.executor?.first_name} ${tc.executor?.last_name}`}
                                    size={20}
                                  />
                                  <span className='text-xs text-gray-600 truncate max-w-[80px]'>
                                    {tc.executor?.first_name} {tc.executor?.last_name}
                                  </span>
                                </>
                              ) : (
                                <span className='text-xs text-gray-400 italic'>Chưa gán</span>
                              )}
                            </div>

                            <div
                              className={`min-w-[90px] px-2.5 py-1 rounded-md text-xs font-medium text-center capitalize flex items-center justify-center gap-1 ${getStatusColor(tc.status)}`}
                            >
                              <span>{tc.status}</span>
                              {tc.rerun_count && tc.rerun_count > 0 && (
                                <span className='text-[10px]'>+{tc.rerun_count}</span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTestCase(tc)
                              }}
                              className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer'
                            >
                              <Play size={16} />
                            </button>

                            {/* 3-dot menu */}
                            <div className='relative'>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowMoreMenu(showMoreMenu === tc.id ? null : tc.id)
                                }}
                                className='p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer'
                              >
                                <MoreVertical size={16} />
                              </button>

                              {showMoreMenu === tc.id && (
                                <>
                                  <div className='fixed inset-0 z-40' onClick={() => setShowMoreMenu(null)} />
                                  <div className='absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1'>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditTestCase(tc.testcase_id)
                                      }}
                                      className='w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 text-sm'
                                    >
                                      <Edit size={14} />
                                      Sửa test case
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleAssignToMe(tc.testcase_id)
                                      }}
                                      className='w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 text-sm'
                                    >
                                      <UserCheck size={14} />
                                      Giao cho tôi
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemoveTestCaseClick(tc.testcase_id)
                                      }}
                                      className='w-full px-4 py-2 text-left hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600 text-sm'
                                    >
                                      <Trash2 size={14} />
                                      Xóa khỏi đợt kiểm thử
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {groupedCases.length === 0 && (
              <div className='text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed'>
                <p className='text-gray-500'>Không tìm thấy test case nào phù hợp với tiêu chí của bạn.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Stats */}
        <div className='w-full lg:w-80 bg-white border-l border-gray-200 overflow-y-auto'>
          <div className='p-6'>
            <h3 className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-6'>Trạng thái thực hiện</h3>

            <div className='flex justify-center mb-8 relative'>
              <div className='w-40 h-40 rounded-full' style={{ background: `conic-gradient(${conicGradient})` }} />
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-sm'>
                  <span className='text-2xl font-bold text-gray-900'>{completionRate}%</span>
                  <span className='text-[10px] text-gray-500 font-medium uppercase mt-1'>Hoàn thành</span>
                </div>
              </div>
            </div>

            <div className='space-y-3 mb-8'>
              {chartData.map((d) => (
                <div key={d.label} className='flex items-center justify-between text-sm group cursor-default'>
                  <div className='flex items-center gap-2.5'>
                    <div className='w-2.5 h-2.5 rounded-full' style={{ backgroundColor: d.color }} />
                    <span className='text-gray-600 group-hover:text-gray-900 transition-colors'>
                      {d.label === 'Passed'
                        ? 'Đạt'
                        : d.label === 'Failed'
                          ? 'Thất bại'
                          : d.label === 'Blocked'
                            ? 'Bị chặn'
                            : d.label === 'Skipped'
                              ? 'Bỏ qua'
                              : d.label === 'Untested'
                                ? 'Chưa test'
                                : d.label}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-gray-900'>{d.value}</span>
                    <span className='text-xs text-gray-400 min-w-[35px] text-right'>
                      {Math.round((d.value / total) * 100) || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className='pt-6 border-t border-gray-200'>
              <h3 className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-4'>Chi tiết</h3>
              <div className='space-y-4'>
                <div>
                  <p className='text-xs text-gray-500 mb-2'>Tạo bởi</p>
                  <div className='flex items-center gap-2'>
                    <Avatar
                      avatarUrl={run.creator?.avatar}
                      name={`${run.creator?.first_name} ${run.creator?.last_name}`}
                      size={24}
                    />
                    <span className='text-sm font-medium text-gray-900'>
                      {`${run.creator?.first_name} ${run.creator?.last_name}`}
                    </span>
                  </div>
                </div>
                <div>
                  <p className='text-xs text-gray-500 mb-2'>Ngày tạo</p>
                  <p className='text-sm font-medium text-gray-900'>
                    {new Date(run.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                {run.completed_at && (
                  <div>
                    <p className='text-xs text-gray-500 mb-2'>Ngày hoàn thành</p>
                    <p className='text-sm font-medium text-gray-900'>
                      {new Date(run.completed_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar for Bulk Actions */}
      {selectedTestCases.size > 0 && (
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40'>
          <div className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button
                onClick={handleSelectAll}
                className='text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors'
              >
                {selectedTestCases.size === run?.testCases.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
              <div className='h-6 w-px bg-gray-300' />
              <span className='text-sm text-gray-600'>
                Đã chọn <span className='font-semibold text-gray-900'>{selectedTestCases.size}</span> test case
              </span>
            </div>

            <div className='flex items-center gap-3'>
              {/* Assign dropdown */}
              <div className='relative'>
                <button
                  onClick={() => {
                    setShowAssignDropdown(!showAssignDropdown)
                    if (!showAssignDropdown && members.length === 0) {
                      fetchMembers()
                    }
                  }}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2'
                >
                  <UserPlus size={16} />
                  Giao cho
                </button>

                {showAssignDropdown && members.length > 0 && (
                  <>
                    <div className='fixed inset-0 z-40' onClick={() => setShowAssignDropdown(false)} />
                    <div className='absolute right-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto'>
                      <div className='p-1'>
                        {members.map((member) => (
                          <button
                            key={member.user.user_id}
                            onClick={() => handleBulkAssign(member.user.user_id)}
                            className='w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2'
                          >
                            <Avatar
                              avatarUrl={member.user.avatar}
                              name={`${member.user.first_name} ${member.user.last_name}`}
                              size={24}
                            />
                            <div className='flex-1'>
                              <div className='text-sm font-medium text-gray-900'>
                                {member.user.first_name} {member.user.last_name}
                              </div>
                              <div className='text-xs text-gray-500'>{member.role.role_name}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleBulkRemoveClick}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2'
              >
                <Trash2 size={16} />
                Xóa
              </button>

              <button
                onClick={() => setSelectedTestCases(new Set())}
                className='p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTestCase && (
        <TestRunnerModal
          isOpen={!!selectedTestCase}
          onClose={() => setSelectedTestCase(null)}
          runId={runId}
          testCase={selectedTestCase}
          projectId={projectId}
          onUpdate={() => {
            fetchDetail()
          }}
        />
      )}

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        onConfirm={handleConfirmCompleteRun}
        title='Hoàn thành đợt kiểm thử'
        message='Bạn có chắc chắn muốn hoàn thành Đợt kiểm thử này?'
        confirmText='Hoàn thành'
        confirmButtonColor='bg-blue-600 hover:bg-blue-700'
      />

      <ConfirmModal
        isOpen={showRemoveTestCaseConfirm}
        onClose={() => setShowRemoveTestCaseConfirm(false)}
        onConfirm={handleConfirmRemoveTestCase}
        title='Xóa test case'
        message='Bạn có chắc chắn muốn xóa test case này khỏi đợt kiểm thử?'
        confirmText='Xóa'
        confirmButtonColor='bg-red-600 hover:bg-red-700'
      />

      <ConfirmModal
        isOpen={showBulkRemoveConfirm}
        onClose={() => setShowBulkRemoveConfirm(false)}
        onConfirm={handleConfirmBulkRemove}
        title='Xóa nhiều test case'
        message={`Bạn có chắc chắn muốn xóa ${selectedTestCases.size} test cases khỏi đợt kiểm thử?`}
        confirmText='Xóa'
        confirmButtonColor='bg-red-600 hover:bg-red-700'
      />
    </div>
  )
}
