import React from 'react'
import type { Project } from '../../../types/project'
import ProjectAvatarWithEdit from '../../../components/ProjectAvatarWithEdit'

export default function Step1Com({
  formData,
  handleChange,
  errors,
  setFormData
}: {
  formData: Project
  handleChange: (field: string, value: number | string) => void
  errors: Record<string, string>
  setFormData: (value: React.SetStateAction<Project>) => void
}) {
  return (
    <>
      <div className='mt-[24px]'>
        <ProjectAvatarWithEdit
          name={formData.project_name}
          onCoverChange={(file) => setFormData((fd) => ({ ...fd, avatar: file }))}
          height={100}
          rounded={12}
        />
      </div>
      <div className='mt-[12px] px-2'>
        <label className='block text-sm font-medium text-foreground mb-2'>
          Tên project <span className='text-red-500'>*</span>
        </label>
        <input
          className='w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 resize-none'
          rows={4}
          placeholder='Điền tên project của bạn'
          value={formData?.project_name}
          name='project_name'
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('project_name', e?.target?.value)}
        />
        {errors.project_name && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.project_name}</p>}
      </div>
      <div className='mt-[12px] px-2'>
        <label className='block text-sm font-medium text-foreground mb-2'>Mô tả</label>
        <textarea
          className='w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 resize-none'
          rows={4}
          placeholder='Mô tả về định hướng của project'
          value={formData?.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e?.target?.value)}
        />
        {errors.description && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.description}</p>}
      </div>
    </>
  )
}
