import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreVertical } from 'lucide-react'

interface Props {
  colIndex: number
  colId: string
  moveColumn: (index: number, direction: 'left' | 'right') => void
  deleteColumn: (id: string) => void
}

export const ColumnMenu: React.FC<Props> = ({ colIndex, colId, moveColumn, deleteColumn }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className='opacity-0 group-hover:opacity-100 transition-opacity'>
          <MoreVertical size={18} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content side='bottom' align='end' className='bg-white border shadow-md rounded-md text-sm'>
        <DropdownMenu.Item
          className='px-3 py-2 hover:bg-gray-100 cursor-pointer'
          onClick={() => moveColumn(colIndex, 'left')}
        >
          Move Left
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className='px-3 py-2 hover:bg-gray-100 cursor-pointer'
          onClick={() => moveColumn(colIndex, 'right')}
        >
          Move Right
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className='px-3 py-2 text-red-600 hover:bg-gray-100 cursor-pointer'
          onClick={() => deleteColumn(colId)}
        >
          Delete Column
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
