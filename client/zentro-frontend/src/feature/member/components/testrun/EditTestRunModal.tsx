import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface EditTestRunModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  testRun: {
    test_run_id: number
    name: string
    description: string
  } | null
}

export default function EditTestRunModal({ isOpen, onClose, onSuccess, testRun }: EditTestRunModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (testRun) {
      setName(testRun.name)
      setDescription(testRun.description || '')
    }
  }, [testRun])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !testRun) return

    setIsSubmitting(true)
    try {
      const { updateTestRunAPI } = await import('../../service/testrun.service')
      const res = await updateTestRunAPI(testRun.test_run_id, {
        name,
        description
      })
      if (res.success) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to update test run:', error)
      alert('Có lỗi xảy ra khi cập nhật đợt kiểm thử')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !testRun) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className='bg-white rounded-xl shadow-xl w-full max-w-lg'
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <h2 className='text-xl font-bold text-gray-900'>Sửa đợt kiểm thử</h2>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <X size={20} className='text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Tên đợt kiểm thử <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Ví dụ: Regression Test Sprint 10'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Mô tả chi tiết về đợt test này...'
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none'
            />
          </div>

          {/* Footer */}
          <div className='flex justify-end gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors'
            >
              Hủy
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {isSubmitting ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <span>Cập nhật</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
