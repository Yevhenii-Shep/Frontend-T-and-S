<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { canManageCategories } from '@/utils/categoryPermissions'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const category = ref<any>(null)
const loading = ref(false)

const fetchCategory = async () => {
  loading.value = true

  try {
    const response = await api.get(`/categories/${route.params.id}`)
    category.value = response.data
  } finally {
    loading.value = false
  }
}

const deleteCategory = async () => {
  if (!confirm('Are you sure you want to delete this category?')) {
    return
  }

  try {
    await api.delete(`/categories/${route.params.id}`)

    alert('Category deleted successfully')

    router.push('/categories')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete category')
  }
}

onMounted(() => {
  fetchCategory()
})
</script>

<template>
  <div class="container py-4">
    <div class="mb-3">
      <button class="btn btn-outline-secondary" @click="router.push('/categories')">← Back</button>
    </div>
    <div v-if="loading" class="text-center py-5">Loading category...</div>

    <div v-else-if="category">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{{ category.name }}</h2>

          <p class="text-muted mb-0">
            {{ category.slug }}
          </p>
        </div>

        <div v-if="canManageCategories(auth.user)" class="d-flex gap-2">
          <button
            class="btn btn-outline-primary"
            @click="router.push(`/categories/${category.id}/edit`)"
          >
            Edit
          </button>

          <button class="btn btn-danger" @click="deleteCategory">Delete</button>
        </div>
      </div>

      <!-- Description -->
      <div class="card mb-4">
        <div class="card-body">
          <h5>Description</h5>

          <p class="mb-0">
            {{ category.description || 'No description provided' }}
          </p>
        </div>
      </div>

      <!-- Subjects -->
      <div class="card">
        <div class="card-body">
          <h5>Subjects</h5>

          <div v-if="!category.subjects || category.subjects.length === 0" class="text-muted">
            No subjects assigned
          </div>

          <ul v-else class="list-group">
            <li v-for="subject in category.subjects" :key="subject.id" class="list-group-item">
              <strong>{{ subject.name }}</strong>

              <div v-if="subject.description" class="text-muted small">
                {{ subject.description }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">Category not found</div>
  </div>
</template>
