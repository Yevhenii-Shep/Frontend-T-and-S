import { ref } from 'vue'
import api from '@/api/axios'
import { alertApiError } from '@/composables/useProjectActions'

export const useProjectAudit = (
  getProject: () => any,
  refresh: () => Promise<void>,
  loadAuditorCandidates: () => Promise<any[]>,
) => {
  const auditForm = ref({
    main_auditor: null as number | null,
    start_time: '',
    end_time: '',
    result: null as number | null,
  })
  const savingAudit = ref(false)
  const participantForm = ref<Record<number, { user_id: number | null; role: number }>>({})
  const auditorCandidates = ref<any[]>([])

  const syncParticipantForms = () => {
    const project = getProject()
    const forms: Record<number, { user_id: number | null; role: number }> = {}

    for (const audit of project?.audit_events ?? []) {
      forms[audit.id] = { user_id: null, role: 1 }
    }

    participantForm.value = forms
  }

  const loadCandidates = async () => {
    auditorCandidates.value = await loadAuditorCandidates()
  }

  const createAudit = async () => {
    const project = getProject()
    if (!project) return

    savingAudit.value = true

    try {
      await api.post('/audit-events', {
        project_id: project.id,
        main_auditor: auditForm.value.main_auditor,
        start_time: auditForm.value.start_time,
        end_time: auditForm.value.end_time,
      })

      auditForm.value = { main_auditor: null, start_time: '', end_time: '', result: null }
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to create audit')
    } finally {
      savingAudit.value = false
    }
  }

  const setAuditResult = async (auditId: number, result: number) => {
    const label = result === 1 ? 'accept' : 'decline'

    if (
      !confirm(
        `Set audit result to "${label}"? The project status will not change until the organization decides.`,
      )
    ) {
      return
    }

    try {
      await api.patch(`/audit-events/${auditId}/result`, { result })
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to set audit result')
    }
  }

  const deleteAudit = async (auditId: number) => {
    if (!confirm('Delete this audit event?')) return

    try {
      await api.delete(`/audit-events/${auditId}`)
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to delete audit')
    }
  }

  const addParticipant = async (auditId: number) => {
    const form = participantForm.value[auditId]
    if (!form?.user_id) return

    try {
      await api.post(`/audit-events/${auditId}/participants`, {
        user_id: form.user_id,
        role: form.role,
      })

      participantForm.value[auditId] = { user_id: null, role: 1 }
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to add participant')
    }
  }

  const removeParticipant = async (auditId: number, userId: number) => {
    if (!confirm('Remove participant?')) return

    try {
      await api.delete(`/audit-events/${auditId}/participants/${userId}`)
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to remove participant')
    }
  }

  const ensureParticipantForm = (auditId: number) => {
    if (!participantForm.value[auditId]) {
      participantForm.value[auditId] = { user_id: null, role: 1 }
    }

    return participantForm.value[auditId]
  }

  return {
    auditForm,
    savingAudit,
    participantForm,
    auditorCandidates,
    syncParticipantForms,
    loadCandidates,
    createAudit,
    setAuditResult,
    deleteAudit,
    addParticipant,
    removeParticipant,
    ensureParticipantForm,
  }
}
