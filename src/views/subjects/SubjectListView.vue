<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api/axios'

import { useAuthStore } from '@/stores/auth'
import { canManageSubjects } from '@/utils/subjectPermissions'

const auth = useAuthStore()

const subjects = ref<any[]>([])
const loading = ref(false)

const fetchSubjects = async () => {
  loading.value = true

  try {
    const response = await api.get('/subjects')
    subjects.value = response.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSubjects()
})
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Subjects</h2>

      <RouterLink v-if="canManageSubjects(auth.user)" to="/subjects/create" class="btn btn-primary">
        Create Subject
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center py-5">Loading subjects...</div>

    <div v-else-if="subjects.length === 0" class="text-center py-5 text-muted">
      No subjects found
    </div>

    <div v-else class="row g-3">
      <div v-for="subject in subjects" :key="subject.id" class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">
              {{ subject.name }}
            </h5>

            <p class="card-text text-muted">
              {{ subject.description || 'No description' }}
            </p>

            <RouterLink :to="`/subjects/${subject.id}`" class="btn btn-outline-primary btn-sm">
              Open
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
