<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { canManageCategories } from '@/utils/categoryPermissions'

const auth = useAuthStore()

const categories = ref<any[]>([])
const loading = ref(false)

const fetchCategories = async () => {
  loading.value = true

  try {
    const response = await api.get('/categories')
    categories.value = response.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Categories</h2>

      <RouterLink
        v-if="canManageCategories(auth.user)"
        to="/categories/create"
        class="btn btn-primary"
      >
        Create Category
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center py-5">Loading categories...</div>

    <div v-else-if="categories.length === 0" class="text-center py-5 text-muted">
      No categories found
    </div>

    <div v-else class="row g-3">
      <div v-for="category in categories" :key="category.id" class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">
              {{ category.name }}
            </h5>

            <RouterLink :to="`/categories/${category.slug}`" class="btn btn-outline-primary btn-sm">
              Open
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
