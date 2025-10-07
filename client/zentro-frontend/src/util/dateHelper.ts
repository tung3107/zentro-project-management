export const formatDateForInput = (dateString: Date) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  // Sử dụng getFullYear, getMonth, getDate để tránh timezone issues
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth() trả về 0-11
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
