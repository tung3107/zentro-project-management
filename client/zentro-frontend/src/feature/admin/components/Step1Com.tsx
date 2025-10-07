import React from 'react'

export default function Step1Com() {
  return (
    <>
      <div className='mt-[24px] px-2'>
        <label className='block text-sm font-medium text-foreground mb-2'>
          Tên project <span className='text-red-500'>*</span>
        </label>
        <input
          className='w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 resize-none'
          rows={4}
          placeholder='Describe your project goals and objectives'
          // value={formData?.description}
          // onChange={(e) => handleInputChange('description', e?.target?.value)}
          required
        />
      </div>
      <div className='mt-[12px] px-2'>
        <label className='block text-sm font-medium text-foreground mb-2'>
          Mô tả <span className='text-red-500'>*</span>
        </label>
        <textarea
          className='w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 resize-none'
          rows={4}
          placeholder='Describe your project goals and objectives'
          // value={formData?.description}
          // onChange={(e) => handleInputChange('description', e?.target?.value)}
          required
        />
      </div>
    </>
  )
}
