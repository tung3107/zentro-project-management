import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, FileCode, Globe } from 'lucide-react'
import { toast } from 'sonner'
import type { Task } from '../../../../types/task'
import type { Status } from './types'
import { exportToCSV, exportToExcel, exportToXML, exportToHTML, exportToWord } from './ExportUtils'

interface ExportMenuProps {
  tasks: Task[]
  statuses: Status[]
}

export default function ExportMenu({ tasks, statuses }: ExportMenuProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleExport = (exportFn: () => void, formatName: string) => {
    try {
      exportFn()
      toast.success(`Xuất ${formatName} thành công`)
      setShowMenu(false)
    } catch (error) {
      toast.error(`Xuất ${formatName} thất bại`)
    }
  }

  return (
    <div className='relative'>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className='flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium'
      >
        <Download size={16} />
        Xuất
      </button>

      {showMenu && (
        <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50'>
          <button
            onClick={() => handleExport(() => exportToCSV(tasks, statuses), 'CSV')}
            className='w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2'
          >
            <FileSpreadsheet size={16} className='text-green-600' />
            CSV
          </button>
          <button
            onClick={() => handleExport(() => exportToExcel(tasks, statuses), 'Excel')}
            className='w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2'
          >
            <FileSpreadsheet size={16} className='text-green-700' />
            Excel
          </button>
          <button
            onClick={() => handleExport(() => exportToXML(tasks, statuses), 'XML')}
            className='w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2'
          >
            <FileCode size={16} className='text-orange-600' />
            XML
          </button>
          <button
            onClick={() => handleExport(() => exportToHTML(tasks, statuses), 'HTML')}
            className='w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2'
          >
            <Globe size={16} className='text-blue-600' />
            HTML
          </button>
          <button
            onClick={() => handleExport(() => exportToWord(tasks, statuses), 'Word')}
            className='w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2'
          >
            <FileText size={16} className='text-blue-700' />
            Word
          </button>
        </div>
      )}
    </div>
  )
}
