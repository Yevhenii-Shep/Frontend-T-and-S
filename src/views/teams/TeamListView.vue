<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'
import { canCreateTeam, canJoinTeam } from '@/utils/teamPermissions'
import MyTeamCardComponent from '@/components/teams/MyTeamCardComponent.vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()

const router = useRouter()

const teams = ref<any[]>([])
const loading = ref(false)
const status = ref('')

const fetchTeams = async () => {
  loading.value = true

  try {
    const response = await api.get('/teams', {
      params: {
        status: status.value || undefined,
      },
    })

    teams.value = response.data.data
  } finally {
    loading.value = false
  }
}

const goToTeam = (slug: String) => {
  router.push(`/teams/${slug}`)
}

onMounted(() => {
  fetchTeams()
})
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="mb-0">Teams</h2>
      <div class="d-flex gap-2">
        <select v-model="status" class="form-select" @change="fetchTeams">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
    <div v-if="auth.isAuthenticated && auth.user?.has_active_team" class="mt-4 mb-2">
      <MyTeamCardComponent />
    </div>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else class="card">
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-dark">
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="team in teams" :key="team.id">
              <td>{{ team.name }}</td>

              <td>
                {{ team.description || '-' }}
              </td>

              <td>
                <span class="badge" :class="team.is_active ? 'bg-success' : 'bg-secondary'">
                  {{ team.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <td class="text-end">
                <button class="btn btn-sm btn-primary" @click="goToTeam(team.slug)">View</button>
              </td>
            </tr>

            <tr v-if="teams.length === 0">
              <td colspan="4" class="text-center py-4">No teams found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
