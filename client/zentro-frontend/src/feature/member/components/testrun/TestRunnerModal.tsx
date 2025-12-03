import { useState, useEffect } from 'react'
import {
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  MinusCircle,
  Image as ImageIcon,
  Maximize2,
  Clock,
  User as UserIcon,
  ChevronDown,
  RotateCcw,
  Edit3
} from 'lucide-react'
import {
  updateTestCaseResultAPI,
  updateStepResultAPI,
  getRunStepsAPI,
  getTestCaseHistoryAPI,
  rerunTestCaseAPI,
  type TestRunTestCase,
  type TestRunStep,
  type TestRunHistory
} from '../../service/testrun.service'
import Avatar from '../../../../components/Avatar'
import { getMembersByProject, type MemberData } from '../../service/member.service'
import { Skeleton } from 'primereact/skeleton'
import TestResultModal from './TestResultModal'
import ConfirmModal from '../../../../components/ConfirmModal'

interface TestRunnerModalProps {
  isOpen: boolean
  onClose: () => void
  runId: number
  testCase: TestRunTestCase
  onUpdate: () => void
  projectId?: string
}

export default function TestRunnerModal({
  isOpen,
  onClose,
  runId,
  testCase,
  onUpdate,
  projectId
}: TestRunnerModalProps) {
  const [steps, setSteps] = useState<TestRunStep[]>([])
  const [history, setHistory] = useState<TestRunHistory[]>([])
  const [members, setMembers] = useState<MemberData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [width, setWidth] = useState(800)
  const [isResizing, setIsResizing] = useState(false)
  const [activeTab, setActiveTab] = useState<'execution' | 'history'>('execution')
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [showRerunConfirm, setShowRerunConfirm] = useState(false)

  // Overall status state
  const [overallStatus, setOverallStatus] = useState(testCase.status)
  const [assignee, setAssignee] = useState(testCase.assigned_to)

  useEffect(() => {
    if (isOpen) {
      fetchSteps()
      if (projectId) {
        fetchMembers()
      }
    }
  }, [isOpen, projectId])

  // Separate effect to sync status and assignee from testCase prop
  useEffect(() => {
    setOverallStatus(testCase.status)
    setAssignee(testCase.assigned_to)
    setIsReadOnly(testCase.is_locked || false)
  }, [testCase.status, testCase.assigned_to, testCase.is_locked])

  // Resizing logic
  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true)
  }

  const stopResizing = () => {
    setIsResizing(false)
  }

  const resize = (mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - mouseMoveEvent.clientX
      if (newWidth > 400 && newWidth < window.innerWidth - 100) {
        setWidth(newWidth)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [resize, stopResizing])

  const fetchSteps = async () => {
    setIsLoading(true)
    try {
      const res = await getRunStepsAPI(runId, testCase.testcase_id)
      if (res.success) {
        const definedSteps = testCase.testcase.steps || []
        const executedSteps = res.data

        const mergedSteps = definedSteps.map((defStep: any, index: number) => {
          const execStep = executedSteps.find((s: TestRunStep) => s.step_number === index + 1)
          return {
            ...execStep,
            id: execStep?.id || 0,
            test_run_testcase_id: testCase.id,
            step_number: index + 1,
            status: execStep?.status || 'untested',
            definition: defStep
          }
        })
        setSteps(mergedSteps)
      }
    } catch (error) {
      console.error('Failed to fetch steps:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const res = await getTestCaseHistoryAPI(runId, testCase.testcase_id)
      setHistory(res.data)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const fetchMembers = async () => {
    if (!projectId) return
    try {
      const res = await getMembersByProject(projectId)
      setMembers(res.data)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  const handleStepStatusChange = async (stepNumber: number, status: string) => {
    setSteps((prev) => prev.map((s) => (s.step_number === stepNumber ? { ...s, status: status as any } : s)))
    try {
      await updateStepResultAPI(runId, testCase.testcase_id, stepNumber, { status })
    } catch (error) {
      console.error('Failed to update step status:', error)
      fetchSteps()
    }
  }

  const handleOverallStatusChange = async (status: string) => {
    // If locked, show modal instead
    if (isReadOnly) {
      return
    }
    setShowResultModal(true)
  }

  const handleResultSubmit = async (data: { status: string; note: string; image_urls: string[] }) => {
    try {
      await updateTestCaseResultAPI(runId, testCase.testcase_id, data)
      onUpdate()
      fetchSteps()
    } catch (error) {
      console.error('Failed to update test case result:', error)
      throw error
    }
  }

  const handleRerunClick = () => {
    setShowRerunConfirm(true)
  }

  const handleConfirmRerun = async () => {
    try {
      await rerunTestCaseAPI(runId, testCase.testcase_id)
      onUpdate()
      fetchSteps()
      setIsReadOnly(false)
    } catch (error) {
      console.error('Failed to re-run test case:', error)
    } finally {
      setShowRerunConfirm(false)
    }
  }

  const handleAssigneeChange = async (userId: string | null) => {
    setAssignee(userId || undefined)
    setShowAssigneeDropdown(false)
    try {
      await updateTestCaseResultAPI(runId, testCase.testcase_id, { assigned_to: userId || undefined })
      onUpdate()
    } catch (error) {
      console.error('Failed to assign test case:', error)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent, stepNumber: number) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile()
        console.log(`Image pasted for step ${stepNumber}`, blob)
        alert('Đã phát hiện dán ảnh! (Cần triển khai tính năng tải lên)')
      }
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className='fixed inset-0 z-40 transition-opacity'
        onClick={onClose}
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      />
      <div
        className='fixed top-0 right-0 h-full bg-white z-50 shadow-2xl flex flex-col border-l border-gray-200 transition-all duration-75 ease-linear'
        style={{ width: `${width}px`, fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {/* Resizer Handle */}
        <div
          className='absolute top-0 left-0 w-1 h-full cursor-ew-resize hover:bg-blue-500/50 transition-colors z-50'
          onMouseDown={startResizing}
        />

        {/* Header */}
        <div className='px-6 py-4 border-b border-gray-200 flex items-start justify-between bg-white'>
          <div className='flex-1 mr-8'>
            <h2 className='text-xl font-bold text-gray-900 leading-snug'>{testCase.testcase.name}</h2>
            <div className='flex items-center gap-3 mt-2 text-sm text-gray-500'>
              <span className='font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium text-xs'>
                {testCase.testcase.testcase_code}
              </span>
              <span className='text-gray-300'>•</span>
              <div className='flex items-center gap-2'>
                <Avatar
                  avatarUrl={testCase.executor?.avatar}
                  name={`${testCase.executor?.first_name} ${testCase.executor?.last_name}`}
                  size={20}
                />
                <span className='text-gray-600'>{testCase.executor?.last_name || 'Chưa gán'}</span>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <button className='p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'>
              <Maximize2 size={20} />
            </button>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className='px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between'>
          {isReadOnly ? (
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200'>
                <div
                  className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 ${
                    overallStatus === 'passed'
                      ? 'bg-green-100 text-green-700'
                      : overallStatus === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : overallStatus === 'blocked'
                          ? 'bg-orange-100 text-orange-700'
                          : overallStatus === 'skipped'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {overallStatus === 'passed' ? (
                    <>
                      <CheckCircle size={14} /> Đạt
                    </>
                  ) : overallStatus === 'failed' ? (
                    <>
                      <XCircle size={14} /> Thất bại
                    </>
                  ) : overallStatus === 'blocked' ? (
                    <>
                      <AlertCircle size={14} /> Bị chặn
                    </>
                  ) : overallStatus === 'skipped' ? (
                    <>
                      <MinusCircle size={14} /> Bỏ qua
                    </>
                  ) : (
                    overallStatus
                  )}
                </div>
                {testCase.rerun_count && testCase.rerun_count > 0 && (
                  <span className='text-xs text-gray-500'>+{testCase.rerun_count}</span>
                )}
              </div>
              <button
                onClick={() => setShowResultModal(true)}
                className='px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2 text-sm'
              >
                <Edit3 size={14} />
                Chỉnh sửa
              </button>
              <button
                onClick={handleRerunClick}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 text-sm'
              >
                <RotateCcw size={14} />
                Chạy lại
              </button>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <button
                className={`px-4 py-2 rounded-lg text-xs font-medium uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  overallStatus === 'passed'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
                onClick={() => handleOverallStatusChange('passed')}
              >
                <CheckCircle size={14} /> Đạt
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-xs font-medium uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  overallStatus === 'failed'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
                onClick={() => handleOverallStatusChange('failed')}
              >
                <XCircle size={14} /> Thất bại
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-xs font-medium uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  overallStatus === 'blocked'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
                onClick={() => handleOverallStatusChange('blocked')}
              >
                <AlertCircle size={14} /> Bị chặn
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-xs font-medium uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  overallStatus === 'skipped'
                    ? 'bg-gray-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
                onClick={() => handleOverallStatusChange('skipped')}
              >
                <MinusCircle size={14} /> Bỏ qua
              </button>
            </div>
          )}

          <div className='flex items-center gap-3'>
            {/* Assignee Selector */}
            <div className='relative'>
              <button
                onClick={() => {
                  setShowAssigneeDropdown(!showAssigneeDropdown)
                  if (!showAssigneeDropdown && members.length === 0 && projectId) {
                    fetchMembers()
                  }
                }}
                className='flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-sm'
              >
                {assignee ? (
                  <>
                    <Avatar
                      avatarUrl={members.find((m) => m.user.user_id === assignee)?.user.avatar}
                      name={`${members.find((m) => m.user.user_id === assignee)?.user.first_name} ${members.find((m) => m.user.user_id === assignee)?.user.last_name}`}
                      size={20}
                    />
                    <span className='text-gray-700 font-medium'>
                      {members.find((m) => m.user.user_id === assignee)?.user.last_name}
                    </span>
                  </>
                ) : (
                  <>
                    <UserIcon size={16} className='text-gray-400' />
                    <span className='text-gray-500'>Chọn người thực hiện</span>
                  </>
                )}
                <ChevronDown size={14} className='text-gray-400' />
              </button>

              {showAssigneeDropdown && members.length > 0 && (
                <>
                  <div className='fixed inset-0 z-40' onClick={() => setShowAssigneeDropdown(false)} />
                  <div className='absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto'>
                    <div className='p-1'>
                      <button
                        onClick={() => handleAssigneeChange(null)}
                        className='w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors text-sm text-gray-500 italic'
                      >
                        Bỏ gán
                      </button>
                      {members.map((member) => (
                        <button
                          key={member.user.user_id}
                          onClick={() => handleAssigneeChange(member.user.user_id)}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2 ${
                            assignee === member.user.user_id ? 'bg-blue-50' : ''
                          }`}
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
                            <div className='text-xs text-gray-500'>
                              {member.user.email} | ID: {member.user.user_id}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className='flex items-center gap-3 text-gray-500 text-xs font-medium bg-white px-3 py-2 rounded-lg border border-gray-200'>
              <Clock size={14} className='text-blue-500' />
              <span>00:00:00</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='px-6 border-b border-gray-200 bg-white'>
          <div className='flex gap-8'>
            <button
              className={`py-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'execution'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('execution')}
            >
              Thực hiện
            </button>
            <button
              className={`py-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-800'
              }`}
              onClick={() => {
                setActiveTab('history')
                fetchHistory()
              }}
            >
              Lịch sử chạy
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className='flex-1 overflow-y-auto bg-gray-50 p-6'>
          {activeTab === 'execution' && (
            <div className='space-y-6'>
              {isLoading ? (
                <div className='space-y-6'>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className='bg-white rounded-lg p-5 border border-gray-200'>
                      <div className='flex gap-4'>
                        <Skeleton shape='circle' size='2rem' />
                        <div className='flex-1'>
                          <Skeleton width='100%' height='1rem' className='mb-3' />
                          <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                            <Skeleton width='80%' height='0.875rem' className='mb-2' />
                            <Skeleton width='90%' height='0.875rem' />
                          </div>
                          <div className='mt-4'>
                            <Skeleton width='300px' height='2rem' />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Pre-conditions */}
                  {(testCase.testcase as any).precondition && (
                    <div className='bg-blue-50 rounded-lg p-5 border border-blue-200'>
                      <h3 className='text-xs font-bold text-blue-800 uppercase tracking-wider mb-2'>
                        Điều kiện tiên quyết
                      </h3>
                      <div className='text-sm text-blue-900 leading-relaxed'>
                        {(testCase.testcase as any).precondition}
                      </div>
                    </div>
                  )}

                  {/* Steps */}
                  <div className='space-y-6'>
                    {steps.map((step, index) => (
                      <div
                        key={step.step_number}
                        className='group relative bg-white rounded-lg p-5 border border-gray-200'
                      >
                        <div className='flex gap-4'>
                          {/* Step Number */}
                          <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold'>
                            {step.step_number}
                          </div>

                          {/* Step Content */}
                          <div className='flex-1'>
                            <div className='mb-4'>
                              <div
                                className='text-base text-gray-900 font-medium mb-3 leading-relaxed'
                                dangerouslySetInnerHTML={{ __html: (step as any).definition?.description || '' }}
                              />

                              {(step as any).definition?.expected_result && (
                                <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                                  <span className='text-xs font-bold text-gray-500 uppercase block mb-2'>
                                    Kết quả mong đợi
                                  </span>
                                  <div
                                    className='text-sm text-gray-700 leading-relaxed'
                                    dangerouslySetInnerHTML={{ __html: (step as any).definition?.expected_result }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Step Actions */}
                            <div className='flex items-center gap-3'>
                              <div className='flex bg-white rounded-lg border border-gray-300 p-1'>
                                <button
                                  onClick={() => handleStepStatusChange(step.step_number, 'passed')}
                                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                                    step.status === 'passed'
                                      ? 'bg-green-100 text-green-700'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <CheckCircle size={14} /> Đạt
                                </button>
                                <div className='w-px bg-gray-200 mx-1' />
                                <button
                                  onClick={() => handleStepStatusChange(step.step_number, 'failed')}
                                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                                    step.status === 'failed'
                                      ? 'bg-red-100 text-red-700'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <XCircle size={14} /> Thất bại
                                </button>
                                <div className='w-px bg-gray-200 mx-1' />
                                <button
                                  onClick={() => handleStepStatusChange(step.step_number, 'blocked')}
                                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                                    step.status === 'blocked'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <AlertCircle size={14} /> Bị chặn
                                </button>
                                <div className='w-px bg-gray-200 mx-1' />
                                <button
                                  onClick={() => handleStepStatusChange(step.step_number, 'skipped')}
                                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                                    step.status === 'skipped'
                                      ? 'bg-gray-100 text-gray-700'
                                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <MinusCircle size={14} /> Bỏ qua
                                </button>
                              </div>

                              {/* Evidence Paste Area */}
                              <div className='relative group/paste' onPaste={(e) => handlePaste(e, step.step_number)}>
                                <button className='p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 cursor-pointer'>
                                  <ImageIcon size={18} />
                                </button>
                                <span className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-xs text-white rounded-lg opacity-0 group-hover/paste:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg'>
                                  Dán ảnh (Ctrl+V)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === 'history' && (
            <div>
              {isLoadingHistory ? (
                <div className='flex items-center justify-center py-16'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                </div>
              ) : history.length === 0 ? (
                <div className='text-center text-gray-400 py-16 bg-white rounded-lg border border-dashed border-gray-300'>
                  <Clock size={48} className='mx-auto mb-4 text-gray-300' />
                  <p className='font-medium'>Chưa có lịch sử.</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {history.map((entry) => (
                    <div key={entry.history_id} className='bg-white rounded-lg p-5 border border-gray-200'>
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex items-center gap-3'>
                          <Avatar
                            avatarUrl={entry.executor?.avatar}
                            name={`${entry.executor?.first_name} ${entry.executor?.last_name}`}
                            size={32}
                          />
                          <div>
                            <div className='text-sm font-semibold text-gray-900'>
                              {entry.executor?.first_name} {entry.executor?.last_name}
                            </div>
                            <div className='text-xs text-gray-500'>
                              {new Date(entry.executed_at).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 ${
                            entry.status === 'passed'
                              ? 'bg-green-100 text-green-700'
                              : entry.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : entry.status === 'blocked'
                                  ? 'bg-orange-100 text-orange-700'
                                  : entry.status === 'skipped'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          {entry.status === 'passed' ? (
                            <>
                              <CheckCircle size={14} /> Đạt
                            </>
                          ) : entry.status === 'failed' ? (
                            <>
                              <XCircle size={14} /> Thất bại
                            </>
                          ) : entry.status === 'blocked' ? (
                            <>
                              <AlertCircle size={14} /> Bị chặn
                            </>
                          ) : entry.status === 'skipped' ? (
                            <>
                              <MinusCircle size={14} /> Bỏ qua
                            </>
                          ) : (
                            entry.status
                          )}
                        </div>
                      </div>
                      {entry.note && (
                        <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                          <p className='text-sm text-gray-700'>{entry.note}</p>
                        </div>
                      )}
                      {entry.image_urls && entry.image_urls.length > 0 && (
                        <div className='mt-3'>
                          <p className='text-xs font-semibold text-gray-700 mb-2'>Ảnh minh chứng:</p>
                          <div className='grid grid-cols-3 gap-2'>
                            {entry.image_urls.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`Evidence ${idx + 1}`}
                                className='w-full h-20 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity'
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Test Result Modal */}
      <TestResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        onSubmit={handleResultSubmit}
        currentStatus={overallStatus}
        currentNote={testCase.note}
        currentImages={testCase.image_urls}
      />

      <ConfirmModal
        isOpen={showRerunConfirm}
        onClose={() => setShowRerunConfirm(false)}
        onConfirm={handleConfirmRerun}
        title='Chạy lại test case'
        message='Bạn có chắc muốn chạy lại test case này? Kết quả hiện tại sẽ được lưu vào lịch sử.'
        confirmText='Chạy lại'
        confirmButtonColor='bg-blue-600 hover:bg-blue-700'
      />
    </>
  )
}
