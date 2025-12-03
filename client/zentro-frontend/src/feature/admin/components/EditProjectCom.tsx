import React, { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { Project } from '../../../types/project'
import Status from '../../../components/Status'
import styled from 'styled-components'
import Button from '../../../components/Button'
import { ArrowDown, ArrowUp, Check, Flame, Minus } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../auth/hooks/useAuth'
import { updateProjectAPI } from '../service/project.service'
import { useNavigate } from 'react-router-dom'
import { LoadingBlob } from '../../../components/LoadingBlob'
import Dropdown from '../../../components/Dropdown'
import ProjectAvatar from '../../../components/ProjectAvatar'
import ProjectAvatarWithEdit from '../../../components/ProjectAvatarWithEdit'
import type { MemberType, RoleType } from './MemberListEdit'
import MemberListEdit from './MemberListEdit'
import axios from 'axios'
import { getMembersByProjectAPI, searchUserAPI, updateProjectMembersAPI } from '../service/user.service'
import { getRoleForProjectAPI } from '../service/role.service'
import Priority from '../../../components/Priority'
import PrioritySelect from '../../../components/PrioritySelect'

const StyledForm = styled.div`
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
`

const FormGroup = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #e3e3e3;
  display: flex;
  align-items: center;
  gap: 12px;
`

const Label = styled.label`
  color: #717d84;
  font-size: 14px;
  font-weight: 500;
  line-height: 150%;
  width: 100px;
`

const Input = styled.input`
  margin-left: 12px;
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
`

const statuses = [
  { status: 'ĐANG DIỄN RA', color: '#00D1D4', bg: '#EBFCFC', status_code: 'in_progress' },
  { status: 'TẠM DỪNG', color: '#FF7A00', bg: '#FFF3E5', status_code: 'pending' },
  { status: 'ĐANG CHUẨN BỊ', color: '#0085FF', bg: '#E6F3FF', status_code: 'planning' },
  { status: 'BỊ HỦY', color: '#E34850', bg: '#FDECEC', status_code: 'cancelled' },
  { status: 'HOÀN THÀNH', color: '#2D8A47', bg: '#E2F4E8', status_code: 'completed' }
]

// Danh sách mock dùng cho MemberListEdit

export default function EditProjectCom({
  project,
  setModalOpen,
  setModalContent,
  onSuccess
}: {
  project: Project
  setModalOpen: Dispatch<SetStateAction<boolean>>
  setModalContent: Dispatch<SetStateAction<React.ReactNode | null>>
  onSuccess?: () => void
}) {
  const [formData, setFormData] = useState<Project>(project)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState<MemberType[]>([])
  const [memberRoles, setMemberRoles] = useState<RoleType[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getRoleForProjectAPI()
        setMemberRoles(res.data ?? [])
      } catch (err) {
        toast.error('Không lấy được roles!')
      }
    }
    fetchRoles()
  }, [])

  const searchUsers = async (kw: string) => {
    const res = await searchUserAPI(kw)
    return res.data
  }

  useEffect(() => {
    async function fetchData() {
      const res = await getMembersByProjectAPI(project.project_id)

      setMembers(res.data)
    }

    fetchData()
  }, [project.project_id])

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
        const res = await updateProjectAPI(formData.project_id, toSend)

        const data = await updateProjectMembersAPI(project.project_id, members)

        onSuccess?.()
        toast.success('Sửa dự án thành công')

        setModalOpen(false)
        setModalContent(null)
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi thay đổi thông tin dự án!')
      } finally {
        setIsLoading(false)
      }
    }
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

  const handleInputChange = (field: string, value: number | string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  return (
    <form
      style={{ color: '#1C272D' }}
      className=' py-[16px] mb-[400px] px-[30px] relative flex-1 h-screen'
      onSubmit={handleSubmit}
    >
      <div className='mb-4'>
        <ProjectAvatarWithEdit
          name={project.project_name}
          coverUrl={formData.avatar}
          onCoverChange={(file) => setFormData((fd) => ({ ...fd, avatar: file }))}
          height={100}
          rounded={12}
        />
      </div>
      <div className='mt-4'>
        {/* Hàng đầu: tên + meta bên trái, Status bên phải */}
        <div className='flex justify-between items-center gap-4'>
          <div className='flex-1' style={{ fontFamily: "'Inter', sans-serif" }}>
            <h2
              className='inline-flex items-center gap-2'
              style={{ fontSize: '20px', fontWeight: 600, lineHeight: '150%' }}
            >
              {project.project_name} <span style={{ margin: '0 10px', color: '#000000ff' }}>&middot;</span>{' '}
              <Priority priority={project.priority} center className='text-sm! ' />
            </h2>
            <span
              className='inline-flex'
              style={{ fontSize: '14px', fontWeight: 400, lineHeight: '150%', color: '#717D84' }}
            >
              Trưởng nhóm: {project.leader_name}
              {/* members[0]?.user?. */}
              <span style={{ margin: '0 10px', color: '#000000ff' }}>&middot;</span>
              ID: {project?.project_id}
            </span>
          </div>

          <Status center={true} status={project.status} />
        </div>

        {/* Cover ngang kiểu Facebook */}
      </div>
      <div className='project-infor pt-[32px]'>
        <h2 style={{ fontSize: '20px', fontWeight: '600', lineHeight: '150%' }}>Thông tin dự án</h2>
        <StyledForm>
          <FormGroup>
            <Label title='Tên dự án: '>Tên dự án:</Label>
            <div>
              <Input type='text' name='project_name' value={formData.project_name} onChange={handleChange} />
              {errors.project_name && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.project_name}</p>}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='Mô tả'>Mô tả:</Label>
            <div>
              <textarea
                className='w-[400px] h-[70px] px-3 text-sm py-2 border border-gray-300 rounded-md bg-white text-gray-900 ml-[12px]'
                type='textarea'
                name='description'
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              {errors.description && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.description}</p>}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='status'>Trạng thái:</Label>
            <select
              style={{
                color: statuses.find((s) => s.status === formData.status)?.color,
                backgroundColor: statuses.find((s) => s.status === formData.status)?.bg,
                padding: '5px 10px',
                marginLeft: '12px',
                borderRadius: '6px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                fontWeight: '600'
              }}
              value={formData.status}
              onChange={handleSelectChange}
              name='status'
            >
              {statuses.map((status) => (
                <option
                  style={{
                    color: `${status.color}`,
                    backgroundColor: `${status.bg}`,
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                  key={status.status}
                  value={status.status}
                >
                  {status.status}
                </option>
              ))}
            </select>
          </FormGroup>
          <FormGroup>
            <Label title='priority'>Độ ưu tiên:</Label>
            <PrioritySelect value={formData.priority} onChange={(val) => setFormData({ ...formData, priority: val })} />
          </FormGroup>
          <FormGroup>
            <Label title='status'>Ngày bắt đầu:</Label>
            <div>
              <DatePicker
                selected={formData.start_date}
                onChange={(date) => handleDateChange(date, 'start_date')}
                dateFormat='dd/MM/yyyy'
                className='border ml-[12px] text-sm border-zinc-400 px-3 py-2 rounded '
              />
              {errors.start_date && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.start_date}</p>}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='status'>Ngày kết thúc:</Label>
            <div>
              <DatePicker
                selected={formData.end_date}
                onChange={(date) => handleDateChange(date, 'end_date')}
                dateFormat='dd/MM/yyyy'
                className='border ml-[12px] text-sm border-zinc-400 px-3 py-2 rounded '
              />
              {errors.end_date && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.end_date}</p>}
            </div>
          </FormGroup>

          {/* {error && <p className='text-red-500'>{error}</p>} */}
        </StyledForm>
      </div>
      <div className='member-infor pt-[16px]'>
        <h2 style={{ fontSize: '20px', fontWeight: '600', lineHeight: '150%' }}>Thông tin thành viên</h2>
      </div>
      <div className='member-infor pt-[16px]'>
        <MemberListEdit value={members} roles={memberRoles} onChange={setMembers} searchUsers={searchUsers} />
      </div>
      <div className='flex flex-row justify-end gap-4 px-4 py-4 border-t border-gray-300 fixed bottom-0 left-0 w-full bg-white z-50 h-[80px]'>
        <Button className='flex items-center gap-2' type='submit'>
          {isLoading ? (
            <LoadingBlob />
          ) : (
            <>
              <Check strokeWidth={1.5} size={18} />
              <span className='text-md'>Lưu thay đổi</span>
            </>
          )}
        </Button>
        <button
          className='px-4 py-2 flex items-center gap-2 bg-transparent! hover:underline cursor-pointer'
          type='button'
          onClick={() => {
            setModalOpen(false)
            setModalContent(null)
          }}
        >
          <span className='text-md text-gray-600!'>Hủy bỏ</span>
        </button>
      </div>
    </form>
  )
}
