<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)

const subjects = ref<any[]>([])

const form = ref({
  name: '',
  slug: '',
  description: '',
  subjects: [] as number[],
})

const fetchSubjects = async () => {
  const response = await api.get('/subjects')
  subjects.value = response.data
}

const createCategory = async () => {
  saving.value = true

  try {
    const response = await api.post('/categories', form.value)

    const categoryId = response.data.category.id

    router.push(`/categories/${categoryId}`)
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to create category')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true

  try {
    await fetchSubjects()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container py-4">
    <button class="btn btn-outline-secondary mb-3" @click="router.push('/categories')">
      ← Back
    </button>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else>
      <h2 class="mb-4">Create Category</h2>

      <form @submit.prevent="createCategory">
        <!-- Name -->
        <div class="mb-3">
          <label class="form-label"> Name </label>

          <input v-model="form.name" class="form-control" required />
        </div>

        <!-- Slug -->
        <div class="mb-3">
          <label class="form-label"> Slug </label>

          <input
            v-model="form.slug"
            class="form-control"
            placeholder="Slug (leave blank for auto-generated)"
          />
        </div>

        <!-- Description -->
        <div class="mb-3">
          <label class="form-label"> Description </label>

          <textarea v-model="form.description" class="form-control" rows="4" />
        </div>

        <!-- Subjects -->
        <div class="mb-4">
          <label class="form-label"> Subjects </label>

          <div v-for="subject in subjects" :key="subject.id" class="form-check">
            <input
              :id="`subject-${subject.id}`"
              v-model="form.subjects"
              :value="subject.id"
              type="checkbox"
              class="form-check-input"
            />

            <label :for="`subject-${subject.id}`" class="form-check-label">
              {{ subject.name }}
            </label>
          </div>
        </div>

        <button type="submit" class="btn btn-success" :disabled="saving">
          {{ saving ? 'Creating...' : 'Create Category' }}
        </button>
      </form>
    </div>
  </div>
</template>
