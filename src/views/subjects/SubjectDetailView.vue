<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'

import { useAuthStore } from '@/stores/auth'
import { canManageSubjects, canDeleteSubjects } from '@/utils/subjectPermissions'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const subject = ref<any>(null)
const loading = ref(false)

const fetchSubject = async () => {
  loading.value = true

  try {
    const response = await api.get(`/subjects/${route.params.id}`)
    subject.value = response.data
  } finally {
    loading.value = false
  }
}

const deleteSubject = async () => {
  if (!confirm('Are you sure you want to delete this subject?')) {
    return
  }

  try {
    await api.delete(`/subjects/${route.params.id}`)

    alert('Subject deleted successfully')

    router.push('/subjects')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete subject')
  }
}

onMounted(() => {
  fetchSubject()
})
</script>

<template>
  <div class="container py-4">
    <!-- Back -->
    <div class="mb-3">
      <button class="btn btn-outline-secondary" @click="router.push('/subjects')">← Back</button>
    </div>

    <div v-if="loading" class="text-center py-5">Loading subject...</div>

    <div v-else-if="subject">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{{ subject.name }}(ID: {{ subject.id }})</h2>

          <p class="text-muted mb-0">
            {{ subject.description || 'No description provided' }}
          </p>
        </div>

        <div v-if="canManageSubjects(auth.user)" class="d-flex gap-2">
          <button
            class="btn btn-outline-primary"
            @click="router.push(`/subjects/${subject.id}/edit`)"
          >
            Edit
          </button>

          <button v-if="canDeleteSubjects(auth.user)" class="btn btn-danger" @click="deleteSubject">
            Delete
          </button>
        </div>
      </div>

      <!-- Categories -->
      <div class="card">
        <div class="card-body">
          <h5>Categories</h5>

          <div v-if="!subject.categories || subject.categories.length === 0" class="text-muted">
            No categories assigned
          </div>

          <ul v-else class="list-group">
            <li v-for="category in subject.categories" :key="category.id" class="list-group-item">
              {{ category.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">Subject not found</div>
  </div>
</template>
