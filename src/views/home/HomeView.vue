<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { canCreateTeam, canJoinTeam } from '@/utils/teamPermissions'
import MyTeamCardComponent from '@/components/teams/MyTeamCardComponent.vue'
import api from '@/api/axios'

const auth = useAuthStore()
const router = useRouter()

const inviteCode = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const joinTeam = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await api.post('/teams/join', {
      invite_code: inviteCode.value,
    })

    await auth.fetchUser()

    inviteCode.value = ''

    router.push(`/teams/${res.data.team.data.id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to join team'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-4">
    <h1 class="mb-4">Home</h1>

    <!-- 🔥 CTA FOR GUESTS -->

    <div v-if="!auth.isAuthenticated" class="card mb-4 border-primary">
      <div class="card-body text-center py-5">
        <h3 class="mb-2">You are not registered yet</h3>

        <p class="text-muted mb-4">
          If you are a student, create an account to join or create a team
        </p>

        <button class="btn btn-lg btn-success" @click="router.push('/register')">
          Register as Student
        </button>
      </div>
    </div>

    <!-- ACTIONS GRID -->
    <div class="row g-3">
      <!-- CREATE TEAM -->
      <div v-if="canCreateTeam(auth.user)" class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5>Create Team</h5>
            <p class="text-muted">Start your own team</p>

            <button class="btn btn-primary" @click="router.push('/teams/create')">Create</button>
          </div>
        </div>
      </div>

      <!-- JOIN TEAM -->
      <div v-if="canJoinTeam(auth.user)" class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5>Join Team</h5>
            <p class="text-muted">Enter invite code</p>

            <input v-model="inviteCode" class="form-control mb-2" placeholder="Invite code" />

            <button class="btn btn-success" :disabled="loading" @click="joinTeam">
              {{ loading ? 'Joining...' : 'Join' }}
            </button>

            <p v-if="error" class="text-danger mt-2">
              {{ error }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div
      v-if="!canCreateTeam(auth.user) && !canJoinTeam(auth.user)"
      class="text-center text-muted mt-5"
    >
      <MyTeamCardComponent />
    </div>
  </div>
</template>
