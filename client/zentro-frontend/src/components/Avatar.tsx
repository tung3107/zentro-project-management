const getInitial = (name: string) => {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?'
}

const hashString = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// Stable random color generator
const getBgColor = (name: string) => {
  const colors = [
  '#FF3B30', '#FF2D55', '#FF9500', '#FFCC00', '#FF6B6B', '#FF8C42', '#F94F6D',
  '#FF1744', '#F50057', '#D500F9', '#AA00FF', '#651FFF', '#3D5AFE', '#2979FF',
  '#00B0FF', '#00E5FF', '#1DE9B6', '#00E676', '#00C853', '#64DD17', '#AEEA00',

  '#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB', '#1E88E5', '#039BE5',
  '#00897B', '#43A047', '#7CB342', '#C0CA33', '#FDD835', '#FB8C00', '#F4511E',

  '#EF5350', '#EC407A', '#AB47BC', '#7E57C2', '#5C6BC0', '#42A5F5', '#29B6F6',
  '#26C6DA', '#26A69A', '#66BB6A', '#9CCC65', '#FFEB3B', '#FFA726'
]

  // Hash the whole name for stable randomness
  const safeName = name?.trim() || 'user'
  const base = hashString(name)

  // Kết hợp để tạo màu khác nhau ngay cả khi name giống
  const index = (base * 13) % colors.length
  return colors[index]
}

interface AvatarProps {
  name: string
  size?: number
  avatarUrl?: string | File
}

export default function Avatar({ name, size = 40, avatarUrl }: AvatarProps) {
  const initial = getInitial(name)
  const bgColor = getBgColor(name)

  const avatarSrc =
    typeof avatarUrl === 'string'
      ? avatarUrl
      : avatarUrl
        ? URL.createObjectURL(avatarUrl)
        : null

  return avatarSrc ? (
    <img
      src={avatarSrc}
      alt='avatar'
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover'
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
  )
}
