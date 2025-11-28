import { useState, useEffect, useRef } from 'react'
import {
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Copy
} from 'lucide-react'
import type { TestCase, TestSuite } from '../../../../types/testcase'

interface TestCaseTreeViewProps {
  testCases: TestCase[]
  testSuites: TestSuite[]
  onTestCaseClick: (testCase: TestCase) => void
  onCreateSuite: (parentId?: number) => void
  onCreateTestCase: (suiteId?: number) => void
  onEditSuite: (suite: TestSuite) => void
  onDuplicateSuite: (suite: TestSuite) => void
  onDeleteSuite: (suite: TestSuite) => void
}

interface TreeNode {
  type: 'suite' | 'testcase'
  suite?: TestSuite
  testCase?: TestCase
  children?: TreeNode[]
  isExpanded?: boolean
}

export default function TestCaseTreeView({
  testCases,
  testSuites,
  onTestCaseClick,
  onCreateSuite,
  onCreateTestCase,
  onEditSuite,
  onDuplicateSuite,
  onDeleteSuite
}: TestCaseTreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())
  const [selectedNode, setSelectedNode] = useState<{ type: string; id: number } | null>(null)
  const [showMenuFor, setShowMenuFor] = useState<{ type: string; id: number } | null>(null)
  const [showDetailMenu, setShowDetailMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const detailMenuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenuFor(null)
      }
      if (detailMenuRef.current && !detailMenuRef.current.contains(event.target as Node)) {
        setShowDetailMenu(false)
      }
    }

    if (showMenuFor || showDetailMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenuFor, showDetailMenu])

  // Build tree structure
  const buildTree = (): TreeNode[] => {
    const tree: TreeNode[] = []

    // Helper to find children suites
    const findChildSuites = (parentId: number | null | undefined): TestSuite[] => {
      return testSuites.filter((s) => {
        // Match both null and undefined as root suites
        if (parentId === null || parentId === undefined) {
          return s.parent_suite_id === null || s.parent_suite_id === undefined
        }
        return s.parent_suite_id === parentId
      })
    }

    // Helper to build suite node recursively
    const buildSuiteNode = (suite: TestSuite): TreeNode => {
      const childSuites = findChildSuites(suite.suite_id)
      const childTestCases = testCases.filter((tc) => tc.suite_id === suite.suite_id)

      const children: TreeNode[] = [
        ...childSuites.map((s) => buildSuiteNode(s)),
        ...childTestCases.map(
          (tc): TreeNode => ({
            type: 'testcase',
            testCase: tc
          })
        )
      ]

      return {
        type: 'suite',
        suite,
        children
      }
    }

    // Add root suites
    const rootSuites = findChildSuites(null)
    rootSuites.forEach((suite) => {
      tree.push(buildSuiteNode(suite))
    })

    // Add testcases without suite
    const orphanTestCases = testCases.filter((tc) => !tc.suite_id)
    if (orphanTestCases.length > 0) {
      tree.push({
        type: 'suite',
        suite: {
          suite_id: -1,
          name: 'Testcase không có bộ testcase',
          description: '',
          parent_suite_id: null,
          project_id: 0,
          created_by: 0,
          created_at: '',
          updated_at: ''
        },
        children: orphanTestCases.map(
          (tc): TreeNode => ({
            type: 'testcase',
            testCase: tc
          })
        )
      })
    }

    return tree
  }

  const tree = buildTree()

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleNodeClick = (node: TreeNode) => {
    if (node.type === 'suite' && node.suite) {
      setSelectedNode({ type: 'suite', id: node.suite.suite_id })
      toggleNode(node.suite.suite_id)
    } else if (node.type === 'testcase' && node.testCase) {
      setSelectedNode({ type: 'testcase', id: node.testCase.testcase_id })
      onTestCaseClick(node.testCase)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={14} className='text-green-600' />
      case 'active':
        return <Clock size={14} className='text-blue-600' />
      case 'deprecated':
        return <XCircle size={14} className='text-gray-600' />
      case 'draft':
        return <AlertCircle size={14} className='text-yellow-600' />
      default:
        return null
    }
  }

  const renderTree = (nodes: TreeNode[], depth: number = 0) => {
    return nodes.map((node, idx) => {
      if (node.type === 'suite' && node.suite) {
        const isExpanded = expandedNodes.has(node.suite.suite_id)
        const isSelected = selectedNode?.type === 'suite' && selectedNode.id === node.suite.suite_id
        const hasChildren = (node.children?.length || 0) > 0

        return (
          <div key={`suite-${node.suite.suite_id}-${idx}`}>
            <div
              className={`group flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                isSelected ? 'bg-blue-50 border-l-2 border-blue-600' : ''
              }`}
              style={{ paddingLeft: `${depth * 20 + 12}px` }}
              onClick={() => handleNodeClick(node)}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown size={16} className='text-gray-600 flex-shrink-0' />
                ) : (
                  <ChevronRight size={16} className='text-gray-600 flex-shrink-0' />
                )
              ) : (
                <div className='w-4' />
              )}
              {isExpanded ? (
                <FolderOpen size={16} className='text-blue-600 flex-shrink-0' />
              ) : (
                <Folder size={16} className='text-blue-600 flex-shrink-0' />
              )}
              <span className='text-sm font-medium text-gray-900 flex-1 truncate'>{node.suite.name}</span>

              {/* Item count badge */}
              <span className='text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded'>
                {node.children?.length || 0}
              </span>

              {node.suite.suite_id !== -1 && (
                <div className='relative' ref={showMenuFor?.id === node.suite.suite_id ? menuRef : null}>
                  <button
                    className='p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity'
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenuFor({ type: 'suite', id: node.suite!.suite_id })
                    }}
                  >
                    <MoreVertical size={14} className='text-gray-600' />
                  </button>

                  {showMenuFor?.type === 'suite' && showMenuFor.id === node.suite.suite_id && (
                    <div className='absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onCreateTestCase(node.suite!.suite_id)
                          setShowMenuFor(null)
                        }}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100'
                      >
                        <Plus size={14} />
                        Tạo testcase
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onCreateSuite(node.suite!.suite_id)
                          setShowMenuFor(null)
                        }}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100'
                      >
                        <Plus size={14} />
                        Tạo bộ testcase
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDuplicateSuite(node.suite!)
                          setShowMenuFor(null)
                        }}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100'
                      >
                        <Copy size={14} />
                        Sao chép bộ testcase
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditSuite(node.suite!)
                          setShowMenuFor(null)
                        }}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2'
                      >
                        <Edit size={14} />
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteSuite(node.suite!)
                          setShowMenuFor(null)
                        }}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t border-gray-100'
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {isExpanded && node.children && renderTree(node.children, depth + 1)}
          </div>
        )
      } else if (node.type === 'testcase' && node.testCase) {
        const isSelected = selectedNode?.type === 'testcase' && selectedNode.id === node.testCase.testcase_id

        return (
          <div
            key={`testcase-${node.testCase.testcase_id}-${idx}`}
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 ${
              isSelected ? 'bg-blue-50 border-l-2 border-blue-600' : ''
            }`}
            style={{ paddingLeft: `${depth * 20 + 32}px` }}
            onClick={() => handleNodeClick(node)}
          >
            <FileText size={14} className='text-gray-600 flex-shrink-0' />
            <span className='text-xs font-mono text-blue-600 flex-shrink-0'>{node.testCase.testcase_code}</span>
            <span className='text-sm text-gray-900 flex-1 truncate'>{node.testCase.name}</span>
            <div className='flex items-center gap-1'>
              {getStatusIcon(node.testCase.status)}
              <span className={`text-xs ${getPriorityColor(node.testCase.priority)}`}>●</span>
            </div>
          </div>
        )
      }

      return null
    })
  }

  const getSelectedDetails = () => {
    if (!selectedNode) return null

    if (selectedNode.type === 'suite') {
      const suite = testSuites.find((s) => s.suite_id === selectedNode.id)
      if (!suite) return null

      const suiteTestCases = testCases.filter((tc) => tc.suite_id === suite.suite_id)
      const childSuites = testSuites.filter((s) => s.parent_suite_id === suite.suite_id)

      return (
        <div className='p-6'>
          <div className='flex items-start justify-between mb-6'>
            <div className='flex items-center gap-3 flex-1'>
              <Folder size={32} className='text-blue-600' />
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-1'>
                  <h2 className='text-2xl font-bold text-gray-900'>{suite.name}</h2>
                  {/* Compact badges */}
                  <div className='flex items-center gap-1.5'>
                    <span className='inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded'>
                      {suite.statistics?.testcase_count || 0} TC
                    </span>
                    <span className='inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded'>
                      {suite.statistics?.suite_count || 0} Bộ TC
                    </span>
                  </div>
                </div>
                <p className='text-sm text-gray-600 mt-1'>{suite.description || 'Không có mô tả'}</p>
              </div>
            </div>

            {/* More menu button */}
            {suite.suite_id !== -1 && (
              <div className='relative' ref={detailMenuRef}>
                <button
                  className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDetailMenu(!showDetailMenu)
                  }}
                >
                  <MoreVertical size={20} className='text-gray-600' />
                </button>

                {showDetailMenu && (
                  <div className='absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCreateTestCase(suite.suite_id)
                        setShowDetailMenu(false)
                      }}
                      className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100'
                    >
                      <Plus size={14} />
                      Tạo testcase
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCreateSuite(suite.suite_id)
                        setShowDetailMenu(false)
                      }}
                      className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100'
                    >
                      <Plus size={14} />
                      Tạo bộ testcase
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicateSuite(suite)
                        setShowDetailMenu(false)
                      }}
                      className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100'
                    >
                      <Copy size={14} />
                      Sao chép bộ testcase
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditSuite(suite)
                        setShowDetailMenu(false)
                      }}
                      className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2'
                    >
                      <Edit size={14} />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSuite(suite)
                        setShowDetailMenu(false)
                      }}
                      className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t border-gray-100'
                    >
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Simple Statistics - Removed, now in header badges */}

          {/* Child Suites Section */}
          {childSuites.length > 0 && (
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-3'>Bộ testcase con</h3>
              <div className='space-y-2'>
                {childSuites.map((childSuite) => (
                  <div
                    key={childSuite.suite_id}
                    onClick={() => setSelectedNode({ type: 'suite', id: childSuite.suite_id })}
                    className='flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'
                  >
                    <div className='flex items-center gap-3 flex-1'>
                      <Folder size={18} className='text-purple-600' />
                      <span className='text-sm font-medium text-gray-900'>{childSuite.name}</span>
                    </div>
                    <div className='flex items-center gap-3 text-xs text-gray-500'>
                      <span>{childSuite.statistics?.testcase_count || 0} TCs</span>
                      <span>{childSuite.statistics?.suite_count || 0} Bộ testcase</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>Testcase trong bộ này</h3>
            <div className='space-y-2'>
              {suiteTestCases.map((tc) => (
                <div
                  key={tc.testcase_id}
                  onClick={() => onTestCaseClick(tc)}
                  className='flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'
                >
                  <div className='flex items-center gap-3 flex-1'>
                    <FileText size={18} className='text-gray-600' />
                    <span className='text-sm font-mono text-blue-600'>{tc.testcase_code}</span>
                    <span className='text-sm font-medium text-gray-900'>{tc.name}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    {getStatusIcon(tc.status)}
                    <span className={`text-sm ${getPriorityColor(tc.priority)}`}>●</span>
                  </div>
                </div>
              ))}
              {suiteTestCases.length === 0 && (
                <p className='text-center text-gray-500 py-8'>Không có testcase nào trong bộ này</p>
              )}
            </div>
          </div>
        </div>
      )
    } else if (selectedNode.type === 'testcase') {
      const testCase = testCases.find((tc) => tc.testcase_id === selectedNode.id)
      if (!testCase) return null

      return (
        <div className='p-6'>
          <div className='flex items-start gap-3 mb-6'>
            <FileText size={32} className='text-blue-600 flex-shrink-0' />
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-sm font-mono font-semibold text-blue-600'>{testCase.testcase_code}</span>
                {getStatusIcon(testCase.status)}
              </div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>{testCase.name}</h2>
              <p className='text-gray-600'>{testCase.description || 'Không có mô tả'}</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div>
              <p className='text-sm font-medium text-gray-700'>Độ ưu tiên</p>
              <p className={`text-lg font-semibold ${getPriorityColor(testCase.priority)}`}>
                {testCase.priority.toUpperCase()}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Phiên bản</p>
              <p className='text-lg font-semibold text-gray-900'>v{testCase.version}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Các bước</p>
              <p className='text-lg font-semibold text-gray-900'>{testCase.steps?.length || 0}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Đã tạo</p>
              <p className='text-sm text-gray-600'>{new Date(testCase.created_at).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          {testCase.pre_condition && (
            <div className='mb-4'>
              <p className='text-sm font-medium text-gray-700 mb-1'>Điều kiện tiên quyết</p>
              <p className='text-sm text-gray-900 bg-gray-50 p-3 rounded-lg'>{testCase.pre_condition}</p>
            </div>
          )}

          {testCase.expected_result && (
            <div className='mb-4'>
              <p className='text-sm font-medium text-gray-700 mb-1'>Kết quả mong đợi</p>
              <p className='text-sm text-gray-900 bg-gray-50 p-3 rounded-lg'>{testCase.expected_result}</p>
            </div>
          )}

          <button
            onClick={() => onTestCaseClick(testCase)}
            className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
          >
            Xem chi tiết đầy đủ
          </button>
        </div>
      )
    }

    return null
  }

  if (testCases.length === 0 && testSuites.length === 0) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
        <FileText size={48} className='text-gray-400 mx-auto mb-3' />
        <p className='text-gray-600 font-medium'>Chưa có testcase hoặc bộ testcase nào</p>
        <p className='text-gray-500 text-sm mt-1'>Tạo bộ testcase hoặc testcase đầu tiên để bắt đầu</p>
      </div>
    )
  }

  return (
    <div className='flex gap-4 h-full'>
      {/* Left panel - Tree */}
      <div className='w-80 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col'>
        <div className='px-4 py-3 border-b border-gray-200 bg-gray-50'>
          <h3 className='font-semibold text-gray-900'>Bộ testcase & Testcase</h3>
        </div>
        <div className='flex-1 overflow-auto'>{renderTree(tree)}</div>
      </div>

      {/* Right panel - Details */}
      <div className='flex-1 bg-white rounded-xl border border-gray-200 overflow-auto'>
        {selectedNode ? (
          getSelectedDetails()
        ) : (
          <div className='flex items-center justify-center h-full text-gray-500'>
            <div className='text-center'>
              <Folder size={48} className='mx-auto mb-3 opacity-50' />
              <p>Chọn một bộ testcase hoặc testcase để xem chi tiết</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
