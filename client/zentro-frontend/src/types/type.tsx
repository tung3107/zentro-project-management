import { ArrowDown, ArrowUp, Bookmark, Bug, CheckSquare, Flame, Minus, Star, Indent } from 'lucide-react'
import React from 'react'

export type TypeOption = {
  value: string
  label: string
  icon: React.ReactElement
}

export const type = [
  {
    label: 'User Story',
    value: 'story',
    icon: <Bookmark size={16} color='#63BA3C' />
  },
  {
    label: 'Task',
    value: 'task',
    icon: <CheckSquare size={16} color='#4F83C1' />
  },
  {
    label: 'Bug',
    value: 'bug',
    icon: <Bug size={16} color='#D04437' />
  },
  {
    label: 'Feature',
    value: 'feature',
    icon: <Star size={16} color='#17A2B8' />
  },
  {
    label: 'Subtask',
    value: 'subtask',
    icon: <Indent size={16} color='#8E8E93' />
  }
]

export const priorityColors = [
  { value: 3, label: 'Cần gấp', color: '#ef4444', icon: <Flame size={14} color='#ef4444' /> },
  { value: 2, label: 'Cao', color: '#fa7115ff', icon: <ArrowUp size={14} color='#fa7115ff' /> },
  { value: 1, label: 'Trung bình', color: '#facc15', icon: <Minus size={14} color='#facc15' /> },
  { value: 0, label: 'Thấp', color: '#22c55e', icon: <ArrowDown size={14} color='#22c55e' /> }
]
