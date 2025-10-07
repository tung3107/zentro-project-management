import React, { useState, type Dispatch, type SetStateAction } from 'react'
import type { Project } from '../../../types/project'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../auth/hooks/useAuth'
import { Icon } from 'lucide-react'
import Button from '../../../components/Button'
import Step1Com from './Step1Com'

export default function AddProjectCom({
  setAddModalOpen,
  setAddModalContent,
  onSuccess
}: {
  setAddModalOpen: Dispatch<SetStateAction<boolean>>
  setAddModalContent: Dispatch<SetStateAction<React.ReactNode | null>>
  onSuccess?: () => void
}) {
  const [formData, setFormData] = useState<Project>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 3))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.project_name) newErrors.project_name = 'Tên project là trường bắt buộc'

    if (!formData.start_date) {
      newErrors.start_date = 'Ngày bắt đầu là trường bắt buộc'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Ngày kết thúc là trường bắt buộc'
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)

      if (start > end) {
        newErrors.start_date = 'Ngày bắt đầu không được sau ngày kết thúc'
        newErrors.end_date = 'Ngày kết thúc không được trước ngày bắt đầu'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDateChange = (date: Date | null, field: 'start_date' | 'end_date') => {
    if (!date) return
    setFormData({
      ...formData,
      [field]: date
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (validate()) {
      try {
        setIsLoading(true)
        const hasFile = formData.avatar && typeof formData.avatar !== 'string' && formData.avatar instanceof File
        let toSend: any = formData

        if (hasFile) {
          // Tạo FormData từ đầu
          const apiForm = new FormData()
          Object.entries(formData).forEach(([key, value]) => {
            // Nếu là avatar file
            if (key === 'avatar' && value instanceof File) {
              apiForm.append('avatar', value)
            } else if (value !== undefined && value !== null) {
              apiForm.append(key, value as string | Blob)
            }
          })
          toSend = apiForm
        }
        // const res = await updateProjectAPI(formData.project_id, toSend)

        // const data = await updateProjectMembersAPI(project.project_id, members)

        onSuccess?.()
        toast.success('Tạo dự án thành công')

        setAddModalOpen(false)
        setAddModalContent(null)
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi thay đổi thông tin dự án!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <form style={{ color: '#1C272D' }} className=' relative flex-1 mb-[80px]  overflow-y-auto' onSubmit={handleSubmit}>
      {/* Header */}
      <div>
        <p className='text-sm text-gray-500 mt-1'>
          Step {currentStep} of 3:{' '}
          {currentStep === 1 ? 'Project Details' : currentStep === 2 ? 'Team Setup' : 'Timeline & Budget'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className='flex items-center justify-between mt-6 w-full'>
        {/* Step 1 */}
        <div className='flex items-center flex-1'>
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold shadow-sm flex-shrink-0 transition-colors ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {currentStep > 1 ? '✓' : '1'}
          </div>
          <div
            className={`h-[4px] flex-1 rounded-full mx-6 transition-colors ${
              currentStep > 1 ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          ></div>
        </div>

        {/* Step 2 */}
        <div className='flex items-center flex-1'>
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold flex-shrink-0 transition-colors ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {currentStep > 2 ? '✓' : '2'}
          </div>
          <div
            className={`h-[4px] flex-1 rounded-full mx-6 transition-colors ${
              currentStep > 2 ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          ></div>
        </div>

        {/* Step 3 */}
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold flex-shrink-0 transition-colors ${
            currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          3
        </div>
      </div>
      {currentStep === 1 && <Step1Com />}
    </form>
  )
}
