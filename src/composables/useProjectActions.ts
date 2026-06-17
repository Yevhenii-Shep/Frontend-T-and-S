import api from '@/api/axios'
import { apiErrorMessage } from '@/utils/apiHelpers'

export const alertApiError = (error: unknown, fallback: string) => {
  alert(apiErrorMessage(error, fallback))
}

export const useProjectActions = (
  getProjectId: () => number | null,
  refresh: () => Promise<void>,
) => {
  const patch = async (suffix: string, data?: object, fallback = 'Request failed') => {
    const projectId = getProjectId()
    if (!projectId) return false

    try {
      await api.patch(`/projects/${projectId}${suffix}`, data)
      await refresh()
      return true
    } catch (error) {
      alertApiError(error, fallback)
      return false
    }
  }

  return { patch }
}
