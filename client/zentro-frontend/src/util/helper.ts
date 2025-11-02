export const formatTime = (date: Date | string | undefined): string => {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  // Check if valid date
  if (isNaN(dateObj.getTime())) return ''

  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút`
  if (hours < 24) return `${hours} giờ`
  if (days < 7) return `${days} ngày`
  return dateObj.toLocaleDateString('vi-VN')
}
