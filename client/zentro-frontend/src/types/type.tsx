import { Bookmark, Bug, CheckSquare, Star } from 'lucide-react'

export type TypeOption = {
  value: string
  label: string
  icon: JSX.Element
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
  }
]
