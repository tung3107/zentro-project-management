import { useState, useRef } from 'react'
import { Sparkles, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { OverlayPanel } from 'primereact/overlaypanel'
import aiChatService from '../../service/aichat.service'
import { markdownToHtml } from '../../../../util/markdownToHtml'

interface AIDescriptionButtonProps {
  projectId: string
  onDescriptionGenerated: (description: string) => void
}

export default function AIDescriptionButton({ projectId, onDescriptionGenerated }: AIDescriptionButtonProps) {
  const op = useRef<OverlayPanel>(null)
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Vui lòng nhập yêu cầu')
      return
    }

    setIsLoading(true)
    try {
      const markdownDescription = await aiChatService.generateTaskDescription(projectId, prompt)
      // Convert markdown to HTML for JoditEditor
      const htmlDescription = markdownToHtml(markdownDescription)
      onDescriptionGenerated(htmlDescription)
      toast.success('Đã tạo mô tả bằng AI!')
      op.current?.hide()
      setPrompt('')
    } catch (error) {
      console.error('Failed to generate description:', error)
      toast.error('Không thể tạo mô tả. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleGenerate()
    } else if (e.key === 'Escape') {
      op.current?.hide()
    }
  }

  return (
    <>
      <button
        type='button'
        onClick={(e) => op.current?.toggle(e)}
        className='inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors'
        title='Tạo mô tả bằng AI'
      >
        <Sparkles size={16} />
        <span>Tạo bằng AI</span>
      </button>

      <OverlayPanel ref={op} className='w-96' onHide={() => setPrompt('')}>
        <div className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Sparkles size={18} className='text-purple-600' />
              <h3 className='text-sm font-semibold text-gray-900'>Tạo mô tả bằng AI</h3>
            </div>
            <button
              onClick={() => {
                op.current?.hide()
                setPrompt('')
              }}
              className='p-1 hover:bg-gray-100 rounded transition-colors'
            >
              <X size={16} className='text-gray-500' />
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Mô tả task của bạn cần làm gì... (Ctrl+Enter để tạo)'
            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
            rows={4}
            autoFocus
            disabled={isLoading}
          />

          <div className='flex items-center justify-between'>
            <p className='text-xs text-gray-500'>Ctrl+Enter để tạo, Esc để đóng</p>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className='inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors'
            >
              {isLoading ? (
                <>
                  <svg className='w-4 h-4 animate-spin' viewBox='0 0 24 24' fill='none'>
                    <circle cx='12' cy='12' r='10' stroke='rgba(255,255,255,0.3)' strokeWidth='4'></circle>
                    <path d='M4 12a8 8 0 018-8' stroke='white' strokeWidth='4' strokeLinecap='round'></path>
                  </svg>
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Tạo mô tả</span>
                </>
              )}
            </button>
          </div>
        </div>
      </OverlayPanel>
    </>
  )
}
