import { ref } from 'vue'
import api from '@/api/axios'
import { alertApiError } from '@/composables/useProjectActions'

export const useProjectEvaluations = (getProject: () => any, refresh: () => Promise<void>) => {
  const evaluationForm = ref({
    score: 0,
    comment: '',
  })
  const savingEvaluation = ref(false)

  const createEvaluation = async () => {
    const project = getProject()
    if (!project) return

    savingEvaluation.value = true

    try {
      await api.post('/evaluations', {
        project_id: project.id,
        score: evaluationForm.value.score,
        comment: evaluationForm.value.comment || null,
      })

      evaluationForm.value = { score: 0, comment: '' }
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to create evaluation')
    } finally {
      savingEvaluation.value = false
    }
  }

  const deleteEvaluation = async (evaluationId: number) => {
    if (!confirm('Delete this evaluation?')) return

    try {
      await api.delete(`/evaluations/${evaluationId}`)
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to delete evaluation')
    }
  }

  return {
    evaluationForm,
    savingEvaluation,
    createEvaluation,
    deleteEvaluation,
  }
}
