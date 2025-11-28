import React, { useState, useRef } from 'react'
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import type { TestSuite } from '../../../../types/testcase'

interface ImportTestCaseModalProps {
  isOpen: boolean
  testSuites: TestSuite[]
  onClose: () => void
  onImport: (file: File, suiteId?: number) => Promise<void>
}

export default function ImportTestCaseModal({
  isOpen,
  testSuites,
  onClose,
  onImport
}: ImportTestCaseModalProps) {
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | undefined>(undefined)
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (
        selectedFile.type === 'text/csv' ||
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.name.endsWith('.csv') ||
        selectedFile.name.endsWith('.xlsx')
      ) {
        setFile(selectedFile)
        setError(null)
      } else {
        setFile(null)
        setError('Vui lòng chọn file CSV hoặc Excel (.xlsx)')
      }
    }
  }

  const handleDownloadTemplate = () => {
    // Create a sample CSV content
    const headers = ['Name', 'Description', 'Pre-condition', 'Priority', 'Status', 'Step Action', 'Step Data', 'Step Expected Result']
    const sampleRow = ['Login Test', 'Verify user login', 'User is on login page', 'High', 'Active', 'Enter username', 'user1', 'Field populated']
    
    const csvContent = [
      headers.join(','),
      sampleRow.join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'testcase_import_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Vui lòng chọn file để import')
      return
    }

    setIsImporting(true)
    setError(null)

    try {
      await onImport(file, selectedSuiteId)
      onClose()
    } catch (err) {
      console.error('Import failed:', err)
      setError('Có lỗi xảy ra khi import. Vui lòng kiểm tra lại file và thử lại.')
    } finally {
      setIsImporting(false)
    }
  }

  // Recursive function to render suite options with indentation
  const renderSuiteOptions = (parentId: number | null | undefined, depth: number = 0) => {
    const children = testSuites.filter((s) => {
      if (parentId === null || parentId === undefined) {
        return s.parent_suite_id === null || s.parent_suite_id === undefined
      }
      return s.parent_suite_id === parentId
    })

    return children.map((suite) => (
      <>
        <option value={suite.suite_id}>
          {'\u00A0'.repeat(depth * 4)}{suite.name}
        </option>
        {renderSuiteOptions(suite.suite_id, depth + 1)}
      </>
    ))
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4' style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Upload size={20} className='text-blue-600' />
            </div>
            <h2 className='text-xl font-bold text-gray-900'>Import Testcase</h2>
          </div>
          <button 
            onClick={onClose}
            className='p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          {/* Template Download */}
          <div className='bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3'>
            <AlertCircle size={20} className='text-blue-600 flex-shrink-0 mt-0.5' />
            <div className='flex-1'>
              <p className='text-sm text-blue-900 font-medium mb-1'>Chưa có file mẫu?</p>
              <p className='text-sm text-blue-700 mb-3'>
                Tải xuống file mẫu để đảm bảo dữ liệu được import chính xác.
              </p>
              <button
                onClick={handleDownloadTemplate}
                className='flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline'
              >
                <Download size={16} />
                Tải xuống template (.csv)
              </button>
            </div>
          </div>

          {/* Suite Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Chọn bộ testcase (Tùy chọn)
            </label>
            <select
              value={selectedSuiteId || ''}
              onChange={(e) => setSelectedSuiteId(e.target.value ? Number(e.target.value) : undefined)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>-- Import vào thư mục gốc --</option>
              {renderSuiteOptions(null)}
            </select>
            <p className='text-xs text-gray-500 mt-1'>
              Nếu không chọn, testcase sẽ được import vào thư mục gốc.
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              File Import <span className='text-red-500'>*</span>
            </label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type='file'
                accept='.csv,.xlsx,.xls'
                onChange={handleFileChange}
                className='hidden'
              />
              
              {file ? (
                <div className='flex flex-col items-center gap-2'>
                  <FileSpreadsheet size={32} className='text-green-600' />
                  <p className='text-sm font-medium text-green-900'>{file.name}</p>
                  <p className='text-xs text-green-700'>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                    className='text-xs text-red-600 hover:underline mt-1'
                  >
                    Xóa file
                  </button>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-2 text-gray-500'>
                  <Upload size={32} />
                  <p className='text-sm font-medium'>Click để chọn file hoặc kéo thả vào đây</p>
                  <p className='text-xs'>Hỗ trợ .csv, .xlsx</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2'>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm'
            disabled={isImporting}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || isImporting}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isImporting ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Đang import...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
