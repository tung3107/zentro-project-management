import { useQuery } from '@tanstack/react-query'
import api from '../util/axiosClient'
import { toast } from 'sonner'

type Option = { id: number; name: string; color: string }
type Props = { apiEndPoint: string; value: number | null }

export default function StatusLabel({ apiEndPoint, value }: Props) {
  const { data: options, isLoading } = useQuery({
    queryKey: ['statuses', apiEndPoint], // 🔑 cache per project
    queryFn: async () => {
      const res = await api.get(apiEndPoint)
      return res.data.data as Option[]
    },
    staleTime: 1000 * 60 * 10, // cache 10 phút
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Lỗi khi lấy thông tin!')
  })

  if (isLoading) return <span className='text-xs text-gray-400'>Đang tải...</span>

  const selected = options?.find((o) => o.id === value)
  if (!selected)
    return <span className='bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-md'>Không xác định</span>

  const isGray =
    selected.color.includes('gray') ||
    /^#([8-9a-f]{2})\1\1$/i.test(selected.color) ||
    /^#([8-9a-f])\1\1$/i.test(selected.color)
  const textColor = isGray ? '#333' : selected.color

  return (
    <span
      className='text-sm font-medium px-2 py-1 rounded-md'
      style={{
        backgroundColor: `${selected.color}30`,
        color: textColor
      }}
    >
      {selected.name}
    </span>
  )
}
