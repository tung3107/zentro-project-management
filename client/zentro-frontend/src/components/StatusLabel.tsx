import { useQuery } from '@tanstack/react-query'
import api from '../util/axiosClient'
import { toast } from 'sonner'

type Option = { id: number; name: string; color: string }
type Props = { apiEndPoint: string; value: number | null }

export default function StatusLabel({ apiEndPoint, value }: Props) {
  const { data: options, isLoading } = useQuery({
    queryKey: ['statuses', apiEndPoint],
    queryFn: async () => {
      const res = await api.get(apiEndPoint)
      return res.data.data as Option[]
    },
    staleTime: 1000 * 60 * 10,
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Lỗi khi lấy thông tin!')
  })

  if (isLoading) return <span className='text-xs text-gray-400 italic'>Đang tải...</span>

  const selected = options?.find((o) => o.id === value)
  if (!selected)
    return <span className='bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-md'>Không xác định</span>

  // tính độ sáng để đổi màu chữ nếu cần
  const isLightColor = (hex: string) => {
    const c = hex.substring(1)
    const rgb = parseInt(c, 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = rgb & 0xff
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 170
  }

  // chữ hơi xám ngà, không trắng tinh
  const textColor = isLightColor(selected.color) ? '#172B4D' : '#F4F5F7'

  return (
    <span
      className='text-sm font-bold px-4 py-[5px] rounded-md inline-flex items-center justify-center transition-all'
      style={{
        backgroundColor: selected.color,
        color: textColor,
        letterSpacing: '0.11px',
        lineHeight: 1.2
      }}
    >
      {selected.name}
    </span>
  )
}
