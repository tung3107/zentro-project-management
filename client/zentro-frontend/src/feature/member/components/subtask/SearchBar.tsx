import { InputText } from 'primereact/inputtext'
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Tìm kiếm công việc...' }: SearchBarProps) {
  return (
    <div className='relative w-64'>
      <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
      <input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='pl-9 pr-3 py-1.5 w-full border rounded-lg text-sm font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      />
    </div>
  )
}
