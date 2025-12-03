import { useEffect, useState, useRef } from 'react'
import { Filter, Plus, X, Upload, Download, Search, Bot } from 'lucide-react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import TestCaseTreeView from './TestCaseTreeView'
import TestCaseDetailModal from './TestCaseDetailModal'
import TestSuiteModal from './TestSuiteModal'
import DeleteTestSuiteModal from './DeleteTestSuiteModal'
import DuplicateTestSuiteModal from './DuplicateTestSuiteModal'
import ImportTestCaseModal from './ImportTestCaseModal'
import AIChatPanel from '../ai/AIChatPanel'
import type { TestCase, TestSuite, TestCaseFilters } from '../../../../types/testcase'
import type { User } from '../../../../types/user'
import {
  getTestCasesAPI,
  getTestSuitesAPI,
  exportTestCasesAPI,
  importTestCasesAPI,
  deleteTestSuiteAPI
} from '../../service/testcase.service'
import api from '../../../../util/axiosClient'
import { Skeleton } from 'primereact/skeleton'

export default function TestCaseTab() {
  const { projectId } = useParams<{ projectId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)
  const [showTestCaseModal, setShowTestCaseModal] = useState(false)
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | undefined>(undefined)
  const [showTestSuiteModal, setShowTestSuiteModal] = useState(false)
  const [parentSuiteId, setParentSuiteId] = useState<number | undefined>(undefined)
  const [editingSuite, setEditingSuite] = useState<TestSuite | null>(null)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [duplicatingSuite, setDuplicatingSuite] = useState<TestSuite | null>(null)
  const [deletingSuite, setDeletingSuite] = useState<TestSuite | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  const [filters, setFilters] = useState<TestCaseFilters>({})
  const [searchQuery, setSearchQuery] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const testcaseIdFromQuery = searchParams.get('testcase')

  useEffect(() => {
    if (projectId) {
      loadMembers()
      loadTestSuites()
      loadTestCases()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      loadTestCases()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const loadMembers = async () => {
    try {
      const res = await api.get(`/members/dropdown/${projectId}`)
      setMembers(res.data.data || [])
    } catch (err) {
      console.error('Failed to load members:', err)
    }
  }

  const loadTestSuites = async () => {
    try {
      const res = await getTestSuitesAPI(projectId!)
      console.log('API Response - Test Suites:', res.data)
      setTestSuites(res.data.data || [])
    } catch (err) {
      console.error('Failed to load test suites:', err)
      setTestSuites([])
    }
  }

  const loadTestCases = async () => {
    setIsLoading(true)
    try {
      const res = await getTestCasesAPI(projectId!, { ...filters, search: searchQuery })
      setTestCases(res.data.data || [])
    } catch (err) {
      console.error('Failed to load test cases:', err)
      setTestCases([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    loadTestCases()
  }

  const handleCreateTestCase = (suiteId?: number) => {
    setSelectedTestCase(null)
    setSelectedSuiteId(suiteId)
    setShowTestCaseModal(true)
  }

  const handleEditTestCase = (testcase: TestCase) => {
    setSelectedTestCase(testcase)
    setShowTestCaseModal(true)
    navigate(`testcase?testcase=${testcase.testcase_id}`)
  }

  const handleCloseTestCaseModal = () => {
    setShowTestCaseModal(false)
    setSelectedTestCase(null)
    setSelectedSuiteId(undefined)
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete('testcase')
    const newQueryString = newSearchParams.toString()
    navigate(newQueryString ? `testcase?${newQueryString}` : 'testcase', { replace: true })
  }

  const handleTestCaseUpdate = () => {
    loadTestCases()
    loadTestSuites()
  }

  const handleCreateSuite = (parentId?: number) => {
    setParentSuiteId(parentId)
    setEditingSuite(null)
    setShowTestSuiteModal(true)
  }

  const handleEditSuite = (suite: TestSuite) => {
    setEditingSuite(suite)
    setShowTestSuiteModal(true)
  }

  const handleDuplicateSuite = (suite: TestSuite) => {
    setDuplicatingSuite(suite)
  }

  const handleDeleteSuite = (suite: TestSuite) => {
    setDeletingSuite(suite)
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const res = await exportTestCasesAPI(projectId!, format)
      const blob = new Blob([res.data], {
        type: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `testcases_${projectId}_${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleImportTestCase = async (file: File, suiteId?: number) => {
    try {
      await importTestCasesAPI(projectId!, file, suiteId)
      loadTestCases()
      loadTestSuites() // Reload suites in case new suites were created (though import usually creates cases)
    } catch (err) {
      console.error('Import failed:', err)
      throw err // Re-throw to let modal handle error display
    }
  }

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length

  return (
    <div className='flex flex-col h-full' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className='px-6 py-4 bg-white border-b border-gray-200'>
        {/* Row 1: Title and Main Actions */}
        <div className='flex items-center justify-between mb-3'>
          <h2 className='text-xl font-bold text-gray-900'>Quản lý Testcase</h2>

          <div className='flex items-center gap-2'>
            {/* AI Assistant */}
            {/* <button
              onClick={() => setShowAIChat(true)}
              className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg'
              title='AI Assistant'
            >
              <Bot size={18} />
              <span className='hidden xl:inline'>AI Assistant</span>
            </button> */}

            {/* Create buttons */}
            <button
              onClick={() => handleCreateSuite()}
              className='flex items-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors'
            >
              <Plus size={18} />
              <span className='hidden lg:inline'>Bộ testcase</span>
            </button>
            <button
              onClick={() => handleCreateTestCase()}
              className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
            >
              <Plus size={18} />
              <span className='hidden lg:inline'>Testcase</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search and Tools */}
        <div className='flex items-center justify-between gap-3'>
          {/* Search */}
          <div className='flex items-center gap-2 flex-1 max-w-md'>
            <div className='relative flex-1'>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder='Tìm kiếm testcase...'
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
              />
              <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
            </div>
            <button
              onClick={handleSearch}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap'
            >
              Tìm
            </button>
          </div>

          <div className='flex items-center gap-2'>
            {/* Import/Export */}
            <button
              onClick={() => setShowImportModal(true)}
              className='flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors'
              title='Import'
            >
              <Upload size={18} />
              <span className='hidden xl:inline'>Import</span>
            </button>
            <div className='relative group'>
              <button
                className='flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors'
                title='Export'
              >
                <Download size={18} />
                <span className='hidden xl:inline'>Export</span>
              </button>
              <div className='absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-200 z-50 hidden group-hover:block'>
                <button
                  onClick={() => handleExport('csv')}
                  className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-lg'
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-b-lg'
                >
                  Export Excel
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className='relative'>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  activeFilterCount > 0
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                title='Lọc'
              >
                <Filter size={18} />
                <span className='hidden xl:inline'>Lọc</span>
                {activeFilterCount > 0 && (
                  <span className='px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full'>{activeFilterCount}</span>
                )}
              </button>

              {showFilterMenu && (
                <div className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50'>
                  <div className='p-3 border-b border-gray-200 flex items-center justify-between'>
                    <span className='text-sm font-semibold text-gray-900'>Bộ lọc</span>
                    <button onClick={() => setShowFilterMenu(false)} className='p-1 hover:bg-gray-100 rounded'>
                      <X size={16} className='text-gray-600' />
                    </button>
                  </div>
                  <div className='p-4 space-y-4'>
                    {/* Suite filter */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Bộ testcase</label>
                      <select
                        value={filters.suite_id || ''}
                        onChange={(e) =>
                          setFilters({ ...filters, suite_id: e.target.value ? Number(e.target.value) : undefined })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value=''>Tất cả</option>
                        {testSuites.map((suite) => (
                          <option key={suite.suite_id} value={suite.suite_id}>
                            {suite.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority filter */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Độ ưu tiên</label>
                      <select
                        value={filters.priority || ''}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value=''>Tất cả</option>
                        <option value='low'>Thấp</option>
                        <option value='medium'>Trung bình</option>
                        <option value='high'>Cao</option>
                        <option value='critical'>Nghiêm trọng</option>
                      </select>
                    </div>

                    {/* Status filter */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Trạng thái</label>
                      <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value=''>Tất cả</option>
                        <option value='draft'>Nháp</option>
                        <option value='active'>Đang hoạt động</option>
                        <option value='approved'>Đã duyệt</option>
                        <option value='deprecated'>Ngưng sử dụng</option>
                      </select>
                    </div>

                    {/* Creator filter */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Người tạo</label>
                      <select
                        value={filters.created_by || ''}
                        onChange={(e) => setFilters({ ...filters, created_by: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value=''>Tất cả</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Reset button */}
                    <button
                      onClick={() => {
                        setFilters({})
                        setShowFilterMenu(false)
                      }}
                      className='w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors'
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Case List */}
      <div className='flex-1 p-6 overflow-hidden bg-gray-50'>
        {isLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} height='60px' />
            ))}
          </div>
        ) : (
          <TestCaseTreeView
            testCases={testCases}
            testSuites={testSuites}
            onTestCaseClick={handleEditTestCase}
            onCreateSuite={handleCreateSuite}
            onCreateTestCase={handleCreateTestCase}
            onEditSuite={handleEditSuite}
            onDuplicateSuite={handleDuplicateSuite}
            onDeleteSuite={handleDeleteSuite}
          />
        )}
      </div>

      {/* Test Case Detail Modal */}
      {(showTestCaseModal || testcaseIdFromQuery) && (
        <TestCaseDetailModal
          isOpen={true}
          testCase={selectedTestCase}
          testSuites={testSuites}
          selectedSuiteId={selectedSuiteId}
          onClose={handleCloseTestCaseModal}
          onUpdate={handleTestCaseUpdate}
        />
      )}

      {/* Test Suite Modal */}
      {showTestSuiteModal && (
        <TestSuiteModal
          isOpen={true}
          suite={editingSuite}
          parentSuiteId={parentSuiteId}
          testSuites={testSuites}
          onClose={() => {
            setShowTestSuiteModal(false)
            setEditingSuite(null)
            setParentSuiteId(undefined)
          }}
          onUpdate={() => {
            loadTestSuites()
            loadTestCases()
          }}
        />
      )}

      {/* Duplicate Suite Modal */}
      {duplicatingSuite && (
        <DuplicateTestSuiteModal
          isOpen={true}
          suite={duplicatingSuite}
          testSuites={testSuites}
          onClose={() => setDuplicatingSuite(null)}
          onSuccess={() => {
            loadTestSuites()
            loadTestCases()
            setDuplicatingSuite(null)
          }}
        />
      )}

      {/* Delete Suite Modal */}
      {deletingSuite && (
        <DeleteTestSuiteModal
          isOpen={true}
          suite={deletingSuite}
          testSuites={testSuites}
          onClose={() => setDeletingSuite(null)}
          onSuccess={() => {
            loadTestSuites()
            loadTestCases()
            setDeletingSuite(null)
          }}
        />
      )}

      {/* Import Modal */}
      <ImportTestCaseModal
        isOpen={showImportModal}
        testSuites={testSuites}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportTestCase}
      />

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
    </div>
  )
}
