<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)

const form = ref({
  name: '',
  description: '',
})

const fetchSubject = async () => {
  const response = await api.get(`/subjects/${route.params.id}`)

  form.value.name = response.data.name
  form.value.description = response.data.description || ''
}

const updateSubject = async () => {
  saving.value = true

  try {
    await api.put(`/subjects/${route.params.id}`, form.value)

    router.push(`/subjects/${route.params.id}`)
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to update subject')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true

  try {
    await fetchSubject()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container py-4">
    <!-- Back -->
    <div class="mb-3">
      <button
        class="btn btn-outline-secondary"
        @click="router.push(`/subjects/${route.params.id}`)"
      >
        ← Back
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else>
      <h2 class="mb-4">Edit Subject</h2>

      <form @submit.prevent="updateSubject">
        <!-- Name -->
        <div class="mb-3">
          <label class="form-label">Name</label>

          <input v-model="form.name" class="form-control" required />
        </div>

        <!-- Description -->
        <div class="mb-3">
          <label class="form-label">Description</label>

          <textarea v-model="form.description" class="form-control" rows="4" />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save changes' }}
        </button>
      </form>
    </div>
  </div>
</template>
