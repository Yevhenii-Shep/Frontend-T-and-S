<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import {
  AUDIT_RESULT_LABELS,
  MILESTONE_STATUS_LABELS,
  PROGRAM_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
} from '@/constants/project'
import { apiData } from '@/utils/apiHelpers'
import {
  canAdminAssignRelations,
  canAssignNtiMentor,
  canAssignOrganizationMentor,
  canDeleteProject,
  canEditProject,
  canModifyProjectChildren,
  canUpdateStatusOrDeadline,
  canViewProject,
} from '@/utils/projectPermissions'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const project = ref<any>(null)
const loading = ref(false)

// status / deadline
const newStatus = ref<number | null>(null)
const newDeadline = ref('')
const savingStatus = ref(false)
const savingDeadline = ref(false)

// admin assignments
const assignTeamId = ref<number | null>(null)
const assignOrgId = ref<number | null>(null)
const assignCategoryId = ref<number | null>(null)
const assignNtiMentorId = ref<number | null>(null)
const assignOrgMentorId = ref<number | null>(null)

// document
const docFile = ref<File | null>(null)
const docName = ref('')
const uploadingDoc = ref(false)

// milestone
const milestoneForm = ref({
  name: '',
  description: '',
  status: 0,
  deadline: '',
})
const savingMilestone = ref(false)

// evaluation
const evaluationForm = ref({
  score: 0,
  comment: '',
})
const savingEvaluation = ref(false)

// audit
const auditForm = ref({
  main_auditor: null as number | null,
  start_time: '',
  end_time: '',
  result: null as number | null,
})
const savingAudit = ref(false)
const participantForm = ref<Record<number, { user_id: number | null; role: number }>>({})

const isAllowed = computed(() => canViewProject(auth.user, project.value))
const canWrite = computed(() => canModifyProjectChildren(auth.user, project.value))
const isAdmin = () => auth.user?.role === ROLES.ADMIN

const fetchProject = async () => {
  loading.value = true

  try {
    const res = await api.get(`/projects/${route.params.id}`)
    project.value = apiData(res)
    newStatus.value = project.value.status
    newDeadline.value = project.value.deadline || ''
    assignTeamId.value = project.value.team_id
    assignOrgId.value = project.value.organization_id
    assignCategoryId.value = project.value.category_id
    assignNtiMentorId.value = project.value.mentor_from_nti
    assignOrgMentorId.value = project.value.mentor_from_organization

    const forms: Record<number, { user_id: number | null; role: number }> = {}
    for (const audit of project.value.audit_events ?? []) {
      forms[audit.id] = { user_id: null, role: 1 }
    }
    participantForm.value = forms
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('Deactivate this project?')) return

  try {
    await api.delete(`/projects/${project.value.id}`)
    router.push('/projects')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete project')
  }
}

const updateStatus = async () => {
  savingStatus.value = true

  try {
    await api.patch(`/projects/${project.value.id}/status`, { status: newStatus.value })
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to update status')
  } finally {
    savingStatus.value = false
  }
}

const updateDeadline = async () => {
  savingDeadline.value = true

  try {
    await api.patch(`/projects/${project.value.id}/deadline`, {
      deadline: newDeadline.value || null,
    })
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to update deadline')
  } finally {
    savingDeadline.value = false
  }
}

const assignTeam = async () => {
  try {
    await api.patch(`/projects/${project.value.id}/assign-team`, {
      team_id: assignTeamId.value,
    })
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to assign team')
  }
}

const goToTeam = (id: number) => {
  router.push(`/teams/${id}`)
}

const assignOrganization = async () => {
  try {
    await api.patch(`/projects/${project.value.id}/assign-organization`, {
      organization_id: assignOrgId.value,
    })
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to assign organization')
  }
}

const assignCategory = async () => {
  try {
    await api.patch(`/projects/${project.value.id}/assign-category`, {
      category_id: assignCategoryId.value,
    })
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to assign category')
  }
}

const assignNtiMentor = async () => {
  try {
    await api.patch(`/projects/${project.value.id}/assign-nti-mentor`, {
      mentor_from_nti: assignNtiMentorId.value,
    })
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to assign NTI mentor')
  }
}

const assignOrgMentor = async () => {
  try {
    await api.patch(`/projects/${project.value.id}/assign-organization-mentor`, {
      mentor_from_organization: assignOrgMentorId.value,
    })
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to assign organization mentor')
  }
}

const onDocFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  docFile.value = input.files?.[0] || null
}

const uploadDocument = async () => {
  if (!docFile.value) return

  uploadingDoc.value = true

  try {
    const formData = new FormData()
    formData.append('file', docFile.value)
    formData.append('project_id', String(project.value.id))
    if (docName.value) {
      formData.append('name', docName.value)
    }

    await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    docFile.value = null
    docName.value = ''
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to upload document')
  } finally {
    uploadingDoc.value = false
  }
}

const downloadDocument = async (docId: number, name: string) => {
  try {
    const res = await api.get(`/documents/${docId}/download`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to download document')
  }
}

const deleteDocument = async (docId: number) => {
  if (!confirm('Delete this document?')) return

  try {
    await api.delete(`/documents/${docId}`)
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete document')
  }
}

const createMilestone = async () => {
  savingMilestone.value = true

  try {
    await api.post('/milestones', {
      project_id: project.value.id,
      name: milestoneForm.value.name,
      description: milestoneForm.value.description || null,
      status: milestoneForm.value.status,
      deadline: milestoneForm.value.deadline || null,
    })

    milestoneForm.value = { name: '', description: '', status: 0, deadline: '' }
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to create milestone')
  } finally {
    savingMilestone.value = false
  }
}

const updateMilestoneStatus = async (milestoneId: number, status: number) => {
  try {
    await api.patch(`/milestones/${milestoneId}/status`, { status })
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to update milestone status')
  }
}

const deleteMilestone = async (milestoneId: number) => {
  if (!confirm('Delete this milestone?')) return

  try {
    await api.delete(`/milestones/${milestoneId}`)
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete milestone')
  }
}

const createEvaluation = async () => {
  savingEvaluation.value = true

  try {
    await api.post('/evaluations', {
      project_id: project.value.id,
      score: evaluationForm.value.score,
      comment: evaluationForm.value.comment || null,
    })

    evaluationForm.value = { score: 0, comment: '' }
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to create evaluation')
  } finally {
    savingEvaluation.value = false
  }
}

const deleteEvaluation = async (evaluationId: number) => {
  if (!confirm('Delete this evaluation?')) return

  try {
    await api.delete(`/evaluations/${evaluationId}`)
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete evaluation')
  }
}

const createAudit = async () => {
  savingAudit.value = true

  try {
    const payload: any = {
      project_id: project.value.id,
      main_auditor: auditForm.value.main_auditor,
      start_time: auditForm.value.start_time,
      end_time: auditForm.value.end_time,
    }

    if (isAdmin() && auditForm.value.result) {
      payload.result = auditForm.value.result
    }

    await api.post('/audit-events', payload)

    auditForm.value = { main_auditor: null, start_time: '', end_time: '', result: null }
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to create audit')
  } finally {
    savingAudit.value = false
  }
}

const deleteAudit = async (auditId: number) => {
  if (!confirm('Delete this audit event?')) return

  try {
    await api.delete(`/audit-events/${auditId}`)
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete audit')
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
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to add participant')
  }
}

const removeParticipant = async (auditId: number, userId: number) => {
  if (!confirm('Remove participant?')) return

  try {
    await api.delete(`/audit-events/${auditId}/participants/${userId}`)
    await fetchProject()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to remove participant')
  }
}

const ensureParticipantForm = (auditId: number) => {
  if (!participantForm.value[auditId]) {
    participantForm.value[auditId] = { user_id: null, role: 1 }
  }

  return participantForm.value[auditId]
}

onMounted(fetchProject)
</script>

<template>
  <div class="container py-4">
    <button class="btn btn-outline-secondary mb-3" @click="router.push('/projects')">← Back</button>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else-if="project && isAllowed">
      <!-- header -->
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2 class="mb-1">{{ project.name }}(ID: {{ project.id }})</h2>
          <p class="text-muted mb-0">
            {{ project.description || 'No description' }}
          </p>
        </div>

        <div class="d-flex gap-2">
          <button
            v-if="canEditProject(auth.user, project)"
            class="btn btn-outline-primary btn-sm"
            @click="router.push(`/projects/${project.id}/edit`)"
          >
            Edit
          </button>

          <span class="badge bg-secondary align-self-center">
            {{ PROJECT_STATUS_LABELS[project.status] ?? project.status }}
          </span>
        </div>
      </div>

      <!-- info -->
      <div class="card mb-3">
        <div class="card-body">
          <p><strong>Category:</strong> {{ project.category_name || '-' }}</p>
          <p><strong>Team:</strong> {{ project.team_name || '-' }}</p>
          <p><strong>Organization:</strong> {{ project.organization_name || '-' }}</p>
          <p>
            <strong>Program type:</strong>
            {{ PROGRAM_TYPE_LABELS[project.program_type] ?? project.program_type }}
          </p>
          <p><strong>Deadline:</strong> {{ project.deadline || '-' }}</p>
          <p><strong>NTI mentor:</strong> {{ project.mentor_from_nti_name || '-' }}</p>
          <p>
            <strong>Organization mentor:</strong> {{ project.mentor_from_organization_name || '-' }}
          </p>
        </div>
      </div>

      <!-- status / deadline -->
      <div v-if="canUpdateStatusOrDeadline(auth.user, project)" class="card mb-3">
        <div class="card-body">
          <h5>Status & Deadline</h5>

          <div class="row g-2 mb-3">
            <div class="col-md-4">
              <select v-model.number="newStatus" class="form-select">
                <option :value="0">Pending</option>
                <option :value="1">Active</option>
                <option :value="2">Done</option>
              </select>
            </div>

            <div class="col-auto">
              <button class="btn btn-primary btn-sm" :disabled="savingStatus" @click="updateStatus">
                Update status
              </button>
            </div>
          </div>

          <div class="d-flex gap-2">
            <input v-model="newDeadline" type="date" class="form-control" />

            <button
              class="btn btn-primary btn-sm"
              :disabled="savingDeadline"
              @click="updateDeadline"
            >
              Update deadline
            </button>
          </div>
        </div>
      </div>

      <!-- admin assignments -->
      <div v-if="canAdminAssignRelations(auth.user)" class="card mb-3">
        <div class="card-body">
          <h5>Assignments (Admin)</h5>
          <p class="text-muted mb-2">Team ID:</p>
          <div class="d-flex gap-2 mb-2">
            <input
              v-model.number="assignTeamId"
              type="number"
              class="form-control"
              placeholder="Team ID"
            />
            <button class="btn btn-outline-primary btn-sm" @click="assignTeam">Assign team</button>
          </div>

          <p class="text-muted mb-2">Organization ID:</p>
          <div class="d-flex gap-2 mb-2">
            <input
              v-model.number="assignOrgId"
              type="number"
              class="form-control"
              placeholder="Organization ID"
            />
            <button class="btn btn-outline-primary btn-sm" @click="assignOrganization">
              Assign org
            </button>
          </div>

          <p class="text-muted mb-2">Category ID:</p>
          <div class="d-flex gap-2">
            <input
              v-model.number="assignCategoryId"
              type="number"
              class="form-control"
              placeholder="Category ID"
            />
            <button class="btn btn-outline-primary btn-sm" @click="assignCategory">
              Assign category
            </button>
          </div>
        </div>
      </div>

      <!-- mentors -->
      <div
        v-if="canAssignNtiMentor(auth.user) || canAssignOrganizationMentor(auth.user, project)"
        class="card mb-3"
      >
        <div class="card-body">
          <h5>Mentors</h5>

          <p class="text-muted mb-2">Mentor from NTI (User ID):</p>
          <div v-if="canAssignNtiMentor(auth.user)" class="d-flex gap-2 mb-2">
            <input
              v-model.number="assignNtiMentorId"
              type="number"
              class="form-control"
              placeholder="NTI mentor user ID"
            />
            <button class="btn btn-outline-primary btn-sm" @click="assignNtiMentor">
              Assign NTI mentor
            </button>
          </div>

          <p class="text-muted mb-2">Mentor from Organization (User ID):</p>
          <div v-if="canAssignOrganizationMentor(auth.user, project)" class="d-flex gap-2">
            <input
              v-model.number="assignOrgMentorId"
              type="number"
              class="form-control"
              placeholder="Organization mentor user ID"
            />
            <button class="btn btn-outline-primary btn-sm" @click="assignOrgMentor">
              Assign org mentor
            </button>
          </div>
        </div>
      </div>

      <!-- team -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Team</h5>
          <td class="text-end">
            <button class="btn btn-sm btn-primary" @click="goToTeam(project.team?.id)">
              View team information
            </button>
          </td>
        </div>
      </div>

      <!-- documents -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Documents</h5>

          <div v-if="project.documents?.length">
            <ul class="list-group mb-3">
              <li
                v-for="doc in project.documents"
                :key="doc.id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{{ doc.name }}</span>

                <div class="d-flex gap-2">
                  <button
                    class="btn btn-sm btn-outline-primary"
                    @click="downloadDocument(doc.id, doc.name)"
                  >
                    Download
                  </button>

                  <button
                    v-if="canWrite"
                    class="btn btn-sm btn-danger"
                    @click="deleteDocument(doc.id)"
                  >
                    Delete
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <div v-else class="text-muted mb-3">No documents</div>

          <div v-if="canWrite" class="d-flex gap-2">
            <input v-model="docName" class="form-control" placeholder="Name (optional)" />
            <input type="file" class="form-control" @change="onDocFileChange" />
            <button class="btn btn-primary btn-sm" :disabled="uploadingDoc" @click="uploadDocument">
              Upload
            </button>
          </div>
        </div>
      </div>

      <!-- milestones -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Milestones</h5>

          <div v-if="project.milestones?.length">
            <ul class="list-group mb-3">
              <li v-for="m in project.milestones" :key="m.id" class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <div class="fw-bold">{{ m.name }}</div>
                    <small class="text-muted">{{ m.description || 'No description' }}</small>
                  </div>

                  <div v-if="canWrite" class="d-flex gap-2 align-items-center">
                    <select
                      class="form-select form-select-sm"
                      :value="m.status"
                      @change="
                        updateMilestoneStatus(
                          m.id,
                          Number(($event.target as HTMLSelectElement).value),
                        )
                      "
                    >
                      <option
                        v-for="(label, key) in MILESTONE_STATUS_LABELS"
                        :key="key"
                        :value="key"
                      >
                        {{ label }}
                      </option>
                    </select>

                    <button class="btn btn-sm btn-danger" @click="deleteMilestone(m.id)">
                      Delete
                    </button>
                  </div>

                  <span v-else class="badge bg-secondary">
                    {{ MILESTONE_STATUS_LABELS[m.status] ?? m.status }}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div v-else class="text-muted mb-3">No milestones</div>

          <div v-if="canWrite" class="row g-2">
            <div class="col-md-4">
              <input v-model="milestoneForm.name" class="form-control" placeholder="Name" />
            </div>
            <div class="col-md-4">
              <input v-model="milestoneForm.deadline" type="date" class="form-control" />
            </div>
            <div class="col-md-4">
              <select v-model.number="milestoneForm.status" class="form-select">
                <option
                  v-for="(label, key) in MILESTONE_STATUS_LABELS"
                  :key="key"
                  :value="Number(key)"
                >
                  {{ label }}
                </option>
              </select>
            </div>
            <div class="col-12">
              <textarea
                v-model="milestoneForm.description"
                class="form-control"
                placeholder="Description"
                rows="2"
              />
            </div>
            <div class="col-auto">
              <button
                class="btn btn-primary btn-sm"
                :disabled="savingMilestone"
                @click="createMilestone"
              >
                Add milestone
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- evaluations -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Evaluations</h5>

          <div v-if="project.evaluations?.length">
            <ul class="list-group mb-3">
              <li
                v-for="e in project.evaluations"
                :key="e.id"
                class="list-group-item d-flex justify-content-between"
              >
                <span>
                  <strong>{{ e.score }}</strong>
                  — {{ e.evaluator?.name || 'Unknown' }}
                  <span v-if="e.comment" class="text-muted">({{ e.comment }})</span>
                </span>

                <button
                  v-if="canWrite"
                  class="btn btn-sm btn-danger"
                  @click="deleteEvaluation(e.id)"
                >
                  Delete
                </button>
              </li>
            </ul>
          </div>

          <div v-else class="text-muted mb-3">No evaluations</div>

          <div v-if="canWrite" class="d-flex gap-2">
            <input
              v-model.number="evaluationForm.score"
              type="number"
              min="0"
              max="100"
              class="form-control"
              placeholder="Score"
            />
            <input v-model="evaluationForm.comment" class="form-control" placeholder="Comment" />
            <button
              class="btn btn-primary btn-sm"
              :disabled="savingEvaluation"
              @click="createEvaluation"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <!-- audit events -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Audit Events</h5>

          <div v-if="project.audit_events?.length">
            <div v-for="audit in project.audit_events" :key="audit.id" class="card mb-3">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <div><strong>Auditor:</strong> {{ audit.main_auditor_name || '-' }}</div>
                    <div><strong>Start:</strong> {{ audit.start_time }}</div>
                    <div><strong>End:</strong> {{ audit.end_time }}</div>
                    <div>
                      <strong>Result:</strong>
                      {{ audit.result ? AUDIT_RESULT_LABELS[audit.result] : 'Pending' }}
                    </div>
                  </div>

                  <button
                    v-if="canWrite"
                    class="btn btn-sm btn-danger"
                    @click="deleteAudit(audit.id)"
                  >
                    Delete
                  </button>
                </div>

                <div v-if="audit.participants?.length" class="mt-3">
                  <h6>Participants</h6>
                  <ul class="list-group">
                    <li
                      v-for="p in audit.participants"
                      :key="p.id"
                      class="list-group-item d-flex justify-content-between"
                    >
                      {{ p.user?.name || p.user_id }}

                      <button
                        v-if="canWrite"
                        class="btn btn-sm btn-outline-danger"
                        @click="removeParticipant(audit.id, p.user_id)"
                      >
                        Remove
                      </button>
                    </li>
                  </ul>
                </div>

                <div v-if="canWrite" class="d-flex gap-2 mt-3">
                  <input
                    v-model.number="ensureParticipantForm(audit.id).user_id"
                    type="number"
                    class="form-control"
                    placeholder="User ID"
                  />
                  <select v-model.number="ensureParticipantForm(audit.id).role" class="form-select">
                    <option :value="1">Auditor</option>
                    <option :value="2">Contributor</option>
                  </select>
                  <button class="btn btn-outline-primary btn-sm" @click="addParticipant(audit.id)">
                    Add participant
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-muted mb-3">No audit events</div>

          <div v-if="canWrite">
            <h6>Schedule audit</h6>
            <div class="row g-2">
              <div class="col-md-3">
                <input
                  v-model.number="auditForm.main_auditor"
                  type="number"
                  class="form-control"
                  placeholder="Main auditor user ID"
                />
              </div>
              <div class="col-md-3">
                <input v-model="auditForm.start_time" type="datetime-local" class="form-control" />
              </div>
              <div class="col-md-3">
                <input v-model="auditForm.end_time" type="datetime-local" class="form-control" />
              </div>
              <div v-if="isAdmin()" class="col-md-3">
                <select v-model.number="auditForm.result" class="form-select">
                  <option :value="null">No result</option>
                  <option :value="1">Accepted</option>
                  <option :value="2">Declined</option>
                </select>
              </div>
              <div class="col-auto">
                <button class="btn btn-primary btn-sm" :disabled="savingAudit" @click="createAudit">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- danger zone -->
      <div v-if="canDeleteProject(auth.user, project)" class="card border-danger">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="text-danger mb-1">Danger Zone</h5>
            <small class="text-muted">Deactivating a project sets status to inactive</small>
          </div>

          <button class="btn btn-danger" @click="handleDelete">Deactivate Project</button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">Project not found or access denied</div>
  </div>
</template>
