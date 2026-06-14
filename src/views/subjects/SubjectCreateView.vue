<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)

const form = ref({
  name: '',
  description: '',
})

const createSubject = async () => {
  saving.value = true

  try {
    const response = await api.post('/subjects', form.value)

    const subjectId = response.data.subject.id

    router.push(`/subjects/${subjectId}`)
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to create subject')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loading.value = false
})
</script>

<template>
  <div class="container py-4">
    <!-- Back -->
    <div class="mb-3">
      <button class="btn btn-outline-secondary" @click="router.push('/subjects')">← Back</button>
    </div>

    <div>
      <h2 class="mb-4">Create Subject</h2>

      <form @submit.prevent="createSubject">
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

        <button type="submit" class="btn btn-success" :disabled="saving">
          {{ saving ? 'Creating...' : 'Create Subject' }}
        </button>
      </form>
    </div>
  </div>
</template>
