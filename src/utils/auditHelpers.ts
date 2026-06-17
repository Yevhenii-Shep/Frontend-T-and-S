/** Demo/presentation: always treat audit as ended. Real check is commented below. */
export const isAuditEnded = (_endTime: string) => {
  return true
  /*
  if (!endTime) return false

  const normalized = endTime.includes('T') ? endTime : endTime.replace(' ', 'T')
  const end = new Date(normalized)

  return !Number.isNaN(end.getTime()) && end <= new Date()
  */
}
