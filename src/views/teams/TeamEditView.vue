<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { canManageTeam } from '@/utils/teamPermissions'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const team = ref<any>(null)
const loading = ref(false)

const form = ref({
  name: '',
  slug: '',
  description: '',
})

const fetchTeam = async () => {
  loading.value = true

  try {
    const res = await api.get(`/teams/${route.params.id}`)
    team.value = res.data.data

    form.value = {
      name: team.value.name,
      slug: team.value.slug,
      description: team.value.description,
    }
  } finally {
    loading.value = false
  }
}

const canEdit = () => {
  return canManageTeam(team.value, auth.user)
}

const updateTeam = async () => {
  try {
    await api.put(`/teams/${route.params.id}`, form.value)

    router.push(`/teams/${route.params.id}`)
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to update team')
  }
}

onMounted(fetchTeam)
</script>

<template>
  <div class="container py-4">
    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else-if="team">
      <div v-if="canEdit()">
        <h2 class="mb-4">Edit Team</h2>

        <div class="card">
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input v-model="form.name" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Slug</label>
              <input v-model="form.slug" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="form-control"></textarea>
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-primary" @click="updateTeam">Save changes</button>

              <button class="btn btn-secondary" @click="router.push(`/teams/${team.id}`)">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5 text-danger">
        You don't have permission to edit this team
      </div>
    </div>

    <div v-else class="text-center py-5">Team not found</div>
  </div>
</template>
