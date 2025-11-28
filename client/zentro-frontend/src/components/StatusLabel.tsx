import { useQuery } from '@tanstack/react-query'
import api from '../util/axiosClient'
import { toast } from 'sonner'

type Option = { id: number; name: string; color: string; background: string; border_color: string }
type Props = { apiEndPoint: string; value: number | null }

export default function StatusLabel({ apiEndPoint, value }: Props) {
  const { data: options, isLoading } = useQuery({
    queryKey: ['statuses', apiEndPoint],
    queryFn: async () => {
      try {
        const res = await api.get(apiEndPoint)
        return res.data.data as Option[]
      } catch (err: any) {
        toast.error(err?.response?.data?.error?.message ?? 'Lỗi khi lấy thông tin!')
        return [] as Option[]
      }
    },
    staleTime: 1000 * 60 * 10
  })

  if (isLoading)
    return (
      <span className='text-xs text-gray-400 italic' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Đang tải...
      </span>
    )

  const selected = options?.find((o: Option) => o.id === value)
  if (!selected)
    return (
      <span
        className='bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded'
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Không xác định
      </span>
    )

  return (
    <span
      className={`text-sm font-semibold px-2 py-0.5 rounded inline-flex items-center justify-center transition-all bg-[${selected.background}]`}
      style={{
        backgroundColor: selected.background,
        color: selected.color,
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: selected.border_color,
        letterSpacing: '0.11px',
        lineHeight: 1.2,
        fontFamily: "'Space Grotesk', sans-serif"
      }}
    >
      {selected.name}
    </span>
  )
}
