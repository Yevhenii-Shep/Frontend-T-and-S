<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

import { canManageTeam, canDisbandTeam } from '@/utils/teamPermissions'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const team = ref<any>(null)
const loading = ref(false)

const canManage = () => canManageTeam(team.value, auth.user)
const canDisband = () => canDisbandTeam(team.value, auth.user)

const inviteCode = ref<string | null>(null)
const showInviteCode = ref(false)
const loadingInvite = ref(false)

const fetchTeam = async () => {
  loading.value = true

  try {
    const response = await api.get(`/teams/${route.params.id}`)
    team.value = response.data.data
  } finally {
    loading.value = false
  }
}

const toggleInviteCode = async () => {
  if (showInviteCode.value) {
    showInviteCode.value = false
    inviteCode.value = null
    return
  }

  loadingInvite.value = true

  try {
    const response = await api.get(`/teams/${route.params.id}/invite-code`)
    inviteCode.value = response.data.invite_code
    showInviteCode.value = true
  } finally {
    loadingInvite.value = false
  }
}

const regenerateInviteCode = async () => {
  const response = await api.post(`/teams/${route.params.id}/regenerate-invite-code`)

  inviteCode.value = response.data.invite_code
  showInviteCode.value = true
}

const disbandTeam = async () => {
  if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return

  try {
    await api.delete(`/teams/${route.params.id}`)

    // после удаления уходим на список
    router.push('/teams')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete team')
  }
}

onMounted(() => {
  fetchTeam()
})
</script>

<template>
  <div class="container py-4">
    <!-- loading -->
    <div v-if="loading" class="text-center py-5">Loading team...</div>

    <div v-else-if="team">
      <!-- header -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="mb-0">{{ team.name }}(ID: {{ team.id }})</h2>
          <p class="text-muted mb-0">
            {{ team.description || 'No description' }}
          </p>
        </div>

        <div class="d-flex gap-2">
          <button
            v-if="canManage()"
            class="btn btn-outline-primary btn-sm"
            @click="router.push(`/teams/${team.slug}/edit`)"
          >
            Edit
          </button>

          <span class="badge" :class="team.is_active ? 'bg-success' : 'bg-secondary'">
            {{ team.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>

      <!-- invite code section -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Invite Code</h5>

          <div v-if="showInviteCode && inviteCode" class="mb-2">
            <code class="fs-5">{{ inviteCode }}</code>
          </div>

          <div v-else class="text-muted mb-2">Hidden</div>

          <div v-if="canManage()" class="d-flex gap-2">
            <button
              class="btn btn-outline-primary btn-sm"
              @click="toggleInviteCode"
              :disabled="loadingInvite"
            >
              {{ showInviteCode ? 'Hide Invite Code' : 'Show Invite Code' }}
            </button>

            <button v-if="canManage()" class="btn btn-warning btn-sm" @click="regenerateInviteCode">
              Regenerate
            </button>
          </div>
        </div>
      </div>

      <!-- members -->
      <div class="card">
        <div class="card-body">
          <h5>Members</h5>

          <ul class="list-group">
            <li
              v-for="user in team.users"
              :key="user.id"
              class="list-group-item d-flex justify-content-between"
            >
              <span>
                {{ user.name }}
              </span>

              <span v-if="user.pivot?.is_leader" class="badge bg-primary"> Leader </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">Team not found</div>
    <!-- Disband Team -->
    <div v-if="canDisband()" class="card border-danger mt-4">
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <h5 class="text-danger mb-1">Danger Zone</h5>
          <small class="text-muted"> Deleting a team will remove access for all members </small>
        </div>

        <button class="btn btn-danger" @click="disbandTeam">Delete Team</button>
      </div>
    </div>
  </div>
</template>
