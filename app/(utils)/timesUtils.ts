export const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const formattedMonth = month.toString().padStart(2, '0')
  const formattedDay = day.toString().padStart(2, '0')
  const formattedHour = hour.toString().padStart(2, '0')
  const formattedMinute = minute.toString().padStart(2, '0')

  return `${year}년 ${formattedMonth}월 ${formattedDay}일 ${formattedHour}시 ${formattedMinute}분`
}
