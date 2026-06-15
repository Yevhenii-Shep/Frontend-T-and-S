<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const error = ref<string | null>(null)

const form = ref({
  name: '',
  slug: '',
  description: '',
  leader_id: null as number | null,
})

const isAdmin = () => auth.user?.role === ROLES.ADMIN

const createTeam = async () => {
  loading.value = true
  error.value = null

  try {
    const payload: any = {
      name: form.value.name,
      slug: form.value.slug,
      description: form.value.description,
    }

    // admin обязан выбрать leader
    if (isAdmin()) {
      if (!form.value.leader_id) {
        throw new Error('Leader is required for admin')
      }

      payload.leader_id = form.value.leader_id
    }

    const response = await api.post('/teams', payload)

    router.push(`/teams/${response.data.data.id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Failed to create team'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-4">
    <h2 class="mb-4">Create Team</h2>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div class="card">
      <div class="card-body">
        <!-- name -->
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input v-model="form.name" class="form-control" required />
        </div>

        <!-- slug -->
        <div class="mb-3">
          <label class="form-label">Slug</label>
          <input
            v-model="form.slug"
            class="form-control"
            placeholder="Slug (leave blank for auto-generated)"
          />
        </div>

        <!-- description -->
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-control"></textarea>
        </div>

        <!-- admin only -->
        <div v-if="isAdmin()" class="mb-3">
          <label class="form-label">Leader ID</label>
          <input
            v-model="form.leader_id"
            type="number"
            class="form-control"
            placeholder="Enter student ID"
          />
          <small class="text-muted">
            As Admin you must specify an ID of leader of this team(only students without active
            team)
          </small>
        </div>

        <!-- actions -->
        <div class="d-flex gap-2">
          <button class="btn btn-primary" @click="createTeam" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Team' }}
          </button>

          <button class="btn btn-secondary" @click="router.push('/teams')">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
