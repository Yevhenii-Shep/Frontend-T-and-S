<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const teamId = computed(() => auth.user?.active_team_id)
const hasTeam = computed(() => !!teamId.value)

const goToTeam = () => {
  if (!teamId.value) return
  router.push(`/teams/${teamId.value}`)
}
</script>

<template>
  <div v-if="hasTeam" class="card mt-3">
    <div class="card-body">
      <h5>You are currently in an active team</h5>

      <div class="d-flex align-items-center justify-content-center">
        <button class="btn btn-outline-primary btn-sm" @click="goToTeam">Open Your Team</button>
      </div>
    </div>
  </div>
</template>
