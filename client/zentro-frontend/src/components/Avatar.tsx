const getInitial = (name: string) => {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?'
}

const getBgColor = (name: string) => {
  const colors = [
    '#F44336', // Red
    '#E91E63', // Pink
    '#9C27B0', // Purple
    '#673AB7', // Deep Purple
    '#3F51B5', // Indigo
    '#2196F3', // Blue
    '#03A9F4', // Light Blue
    '#00BCD4', // Cyan
    '#009688', // Teal
    '#4CAF50', // Green
    '#8BC34A', // Light Green
    '#CDDC39', // Lime
    '#FFEB3B', // Yellow
    '#FFC107', // Amber
    '#FF9800', // Orange
    '#FF5722', // Deep Orange
    '#795548', // Brown
    '#607D8B'
  ]
  const safeName = name?.trim() || '?'
  const index = safeName.charCodeAt(0) % colors.length
  return colors[index]
}

interface Avatar {
  name: string
  size: number
  avatarUrl?: string | File
}

export default function Avatar({ name, size = 40, avatarUrl }: Avatar) {
  const initial = getInitial(name)
  const bgColor = getBgColor(name)

  // Convert File to string URL if needed
  const avatarSrc = typeof avatarUrl === 'string' ? avatarUrl : avatarUrl ? URL.createObjectURL(avatarUrl) : null

  return (
    <>
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt='avatar'
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: bgColor,
            color: '#fff',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size / 2
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: bgColor,
            color: '#fff',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size / 2
          }}
        >
          {initial}
        </div>
      )}
    </>
  )
}
