import React from 'react'
import { type DraggableProvided } from '@hello-pangea/dnd'
import Priority from './Priority'
import Avatar from './Avatar'
import { Bookmark, Calendar, MessageCircle, MoreHorizontal, Paperclip } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface Props {
  provided: DraggableProvided
  title: string
}

const ColumnMenu = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className='opacity-0 group-hover/item:opacity-100 transition-opacity duration-150'>
          <MoreHorizontal size={18} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side='bottom' align='end' className='bg-white border shadow-md rounded-md text-sm'>
        <DropdownMenu.Item className='px-3 py-2 hover:bg-gray-100 cursor-pointer'>Move Left</DropdownMenu.Item>
        <DropdownMenu.Item className='px-3 py-2 hover:bg-gray-100 cursor-pointer'>Move Right</DropdownMenu.Item>
        <DropdownMenu.Item className='px-3 py-2 text-red-600 hover:bg-gray-100 cursor-pointer'>
          Delete Column
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export const TaskItem: React.FC<Props> = ({ provided, title }) => (
  <div
    ref={provided.innerRef}
    {...provided.draggableProps}
    {...provided.dragHandleProps}
    className='group/item p-3 rounded-lg border bg-white hover:bg-gray-100 transition flex-col flex gap-2'
  >
    <div className='flex flex-row justify-between items-start'>
      <p className='text-md font-medium text-gray-800'>{title}</p>
      <ColumnMenu />
    </div>

    <div className='flex flex-row justify-between mt-1'>
      <div className='flex flex-row items-center gap-3'>
        <div className='flex flex-row gap-1 items-center'>
          <Avatar name='Mai' size={25} />
          <span className='text-sm font-medium'>Mai</span>
        </div>
      </div>
      <div className='px-2.5 py-0.5 border border-gray-200 bg-white rounded-full font-medium text-gray-600 flex flex-row items-center gap-1 text-sm'>
        <Calendar size={16} />
        Oct 10
      </div>
    </div>

    <div className='flex flex-row justify-between mt-1'>
      <div className='flex flex-row gap-3'>
        <div className='flex flex-row items-center gap-1 text-sm font-medium'>
          <Paperclip size={13} /> 1
        </div>
        <div className='flex flex-row items-center gap-1 text-sm font-medium'>
          <MessageCircle size={13} /> 13
        </div>
      </div>
      <div className='flex flex-row items-center gap-1 text-sm font-medium'>
        <Bookmark size={16} color='var(--color-accent-blue)' strokeWidth={3} /> 123012
      </div>
    </div>
  </div>
)
