import { useState, useRef } from 'react'
import { X, CheckCircle, XCircle, AlertCircle, MinusCircle, Upload, Image as ImageIcon, Trash2 } from 'lucide-react'
import { uploadTestResultImagesAPI } from '../../service/testrun.service'

interface TestResultModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { status: string; note: string; image_urls: string[] }) => Promise<void>
  currentStatus?: string
  currentNote?: string
  currentImages?: string[]
}

export default function TestResultModal({
  isOpen,
  onClose,
  onSubmit,
  currentStatus = 'untested',
  currentNote = '',
  currentImages = []
}: TestResultModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [note, setNote] = useState(currentNote)
  const [imageUrls, setImageUrls] = useState<string[]>(currentImages)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status)
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      alert('Vui lòng chọn file ảnh')
      return
    }

    // setUploadingImages(true)
    // try {
    //   const res = await uploadTestResultImagesAPI(imageFiles)
    //   if (res.success) {
    //     setImageUrls((prev) => [...prev, ...res.data])
    //   }
    // } catch (error) {
    //   console.error('Failed to upload images:', error)
    //   alert('Tải ảnh lên thất bại')
    // } finally {
    //   setUploadingImages(false)
    // }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    const files: File[] = []

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) files.push(file)
      }
    }

    // if (files.length > 0) {
    //   setUploadingImages(true)
    //   try {
    //     const res = await uploadTestResultImagesAPI(files)
    //     if (res.success) {
    //       setImageUrls((prev) => [...prev, ...res.data])
    //     }
    //   } catch (error) {
    //     console.error('Failed to upload pasted images:', error)
    //     alert('Tải ảnh lên thất bại')
    //   } finally {
    //     setUploadingImages(false)
    //   }
    // }
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (selectedStatus === 'untested') {
      alert('Vui lòng chọn kết quả test')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        status: selectedStatus,
        note,
        image_urls: imageUrls
      })
      onClose()
    } catch (error) {
      console.error('Failed to submit test result:', error)
      alert('Lưu kết quả thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className='fixed inset-0 z-50 flex items-center justify-center p-4'
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div
          className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col'
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {/* Header */}
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
            <h2 className='text-xl font-bold text-gray-900'>Cập nhật kết quả Test</h2>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto p-6 space-y-6'>
            {/* Status Selection */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-3'>Kết quả Test</label>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  onClick={() => handleStatusSelect('passed')}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    selectedStatus === 'passed'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <CheckCircle size={20} className={selectedStatus === 'passed' ? 'text-green-600' : 'text-gray-400'} />
                  <span className={`font-medium ${selectedStatus === 'passed' ? 'text-green-700' : 'text-gray-600'}`}>
                    Đạt
                  </span>
                </button>
                <button
                  onClick={() => handleStatusSelect('failed')}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    selectedStatus === 'failed' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <XCircle size={20} className={selectedStatus === 'failed' ? 'text-red-600' : 'text-gray-400'} />
                  <span className={`font-medium ${selectedStatus === 'failed' ? 'text-red-700' : 'text-gray-600'}`}>
                    Thất bại
                  </span>
                </button>
                <button
                  onClick={() => handleStatusSelect('blocked')}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    selectedStatus === 'blocked'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <AlertCircle
                    size={20}
                    className={selectedStatus === 'blocked' ? 'text-orange-600' : 'text-gray-400'}
                  />
                  <span className={`font-medium ${selectedStatus === 'blocked' ? 'text-orange-700' : 'text-gray-600'}`}>
                    Bị chặn
                  </span>
                </button>
                <button
                  onClick={() => handleStatusSelect('skipped')}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    selectedStatus === 'skipped'
                      ? 'border-gray-500 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MinusCircle size={20} className={selectedStatus === 'skipped' ? 'text-gray-600' : 'text-gray-400'} />
                  <span className={`font-medium ${selectedStatus === 'skipped' ? 'text-gray-700' : 'text-gray-600'}`}>
                    Bỏ qua
                  </span>
                </button>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder='Thêm ghi chú về kết quả test...'
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none'
                onPaste={handlePaste}
              />
              <p className='text-xs text-gray-500 mt-1'>Bạn có thể paste ảnh trực tiếp vào ô ghi chú (Ctrl+V)</p>
            </div>

            {/* Image Upload Area */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>Ảnh minh chứng</label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className='hidden'
                />
                {uploadingImages ? (
                  <div className='py-4'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                    <p className='text-sm text-gray-500 mt-2'>Đang tải ảnh lên...</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={48} className='mx-auto text-gray-400 mb-3' />
                    <p className='text-sm text-gray-600 mb-2'>Kéo thả ảnh vào đây hoặc</p>
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors inline-flex items-center gap-2'
                    >
                      <Upload size={16} />
                      Chọn ảnh
                    </button>
                  </>
                )}
              </div>
              {/* Image Preview */}
              {/* {imageUrls.length > 0 && (
                <div className='mt-4 grid grid-cols-3 gap-3'>
                  {imageUrls.map((url, index) => (
                    <div key={index} className='relative group'>
                      <img
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        className='w-full h-24 object-cover rounded-lg border border-gray-200'
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className='absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )} */}
            </div>
          </div>

          {/* Footer */}
          <div className='px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50'>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className='px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50'
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedStatus === 'untested'}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu kết quả'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
