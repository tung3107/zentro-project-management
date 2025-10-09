import React, { useState, type Dispatch, type SetStateAction } from 'react'
import type { Project } from '../../../types/project'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../auth/hooks/useAuth'
import Step1Com from './Step1Com'
import ProgressBar from './ProgressBar'
import Step2Com from './Step2Com'
import Button from '../../../components/Button'
import { LoadingBlob } from '../../../components/LoadingBlob'
import { ArrowRightCircle, Check, ChevronLeft, X } from 'lucide-react'
import type { MemberType, RoleType } from './MemberListEdit'
import Step3Com from './Step3Com'
import { createProjectAPI } from '../service/project.service'
import { createProjectMembersAPI } from '../service/user.service'

export default function AddProjectCom({
  setAddModalOpen,
  setAddModalContent,
  onSuccess
}: {
  setAddModalOpen: Dispatch<SetStateAction<boolean>>
  setAddModalContent: Dispatch<SetStateAction<React.ReactNode | null>>
  onSuccess?: () => void
}) {
  const [formData, setFormData] = useState<Project>({
    project_id: '',
    project_name: '',
    description: '',
    leader_name: '',
    start_date: new Date(),
    end_date: undefined,
    priority: undefined
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)

  const [members, setMembers] = useState<MemberType[]>([])
  const [memberRoles, setMemberRoles] = useState<RoleType[]>([])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.project_name && currentStep === 1) newErrors.project_name = 'Tên project là trường bắt buộc'

    if (formData.project_name && formData.project_name.length > 255 && currentStep === 1)
      newErrors.project_name = 'Tên project không được quá 255 ký tự'

    if (formData.description && formData.description.length > 255 && currentStep === 1)
      newErrors.description = 'Mô tả không được quá 255 ký tự'

    if (currentStep === 3 && members.length === 0) {
      newErrors.members = 'Phải thêm ít nhất 1 thành viên là Leader'
    }

    if (currentStep === 2) {
      if (formData.priority === undefined) {
        newErrors.priority = 'Độ ưu tiên là trường bắt buộc'
      }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, checked, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleInputChange = (field: string, value: number | string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (currentStep < 3 && validate()) setCurrentStep((prep) => prep + 1)

    if (validate() && currentStep === 3) {
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
        const res = await createProjectAPI(toSend)

        const data = await createProjectMembersAPI(res.data.project_id, members)

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
    <form
      style={{ color: '#1C272D' }}
      className=' relative flex-1 mb-[80px]  overflow-y-auto overflow-hidden relative'
      onSubmit={handleSubmit}
    >
      {/* Header */}
      <div>
        <p className='text-sm text-gray-500 mt-1'>
          Step {currentStep} of 3:{' '}
          {currentStep === 1 ? 'Project Details' : currentStep === 2 ? 'Team Setup' : 'Timeline & Budget'}
        </p>
      </div>

      {/* Progress Steps */}
      <ProgressBar currentStep={currentStep} />
      <div
        className='flex transition-transform duration-500 ease-in-out w-[300%]'
        style={{ transform: `translateX(-${(currentStep - 1) * 33.3333}%)` }}
      >
        <div className='w-1/3 flex-shrink-0'>
          <Step1Com setFormData={setFormData} errors={errors} formData={formData} handleChange={handleInputChange} />
        </div>
        <div className='w-1/3 flex-shrink-0'>
          <Step2Com
            formData={formData}
            handleChange={handleInputChange}
            errors={errors}
            handleDateChange={handleDateChange}
          />
        </div>
        <div className='w-1/3 flex-shrink-0'>
          <Step3Com
            members={members}
            memberRoles={memberRoles}
            setMemberRoles={setMemberRoles}
            setMembers={setMembers}
            errors={errors}
          />
        </div>
      </div>

      <div className='flex flex-row justify-center gap-4 px-4 py-4 border-t border-gray-300 fixed bottom-0 left-0 w-full bg-white z-50 items-center'>
        <div className='flex flex-row justify-between w-full'>
          <button
            className='px-4 py-2 flex items-center gap-2 bg-transparent! hover:underline cursor-pointer'
            type='button'
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep((prep) => prep - 1)
              } else {
                setAddModalOpen(false)
                setAddModalContent(null)
              }
            }}
          >
            {currentStep > 1 ? (
              <>
                <ChevronLeft strokeWidth={1.6} size={18} />
                <span className='text-md text-gray-600!'>Quay lại</span>
              </>
            ) : (
              <>
                <X strokeWidth={1.5} size={18} />
                <span className='text-md text-gray-600!'>Hủy bỏ</span>
              </>
            )}
          </button>
          <Button className={`flex items-center gap-2 bg-blue-600!`} type='submit'>
            {isLoading && currentStep === 3 ? (
              <LoadingBlob />
            ) : currentStep === 3 ? (
              <>
                <Check strokeWidth={1.5} size={18} />
                <span className='text-md'>Lưu thay đổi</span>
              </>
            ) : (
              <>
                <span className='text-md'>Tiếp theo</span>
                <ArrowRightCircle strokeWidth={1.5} size={18} />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
