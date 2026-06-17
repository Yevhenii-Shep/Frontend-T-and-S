import { ref } from 'vue'
import api from '@/api/axios'
import { alertApiError } from '@/composables/useProjectActions'

export const useProjectMilestones = (getProject: () => any, refresh: () => Promise<void>) => {
  const milestoneForm = ref({
    name: '',
    description: '',
    status: 0,
    deadline: '',
  })
  const savingMilestone = ref(false)

  const createMilestone = async () => {
    const project = getProject()
    if (!project) return

    savingMilestone.value = true

    try {
      await api.post('/milestones', {
        project_id: project.id,
        name: milestoneForm.value.name,
        description: milestoneForm.value.description || null,
        status: milestoneForm.value.status,
        deadline: milestoneForm.value.deadline || null,
      })

      milestoneForm.value = { name: '', description: '', status: 0, deadline: '' }
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to create milestone')
    } finally {
      savingMilestone.value = false
    }
  }

  const updateMilestoneStatus = async (milestoneId: number, status: number) => {
    try {
      await api.patch(`/milestones/${milestoneId}/status`, { status })
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to update milestone status')
    }
  }

  const deleteMilestone = async (milestoneId: number) => {
    if (!confirm('Delete this milestone?')) return

    try {
      await api.delete(`/milestones/${milestoneId}`)
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to delete milestone')
    }
  }

  return {
    milestoneForm,
    savingMilestone,
    createMilestone,
    updateMilestoneStatus,
    deleteMilestone,
  }
}
