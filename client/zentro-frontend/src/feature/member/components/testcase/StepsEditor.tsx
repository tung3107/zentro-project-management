import { useState } from 'react'
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import RichTextInput from './RichTextInput'
import type { TestCaseStep } from '../../../../types/testcase'

interface StepsEditorProps {
  steps: TestCaseStep[]
  onChange: (steps: TestCaseStep[]) => void
  disabled?: boolean
}

export default function StepsEditor({ steps, onChange, disabled = false }: StepsEditorProps) {
  const addStep = () => {
    const newStep: TestCaseStep = {
      step_number: steps.length + 1,
      description: '',
      data: '',
      expected_result: ''
    }
    onChange([...steps, newStep])
  }

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index)
    // Renumber steps
    const renumbered = newSteps.map((step, i) => ({ ...step, step_number: i + 1 }))
    onChange(renumbered)
  }

  const updateStep = (index: number, field: keyof TestCaseStep, value: string | number) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    onChange(newSteps)
  }

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === steps.length - 1)) {
      return
    }

    const newSteps = [...steps]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    // Swap
    ;[newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]

    // Renumber
    const renumbered = newSteps.map((step, i) => ({ ...step, step_number: i + 1 }))
    onChange(renumbered)
  }

  return (
    <div className='space-y-4'>
      {steps.map((step, index) => (
        <div
          key={index}
          className='p-4 bg-white rounded-lg border border-gray-300 shadow-sm hover:border-blue-400 transition-all group'
        >
          {/* Header with controls */}
          <div className='flex items-center justify-between mb-3 pb-2 border-b border-gray-100'>
            <div className='flex items-center gap-2'>
              <GripVertical size={16} className='text-gray-400 cursor-move' />
              <span className='text-sm font-bold text-gray-800'>Bước {step.step_number}</span>
            </div>

            {/* Action buttons */}
            <div className='flex gap-1'>
              <button
                type='button'
                onClick={() => moveStep(index, 'up')}
                disabled={disabled || index === 0}
                className='p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed'
                title='Di chuyển lên'
              >
                <ChevronUp size={16} className='text-gray-600' />
              </button>
              <button
                type='button'
                onClick={() => moveStep(index, 'down')}
                disabled={disabled || index === steps.length - 1}
                className='p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed'
                title='Di chuyển xuống'
              >
                <ChevronDown size={16} className='text-gray-600' />
              </button>
              <button
                type='button'
                onClick={() => removeStep(index)}
                disabled={disabled}
                className='p-1 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed'
                title='Xóa bước'
              >
                <Trash2 size={16} className='text-red-600' />
              </button>
            </div>
          </div>

          {/* Step fields - Horizontal Layout */}
          <div className='flex flex-col lg:flex-row gap-3'>
            {/* Step Action */}
            <div className='flex-1 lg:w-[40%]'>
              <label className='block text-[10px] font-bold text-gray-500 uppercase mb-1'>Hành động <span className='text-red-500'>*</span></label>
              <RichTextInput
                value={step.description}
                onChange={(value) => updateStep(index, 'description', value)}
                disabled={disabled}
                placeholder='Hành động...'
                minHeight='60px'
              />
            </div>

            {/* Data */}
            <div className='flex-1 lg:w-[30%]'>
              <label className='block text-[10px] font-bold text-gray-500 uppercase mb-1'>Dữ liệu</label>
              <RichTextInput
                value={step.data || ''}
                onChange={(value) => updateStep(index, 'data', value)}
                disabled={disabled}
                placeholder='Dữ liệu...'
                minHeight='60px'
              />
            </div>

            {/* Expected Result */}
            <div className='flex-1 lg:w-[30%]'>
              <label className='block text-[10px] font-bold text-gray-500 uppercase mb-1'>Kết quả mong đợi</label>
              <RichTextInput
                value={step.expected_result || ''}
                onChange={(value) => updateStep(index, 'expected_result', value)}
                disabled={disabled}
                placeholder='Kết quả...'
                minHeight='60px'
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add step button */}
      <button
        type='button'
        onClick={addStep}
        disabled={disabled}
        className='w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm'
      >
        <Plus size={16} />
        <span className='font-medium'>Thêm bước</span>
      </button>

      {steps.length === 0 && (
        <p className='text-sm text-gray-500 text-center py-4'>Chưa có bước nào. Nhấn "Thêm bước" để bắt đầu.</p>
      )}
    </div>
  )
}
