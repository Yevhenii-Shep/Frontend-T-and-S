<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '@/api/axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { canCreateProject } from '@/utils/projectPermissions'

const router = useRouter()
const auth = useAuthStore()

const projects = ref<any[]>([])
const loading = ref(false)

const filters = ref({
  status: '',
  organization_id: '',
  team_id: '',
  category_id: '',
})

const fetchProjects = async () => {
  loading.value = true

  try {
    const res = await api.get('/projects', {
      params: filters.value,
    })

    projects.value = res.data.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchProjects)
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Projects</h2>

      <button
        v-if="canCreateProject(auth.user)"
        class="btn btn-primary"
        @click="router.push('/projects/create')"
      >
        Create Project
      </button>
    </div>

    <!-- filters -->
    <div class="row g-2 mb-3">
      <div class="col">
        <input v-model="filters.status" class="form-control" placeholder="Status" />
      </div>

      <div class="col">
        <input v-model="filters.team_id" class="form-control" placeholder="Team ID" />
      </div>

      <div class="col">
        <input v-model="filters.category_id" class="form-control" placeholder="Category ID" />
      </div>

      <div class="col-auto">
        <button class="btn btn-outline-primary" @click="fetchProjects">Filter</button>
      </div>
    </div>

    <!-- list -->
    <div v-if="loading">Loading...</div>

    <div v-else class="list-group">
      <div
        v-for="p in projects"
        :key="p.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <div class="fw-bold">{{ p.name }}</div>
          <div class="text-muted">
            {{ p.category_name }} • {{ p.team_name }} • {{ p.organization_name }}
          </div>
        </div>

        <button class="btn btn-sm btn-outline-primary" @click="router.push(`/projects/${p.id}`)">
          Open
        </button>
      </div>
    </div>
  </div>
</template>
