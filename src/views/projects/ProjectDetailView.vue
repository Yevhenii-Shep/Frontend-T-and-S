<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { canViewProject, canEditProject, canDeleteProject } from '@/utils/projectPermissions'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const project = ref<any>(null)
const loading = ref(false)

const fetchProject = async () => {
  loading.value = true

  try {
    const res = await api.get(`/projects/${route.params.id}`)
    project.value = res.data.data
  } finally {
    loading.value = false
  }
}

const isAllowed = computed(() => canViewProject(auth.user, project.value))

const handleDelete = async () => {
  if (!confirm('Delete this project?')) return

  try {
    await api.delete(`/projects/${project.value.id}`)
    router.push('/projects')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete project')
  }
}

onMounted(fetchProject)
</script>

<template>
  <div class="container py-4">
    <button class="btn btn-outline-secondary mb-3" @click="router.push('/projects')">← Back</button>

    <div v-if="loading">Loading...</div>

    <div v-else-if="project && isAllowed">
      <!-- HEADER -->
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2 class="mb-1">{{ project.name }}</h2>
          <p class="text-muted mb-0">
            {{ project.description || 'No description' }}
          </p>
        </div>

        <div class="d-flex gap-2">
          <button
            v-if="canEditProject(auth.user, project)"
            class="btn btn-outline-primary"
            @click="router.push(`/projects/${project.id}/edit`)"
          >
            Edit
          </button>

          <button
            v-if="canDeleteProject(auth.user, project)"
            class="btn btn-danger"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- INFO -->
      <div class="card mb-3">
        <div class="card-body">
          <p><strong>Status:</strong> {{ project.status }}</p>
          <p><strong>Category:</strong> {{ project.category_name }}</p>
          <p><strong>Team:</strong> {{ project.team_name }}</p>
          <p><strong>Organization:</strong> {{ project.organization_name }}</p>
          <p><strong>Deadline:</strong> {{ project.deadline || '-' }}</p>
          <p><strong>Program type:</strong> {{ project.program_type }}</p>
        </div>
      </div>

      <!-- TEAM -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Team</h5>

          <div v-if="project.team?.users?.length">
            <ul class="list-group">
              <li
                v-for="u in project.team.users"
                :key="u.id"
                class="list-group-item d-flex justify-content-between"
              >
                <span>{{ u.name }}</span>

                <span v-if="u.pivot?.is_leader" class="badge bg-primary"> Leader </span>
              </li>
            </ul>
          </div>

          <div v-else class="text-muted">No team assigned</div>
        </div>
      </div>

      <!-- DOCUMENTS -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Documents</h5>

          <div v-if="project.documents?.length">
            <ul class="list-group">
              <li v-for="doc in project.documents" :key="doc.id" class="list-group-item">
                {{ doc.name }}
              </li>
            </ul>
          </div>

          <div v-else class="text-muted">No documents</div>
        </div>
      </div>

      <!-- MILESTONES -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Milestones</h5>

          <div v-if="project.milestones?.length">
            <ul class="list-group">
              <li v-for="m in project.milestones" :key="m.id" class="list-group-item">
                {{ m.name }}
              </li>
            </ul>
          </div>

          <div v-else class="text-muted">No milestones</div>
        </div>
      </div>

      <!-- EVALUATIONS -->
      <div class="card">
        <div class="card-body">
          <h5>Evaluations</h5>

          <div v-if="project.evaluations?.length">
            <ul class="list-group">
              <li v-for="e in project.evaluations" :key="e.id" class="list-group-item">
                {{ e.score }} / {{ e.comment || 'No comment' }}
              </li>
            </ul>
          </div>

          <div v-else class="text-muted">No evaluations</div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">Project not found or access denied</div>
  </div>
</template>
