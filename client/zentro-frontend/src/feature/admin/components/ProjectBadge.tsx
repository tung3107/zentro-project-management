import React from 'react'
import Avatar from '../../../components/Avatar'

type ProjectBadgeProps = {
  projectId: string | number
  projectName: string
  imageUrl?: string
}

const ProjectBadge: React.FC<ProjectBadgeProps> = ({ projectId, projectName, imageUrl }) => {
  return (
    <div className='inline-flex items-center gap-3 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer'>
      <div className='flex-shrink-0 w-7 h-7 rounded-full overflow-hidden border-2 border-[#10194B] bg-gray-300'>
        <Avatar name={projectName} avatarUrl={imageUrl} size={25} />
      </div>
      <div className='flex flex-row leading-tight items-center'>
        <span className='text-sm font-semibold'>{projectName}</span>
        <span style={{ margin: '0 10px', color: '#ffffffff' }}>&middot;</span>
        <span className='text-[12px] text-gray-300'>{projectId}</span>
      </div>
    </div>
  )
}

export default ProjectBadge
