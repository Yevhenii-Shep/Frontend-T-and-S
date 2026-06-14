<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'

const route = useRoute()
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

const fetchCategory = async () => {
  const response = await api.get(`/categories/${route.params.id}`)

  const category = response.data

  form.value.name = category.name
  form.value.slug = category.slug
  form.value.description = category.description || ''

  form.value.subjects = category.subjects ? category.subjects.map((s: any) => s.id) : []
}

const fetchSubjects = async () => {
  const response = await api.get('/subjects')
  subjects.value = response.data
}

const updateCategory = async () => {
  saving.value = true

  try {
    await api.put(`/categories/${route.params.id}`, form.value)

    router.push(`/categories/${route.params.id}`)
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to update category')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true

  try {
    await Promise.all([fetchCategory(), fetchSubjects()])
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container py-4">
    <button
      class="btn btn-outline-secondary mb-3"
      @click="router.push(`/categories/${route.params.id}`)"
    >
      ← Back
    </button>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else>
      <h2 class="mb-4">Edit Category</h2>

      <form @submit.prevent="updateCategory">
        <!-- Name -->
        <div class="mb-3">
          <label class="form-label"> Name </label>

          <input v-model="form.name" class="form-control" required />
        </div>

        <!-- Slug -->
        <div class="mb-3">
          <label class="form-label"> Slug </label>

          <input v-model="form.slug" class="form-control" required />
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

        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>
  </div>
</template>
