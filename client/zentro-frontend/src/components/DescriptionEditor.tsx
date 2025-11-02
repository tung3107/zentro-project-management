import React, { useRef, useState } from 'react'
import JoditEditor from 'jodit-react'

interface DescriptionEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  height?: number
}

export default function DescriptionEditor({
  value,
  onChange,
  placeholder = 'Nhập mô tả...',
  className = '',
  height = 300
}: DescriptionEditorProps) {
  const editor = useRef<JoditEditor | null>(null)

  return (
    <div className={`w-full ${className}`} data-color-mode='light'>
      <JoditEditor
        ref={editor}
        value={value}
        config={{
          readonly: false, // true = chỉ xem, không gõ được
          height: height,
          placeholder: placeholder,
          toolbarAdaptive: false,
          askBeforePasteFromWord: false,
          askBeforePasteHTML: false,
          toolbarSticky: false,
          buttons: [
            'bold',
            'italic',
            'underline',
            '|',
            'ul',
            'ol',
            '|',
            'indent',
            'outdent',
            '|',
            'fontsize',
            'table',
            '|',
            'link',
            'image',
            'video',
            '|',
            'source'
          ]
        }}
        onBlur={(val) => onChange(val || '')}
      />
    </div>
  )
}
