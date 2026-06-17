<script setup lang="ts">
import { onMounted } from 'vue'
import {
  AUDIT_RESULT_LABELS,
  MILESTONE_STATUS_LABELS,
  PROGRAM_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
} from '@/constants/project'
import { ROLE_LABELS } from '@/constants/roles'
import {
  canAssignOrganizationMentor,
  canAssignOrganizationToProject,
  canAssignTeamToProject,
  canDeleteProject,
  canEditProjectBaseInfo,
  canOrgAcceptProjectAfterAudit,
  canOrgViewProjectAssignmentSection,
  canSetAuditResult,
  canUpdateStatusOrDeadline,
  getAuditMainAuditorId,
} from '@/utils/projectPermissions'
import { isAdmin, isNtiStaff } from '@/utils/permissionRoleHelpers'
import { canViewUser } from '@/utils/userPermissions'
import { isAuditEnded } from '@/utils/auditHelpers'
import { useProjectDetail } from '@/composables/useProjectDetail'
import { useProjectAudit } from '@/composables/useProjectAudit'
import { useProjectDocuments } from '@/composables/useProjectDocuments'
import { useProjectMilestones } from '@/composables/useProjectMilestones'
import { useProjectEvaluations } from '@/composables/useProjectEvaluations'

const {
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
  fetchProject: loadProject,
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
} = useProjectDetail()

let refresh: () => Promise<void>

const {
  auditForm,
  savingAudit,
  auditorCandidates,
  syncParticipantForms,
  loadCandidates,
  createAudit,
  setAuditResult,
  deleteAudit,
  addParticipant,
  removeParticipant,
  ensureParticipantForm,
} = useProjectAudit(() => project.value, () => refresh(), loadAuditorCandidates)

const {
  docName,
  uploadingDoc,
  onDocFileChange,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} = useProjectDocuments(() => project.value, () => refresh())

const {
  milestoneForm,
  savingMilestone,
  createMilestone,
  updateMilestoneStatus,
  deleteMilestone,
} = useProjectMilestones(() => project.value, () => refresh())

const {
  evaluationForm,
  savingEvaluation,
  createEvaluation,
  deleteEvaluation,
} = useProjectEvaluations(() => project.value, () => refresh())

refresh = async () => {
  await loadProject()
  syncParticipantForms()
  await loadCandidates()
}

onMounted(refresh)
</script>

<template>
  <div class="container py-4">
    <button class="btn btn-outline-secondary mb-3" @click="router.push('/projects')">← Back</button>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else-if="project && isAllowed">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2 class="mb-1">{{ project.name }}(ID: {{ project.id }})</h2>
          <p class="text-muted mb-0">{{ project.slug || 'No description' }}</p>
        </div>

        <div class="d-flex gap-2">
          <button
            v-if="canEditProjectBaseInfo(auth.user, project)"
            class="btn btn-outline-primary btn-sm"
            @click="router.push(`/projects/${project.slug}/edit`)"
          >
            Edit
          </button>

          <span class="badge bg-secondary align-self-center">
            {{ PROJECT_STATUS_LABELS[project.status] ?? project.status }}
          </span>
        </div>
      </div>

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

      <div class="card mb-4">
        <div class="card-body">
          <h5>Description</h5>
          <p class="mb-0">{{ project.description || 'No description provided' }}</p>
        </div>
      </div>

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

      <div class="card mb-3">
        <div class="card-body">
          <h5>Team</h5>
          <p v-if="project.team_name" class="mb-2">{{ project.team_name }}</p>

          <div v-if="project.team?.users?.length" class="mb-3">
            <ul class="list-group">
              <li v-for="member in project.team.users" :key="member.id" class="list-group-item">
                <RouterLink v-if="canViewUser(auth.user, member)" :to="`/users/${member.id}`">
                  {{ member.name }}
                </RouterLink>
                <span v-else>{{ member.name }}</span>
              </li>
            </ul>
          </div>

          <button
            v-if="project.team?.id"
            class="btn btn-sm btn-primary"
            @click="goToTeam(project.team.id)"
          >
            Open team page
          </button>

          <div v-if="canAssignTeamToProject(auth.user, project)" class="mt-3">
            <p class="text-muted small mb-2">Assign or change the project team (program B only).</p>
            <div class="d-flex gap-2">
              <select v-model.number="assignTeamId" class="form-select">
                <option :value="null">No team</option>
                <option v-for="team in teamCandidates" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
              <button class="btn btn-outline-primary btn-sm" @click="assignTeam">Assign team</button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="
          canOrgAcceptProjectAfterAudit(auth.user, project) ||
          canOrgViewProjectAssignmentSection(auth.user, project) ||
          (isAdmin(auth.user) && canAssignOrganizationToProject(auth.user, project))
        "
        class="card mb-3"
      >
        <div class="card-body">
          <h5>Organization assignment</h5>

          <div v-if="canOrgAcceptProjectAfterAudit(auth.user, project)" class="mb-3">
            <p class="text-muted mb-2">
              The audit was accepted. Your organization can take this project (Active) or decline it
              (stays Pending).
            </p>
            <div class="d-flex gap-2">
              <button class="btn btn-success btn-sm" @click="acceptProjectAfterAudit">
                Claim for my organization
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="declineProjectAfterAudit">
                Decline project
              </button>
            </div>
          </div>

          <p
            v-else-if="canOrgViewProjectAssignmentSection(auth.user, project)"
            class="alert alert-info small py-2 mb-0"
            role="alert"
          >
            You can claim this project for your organization only after the audit ends with result
            <strong>Accepted</strong>.
          </p>

          <template
            v-else-if="
              isAdmin(auth.user) &&
              canAssignOrganizationToProject(auth.user, project)
            "
          >
            <div class="d-flex gap-2">
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
          </template>
        </div>
      </div>

      <div v-if="isAdmin(auth.user)" class="card mb-3">
        <div class="card-body">
          <h5>Category (Admin)</h5>
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

      <div
        v-if="isNtiStaff(auth.user) || canAssignOrganizationMentor(auth.user, project)"
        class="card mb-3"
      >
        <div class="card-body">
          <h5>Mentors</h5>

          <p class="text-muted mb-2">Mentor from NTI (User ID):</p>
          <div v-if="isNtiStaff(auth.user)" class="d-flex gap-2 mb-2">
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
                    v-if="canManageDocuments"
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

          <div v-if="canManageDocuments" class="d-flex gap-2">
            <input v-model="docName" class="form-control" placeholder="Name (optional)" />
            <input type="file" class="form-control" @change="onDocFileChange" />
            <button
              class="btn btn-primary btn-sm"
              :disabled="uploadingDoc"
              @click="uploadDocument"
            >
              Upload
            </button>
          </div>
        </div>
      </div>

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
                    <button
                      class="btn btn-sm btn-danger"
                      @click="deleteMilestone(m.id)"
                    >
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
              <input
                v-model="milestoneForm.name"
                class="form-control"
                placeholder="Name"
              />
            </div>
            <div class="col-md-4">
              <input
                v-model="milestoneForm.deadline"
                type="date"
                class="form-control"
              />
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
            <input
              v-model="evaluationForm.comment"
              class="form-control"
              placeholder="Comment"
            />
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

      <div class="card mb-3">
        <div class="card-body">
          <h5>Audit Events</h5>

          <div v-if="project.audit_events?.length">
            <div v-for="item in project.audit_events" :key="item.id" class="card mb-3">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <div>
                      <strong>Auditor:</strong>
                      <RouterLink
                        v-if="
                          getAuditMainAuditorId(item) &&
                          canViewUser(auth.user, { id: getAuditMainAuditorId(item) })
                        "
                        :to="`/users/${getAuditMainAuditorId(item)}`"
                      >
                        {{ item.main_auditor_name || item.main_auditor?.name || '-' }}
                      </RouterLink>
                      <span v-else>{{ item.main_auditor_name || '-' }}</span>
                    </div>
                    <div><strong>Start:</strong> {{ item.start_time }}</div>
                    <div><strong>End:</strong> {{ item.end_time }}</div>
                    <div>
                      <strong>Result:</strong>
                      {{ item.result ? AUDIT_RESULT_LABELS[item.result] : 'Pending' }}
                    </div>
                  </div>

                  <button
                    v-if="isAdmin(auth.user)"
                    class="btn btn-sm btn-danger"
                    @click="deleteAudit(item.id)"
                  >
                    Delete
                  </button>
                </div>

                <div
                  v-if="
                    item.result == null &&
                    isAuditEnded(item.end_time) &&
                    canSetAuditResult(auth.user, item)
                  "
                  class="mt-3"
                >
                  <p class="text-muted small mb-2">
                    As the main auditor, set the audit result only. The organization will decide
                    whether to accept the project.
                  </p>
                  <div class="d-flex gap-2">
                    <button class="btn btn-success btn-sm" @click="setAuditResult(item.id, 1)">
                      Accept audit
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      @click="setAuditResult(item.id, 2)"
                    >
                      Decline audit
                    </button>
                  </div>
                </div>

                <div
                  v-else-if="
                    item.result && isAuditEnded(item.end_time) && Number(item.result) === 2
                  "
                  class="alert alert-warning mt-3 mb-0"
                >
                  Audit was declined. The project remains Pending.
                </div>

                <div v-if="item.participants?.length" class="mt-3">
                  <h6>Participants</h6>
                  <ul class="list-group">
                    <li
                      v-for="p in item.participants"
                      :key="p.id"
                      class="list-group-item d-flex justify-content-between"
                    >
                      {{ p.user?.name || p.user_id }}
                      <button
                        v-if="canWrite"
                        class="btn btn-sm btn-outline-danger"
                        @click="removeParticipant(item.id, p.user_id)"
                      >
                        Remove
                      </button>
                    </li>
                  </ul>
                </div>

                <div v-if="canWrite" class="d-flex gap-2 mt-3">
                  <input
                    v-model.number="ensureParticipantForm(item.id).user_id"
                    type="number"
                    class="form-control"
                    placeholder="User ID"
                  />
                  <select
                    v-model.number="ensureParticipantForm(item.id).role"
                    class="form-select"
                  >
                    <option :value="1">Auditor</option>
                    <option :value="2">Contributor</option>
                  </select>
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="addParticipant(item.id)"
                  >
                    Add participant
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-muted mb-3">No audit events</div>

          <div v-if="canScheduleAudit">
            <h6>Schedule audit</h6>
            <p class="text-muted small mb-2">Select the main auditor and audit period.</p>
            <div class="row g-2">
              <div class="col-md-4">
                <select v-model.number="auditForm.main_auditor" class="form-select">
                  <option :value="null" disabled>Select main auditor</option>
                  <option v-for="user in auditorCandidates" :key="user.id" :value="user.id">
                    {{ user.name }} ({{ ROLE_LABELS[user.role] || user.role }})
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <input
                  v-model="auditForm.start_time"
                  type="datetime-local"
                  class="form-control"
                />
              </div>
              <div class="col-md-3">
                <input
                  v-model="auditForm.end_time"
                  type="datetime-local"
                  class="form-control"
                />
              </div>
              <div class="col-auto">
                <button
                  class="btn btn-primary btn-sm"
                  :disabled="savingAudit || !auditForm.main_auditor"
                  @click="createAudit"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>

          <p
            v-else-if="project.status === 0 && !(project.audit_events?.length ?? 0)"
            class="text-muted small mb-0"
          >
            Only NTI staff or admin can schedule an audit for this project.
          </p>
        </div>
      </div>

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
