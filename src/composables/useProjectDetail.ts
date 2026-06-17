import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { apiData, apiList } from '@/utils/apiHelpers'
import {
  canAssignTeamToProject,
  canEditProjectBaseInfo,
  canViewProject,
  canWriteProject,
} from '@/utils/projectPermissions'
import { isNtiStaff, isOrgStaff } from '@/utils/permissionRoleHelpers'
import { alertApiError, useProjectActions } from '@/composables/useProjectActions'

export const useProjectDetail = () => {
  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()

  const project = ref<any>(null)
  const loading = ref(false)

  const newStatus = ref<number | null>(null)
  const newDeadline = ref('')
  const savingStatus = ref(false)
  const savingDeadline = ref(false)

  const assignOrgId = ref<number | null>(null)
  const assignCategoryId = ref<number | null>(null)
  const assignNtiMentorId = ref<number | null>(null)
  const assignOrgMentorId = ref<number | null>(null)
  const assignTeamId = ref<number | null>(null)
  const teamCandidates = ref<any[]>([])

  const isAllowed = computed(() => canViewProject(auth.user, project.value))
  const canWrite = computed(() => canWriteProject(auth.user, project.value))
  const canManageDocuments = computed(() => canEditProjectBaseInfo(auth.user, project.value))
  const canScheduleAudit = computed(
    () =>
      isNtiStaff(auth.user) &&
      project.value?.status === 0 &&
      !(project.value?.audit_events?.length ?? 0),
  )

  const projectId = () => project.value?.id ?? null

  const syncAssignmentFields = () => {
    if (!project.value) return

    newStatus.value = project.value.status
    newDeadline.value = project.value.deadline || ''
    assignOrgId.value = project.value.organization_id
    assignCategoryId.value = project.value.category_id
    assignNtiMentorId.value = project.value.mentor_from_nti
    assignOrgMentorId.value = project.value.mentor_from_organization
    assignTeamId.value = project.value.team_id
  }

  const loadTeamCandidates = async () => {
    if (!canAssignTeamToProject(auth.user, project.value)) {
      teamCandidates.value = []
      return
    }

    try {
      const res = await api.get('/teams')
      teamCandidates.value = apiList(res)
    } catch {
      teamCandidates.value = []
    }
  }

  const fetchProject = async () => {
    loading.value = true

    try {
      const res = await api.get(`/projects/${route.params.id}`)
      project.value = apiData(res)
      syncAssignmentFields()
      await loadTeamCandidates()
    } finally {
      loading.value = false
    }
  }

  const { patch } = useProjectActions(projectId, fetchProject)

  const handleDelete = async () => {
    if (!confirm('Deactivate this project?')) return

    try {
      await api.delete(`/projects/${project.value.id}`)
      router.push('/projects')
    } catch (error) {
      alertApiError(error, 'Failed to delete project')
    }
  }

  const updateStatus = async () => {
    savingStatus.value = true
    await patch('/status', { status: newStatus.value }, 'Failed to update status')
    savingStatus.value = false
  }

  const updateDeadline = async () => {
    savingDeadline.value = true
    await patch('/deadline', { deadline: newDeadline.value || null }, 'Failed to update deadline')
    savingDeadline.value = false
  }

  const assignTeam = () =>
    patch('/assign-team', { team_id: assignTeamId.value }, 'Failed to assign team')

  const assignOrganization = () =>
    patch(
      '/assign-organization',
      { organization_id: assignOrgId.value },
      'Failed to assign organization',
    )

  const acceptProjectAfterAudit = async () => {
    if (!confirm('Accept this project for your organization? The project will become Active.')) {
      return
    }

    await patch('/accept-after-audit', undefined, 'Failed to accept project after audit')
  }

  const declineProjectAfterAudit = async () => {
    if (!confirm('Decline this project? It will remain Pending.')) return

    await patch('/decline-after-audit', undefined, 'Failed to decline project after audit')
  }

  const assignCategory = () =>
    patch('/assign-category', { category_id: assignCategoryId.value }, 'Failed to assign category')

  const assignNtiMentor = () =>
    patch(
      '/assign-nti-mentor',
      { mentor_from_nti: assignNtiMentorId.value },
      'Failed to assign NTI mentor',
    )

  const assignOrgMentor = () =>
    patch(
      '/assign-organization-mentor',
      { mentor_from_organization: assignOrgMentorId.value },
      'Failed to assign organization mentor',
    )

  const goToTeam = (id: number) => {
    router.push(`/teams/${id}`)
  }

  const loadAuditorCandidates = async (): Promise<any[]> => {
    if (!isNtiStaff(auth.user)) {
      return []
    }

    if (project.value?.status !== 0 || (project.value?.audit_events?.length ?? 0) > 0) {
      return []
    }

    try {
      const res = await api.get('/users')
      return apiList(res).filter((user: any) => isNtiStaff(user) || isOrgStaff(user))
    } catch {
      return []
    }
  }

  return {
    auth,
    router,
    project,
    loading,
    isAllowed,
    canWrite,
    canManageDocuments,
    canScheduleAudit,
    newStatus,
    newDeadline,
    savingStatus,
    savingDeadline,
    assignOrgId,
    assignCategoryId,
    assignNtiMentorId,
    assignOrgMentorId,
    assignTeamId,
    teamCandidates,
    fetchProject,
    handleDelete,
    updateStatus,
    updateDeadline,
    assignTeam,
    assignOrganization,
    acceptProjectAfterAudit,
    declineProjectAfterAudit,
    assignCategory,
    assignNtiMentor,
    assignOrgMentor,
    goToTeam,
    loadAuditorCandidates,
  }
}
