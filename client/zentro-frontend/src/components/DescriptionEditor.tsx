import React from 'react'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import MDEditor from '@uiw/react-md-editor'

interface DescriptionEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function DescriptionEditor({
  value,
  onChange,
  placeholder = 'Nhập mô tả...',
  className = ''
}: DescriptionEditorProps) {
  return (
    <div className={`w-full ${className}`} data-color-mode='light'>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview='edit'
        height={300}
        textareaProps={{
          placeholder
        }}
      />
    </div>
  )
}
