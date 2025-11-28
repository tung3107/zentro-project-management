import { useState } from 'react'
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react'
import type { TestCase, TestSuite } from '../../../../types/testcase'
interface TestRunSelectionTreeProps {
  testCases: TestCase[]
  testSuites: TestSuite[]
  selectedIds: number[]
  onSelectionChange: (ids: number[]) => void
}

interface TreeNode {
  type: 'suite' | 'testcase'
  suite?: TestSuite
  testCase?: TestCase
  children?: TreeNode[]
}

export default function TestRunSelectionTree({
  testCases,
  testSuites,
  selectedIds,
  onSelectionChange
}: TestRunSelectionTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())

  // Build tree structure
  const buildTree = (): TreeNode[] => {
    const tree: TreeNode[] = []

    const findChildSuites = (parentId: number | null | undefined): TestSuite[] => {
      return testSuites.filter((s) => {
        if (parentId === null || parentId === undefined) {
          return s.parent_suite_id === null || s.parent_suite_id === undefined
        }
        return s.parent_suite_id === parentId
      })
    }

    const buildSuiteNode = (suite: TestSuite): TreeNode => {
      const childSuites = findChildSuites(suite.suite_id)
      const childTestCases = testCases.filter((tc) => tc.suite_id === suite.suite_id)

      const children: TreeNode[] = [
        ...childSuites.map((s) => buildSuiteNode(s)),
        ...childTestCases.map((tc): TreeNode => ({ type: 'testcase', testCase: tc }))
      ]

      return { type: 'suite', suite, children }
    }

    const rootSuites = findChildSuites(null)
    rootSuites.forEach((suite) => tree.push(buildSuiteNode(suite)))

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
        children: orphanTestCases.map((tc): TreeNode => ({ type: 'testcase', testCase: tc }))
      })
    }

    return tree
  }

  const tree = buildTree()

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) newExpanded.delete(nodeId)
    else newExpanded.add(nodeId)
    setExpandedNodes(newExpanded)
  }

  const handleCheck = (node: TreeNode, checked: boolean) => {
    let newSelected = [...selectedIds]

    const traverse = (n: TreeNode) => {
      if (n.type === 'testcase' && n.testCase) {
        if (checked) {
          if (!newSelected.includes(n.testCase.testcase_id)) newSelected.push(n.testCase.testcase_id)
        } else {
          newSelected = newSelected.filter((id) => id !== n.testCase?.testcase_id)
        }
      }
      if (n.children) {
        n.children.forEach(traverse)
      }
    }

    traverse(node)
    onSelectionChange(newSelected)
  }

  const isNodeChecked = (node: TreeNode): boolean => {
    if (node.type === 'testcase' && node.testCase) {
      return selectedIds.includes(node.testCase.testcase_id)
    }
    if (node.children && node.children.length > 0) {
      return node.children.every((child) => isNodeChecked(child))
    }
    return false
  }

  const isNodeIndeterminate = (node: TreeNode): boolean => {
    if (node.type === 'testcase') return false
    if (!node.children) return false

    const checkedCount = node.children.filter((child) => isNodeChecked(child)).length
    const indeterminateCount = node.children.filter((child) => isNodeIndeterminate(child)).length

    return (checkedCount > 0 && checkedCount < node.children.length) || indeterminateCount > 0
  }

  const renderTree = (nodes: TreeNode[], depth: number = 0) => {
    return nodes.map((node, idx) => {
      if (node.type === 'suite' && node.suite) {
        const isExpanded = expandedNodes.has(node.suite.suite_id)
        const checked = isNodeChecked(node)
        const indeterminate = !checked && isNodeIndeterminate(node)

        return (
          <div key={`suite-${node.suite.suite_id}-${idx}`}>
            <div
              className='flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
              style={{ paddingLeft: `${depth * 20 + 8}px` }}
            >
              <button onClick={() => toggleNode(node.suite!.suite_id)} className='p-1 hover:bg-gray-200 rounded'>
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              <input
                type='checkbox'
                checked={checked}
                ref={(input) => {
                  if (input) input.indeterminate = indeterminate
                }}
                onChange={(e) => handleCheck(node, e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />

              <div className='flex items-center gap-2 flex-1' onClick={() => toggleNode(node.suite!.suite_id)}>
                {isExpanded ? (
                  <FolderOpen size={18} className='text-blue-600' />
                ) : (
                  <Folder size={18} className='text-blue-600' />
                )}
                <span className='text-sm font-medium text-gray-900'>{node.suite.name}</span>
              </div>
            </div>
            {isExpanded && node.children && renderTree(node.children, depth + 1)}
          </div>
        )
      } else if (node.type === 'testcase' && node.testCase) {
        const checked = selectedIds.includes(node.testCase.testcase_id)
        return (
          <div
            key={`testcase-${node.testCase.testcase_id}-${idx}`}
            className='flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
            style={{ paddingLeft: `${depth * 20 + 32}px` }}
          >
            <input
              type='checkbox'
              checked={checked}
              onChange={(e) => handleCheck(node, e.target.checked)}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <FileText size={16} className='text-gray-500' />
            <span className='text-xs font-mono text-blue-600 font-medium'>{node.testCase.testcase_code}</span>
            <span className='text-sm text-gray-700 truncate flex-1'>{node.testCase.name}</span>
          </div>
        )
      }
      return null
    })
  }

  return <div className='select-none'>{renderTree(tree)}</div>
}
