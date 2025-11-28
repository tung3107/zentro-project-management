import React, { useEffect, useRef, useState } from 'react'
import { Bold, Italic, Underline, Palette, Type } from 'lucide-react'

interface RichTextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: string
}

const COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Purple', value: '#a855f7' }
]

export default function RichTextInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  minHeight = '100px'
}: RichTextInputProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Initialize content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      // Only update if content is different to avoid cursor jumping
      // This is a simple check, for production might need more robust comparison
      if (value === '' && editorRef.current.innerHTML === '<br>') return
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      onChange(html === '<br>' ? '' : html)
    }
  }

  const execCommand = (command: string, value: string | undefined = undefined) => {
    if (disabled) return
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput() // Trigger update
  }

  const toggleColorPicker = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowColorPicker(!showColorPicker)
  }

  return (
    <div className={`relative border rounded-lg transition-colors ${isFocused ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}>
      {/* Toolbar */}
      <div className='flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg'>
        <button
          type='button'
          onClick={(e) => { e.preventDefault(); execCommand('bold') }}
          disabled={disabled}
          className='p-1.5 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-50'
          title='Bold (Ctrl+B)'
        >
          <Bold size={16} />
        </button>
        <button
          type='button'
          onClick={(e) => { e.preventDefault(); execCommand('italic') }}
          disabled={disabled}
          className='p-1.5 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-50'
          title='Italic (Ctrl+I)'
        >
          <Italic size={16} />
        </button>
        <button
          type='button'
          onClick={(e) => { e.preventDefault(); execCommand('underline') }}
          disabled={disabled}
          className='p-1.5 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-50'
          title='Underline (Ctrl+U)'
        >
          <Underline size={16} />
        </button>
        
        <div className='w-px h-4 bg-gray-300 mx-1' />

        <div className='relative'>
          <button
            type='button'
            onClick={toggleColorPicker}
            disabled={disabled}
            className='p-1.5 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-50 flex items-center gap-1'
            title='Text Color'
          >
            <Palette size={16} />
          </button>
          
          {showColorPicker && (
            <>
              <div className='fixed inset-0 z-10' onClick={() => setShowColorPicker(false)} />
              <div className='absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 grid grid-cols-3 gap-1'>
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type='button'
                    onClick={(e) => {
                      e.preventDefault()
                      execCommand('foreColor', color.value)
                      setShowColorPicker(false)
                    }}
                    className='w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform'
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className='p-3 outline-none text-base text-gray-900 overflow-y-auto'
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
      
      {/* Placeholder simulation */}
      {!value && placeholder && (
        <div className='absolute top-[52px] left-3 text-gray-400 pointer-events-none text-base'>
          {placeholder}
        </div>
      )}
    </div>
  )
}
