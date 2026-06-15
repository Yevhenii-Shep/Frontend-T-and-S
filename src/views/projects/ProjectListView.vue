<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '@/api/axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import { canCreateProject } from '@/utils/projectPermissions'
import { PROJECT_STATUS_LABELS } from '@/constants/project'
import { apiList } from '@/utils/apiHelpers'

const router = useRouter()
const auth = useAuthStore()

const projects = ref<any[]>([])
const loading = ref(false)

const filters = ref({
  status: '',
  organization_id: '',
  team_id: '',
  category_id: '',
})

const fetchProjects = async () => {
  loading.value = true

  try {
    const res = await api.get('/projects', {
      params: {
        status: filters.value.status || undefined,
        organization_id: filters.value.organization_id || undefined,
        team_id: filters.value.team_id || undefined,
        category_id: filters.value.category_id || undefined,
      },
    })

    projects.value = apiList(res)
  } finally {
    loading.value = false
  }
}

const goToProject = (slug: String) => {
  router.push(`/projects/${slug}`)
}

const filterMyTeam = () => {
  if (!auth.user?.active_team_id) return

  filters.value.team_id = String(auth.user.active_team_id)
  fetchProjects()
}

const filterMyOrganization = () => {
  if (!auth.user?.organization_id) return

  filters.value.organization_id = String(auth.user.organization_id)
  fetchProjects()
}

const clearFilters = () => {
  filters.value = {
    status: '',
    organization_id: '',
    team_id: '',
    category_id: '',
  }
  fetchProjects()
}

const showMyTeamFilter = () => auth.user?.role === ROLES.STUDENT && !!auth.user.active_team_id

const showMyOrgFilter = () =>
  [ROLES.ORGANIZATION_ADMIN, ROLES.ORGANIZATION_EMPLOYEE].includes(auth.user?.role) &&
  !!auth.user?.organization_id

onMounted(fetchProjects)
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="mb-0">Projects</h2>

      <button
        v-if="canCreateProject(auth.user)"
        class="btn btn-primary"
        @click="router.push('/projects/create')"
      >
        Create Project
      </button>
    </div>

    <!-- filters -->
    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <select v-model="filters.status" class="form-select">
          <option value="">All statuses</option>
          <option value="0">Pending</option>
          <option value="1">Active</option>
          <option value="2">Done</option>
        </select>
      </div>

      <div class="col-md-3">
        <input v-model="filters.team_id" class="form-control" placeholder="Team ID" />
      </div>

      <div class="col-md-3">
        <input v-model="filters.category_id" class="form-control" placeholder="Category ID" />
      </div>

      <div class="col-md-3">
        <input
          v-model="filters.organization_id"
          class="form-control"
          placeholder="Organization ID"
        />
      </div>

      <div class="col-auto d-flex gap-2 flex-wrap">
        <button class="btn btn-outline-primary" @click="fetchProjects">Filter</button>
        <button v-if="showMyTeamFilter()" class="btn btn-outline-secondary" @click="filterMyTeam">
          My team projects
        </button>
        <button
          v-if="showMyOrgFilter()"
          class="btn btn-outline-secondary"
          @click="filterMyOrganization"
        >
          My organization projects
        </button>
        <button class="btn btn-outline-secondary" @click="clearFilters">Clear</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else class="card">
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-dark">
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Team</th>
              <th>Status</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="p in projects" :key="p.id">
              <td>{{ p.name }}</td>
              <td>{{ p.category_name || '-' }}</td>
              <td>{{ p.team_name || '-' }}</td>
              <td>
                <span class="badge bg-secondary">
                  {{ PROJECT_STATUS_LABELS[p.status] ?? p.status }}
                </span>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-primary" @click="goToProject(p.slug)">View</button>
              </td>
            </tr>

            <tr v-if="projects.length === 0">
              <td colspan="5" class="text-center py-4">No projects found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
