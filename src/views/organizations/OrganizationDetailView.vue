<script setup lang="ts">
console.log('DETAIL COMPONENT LOADED')
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

import { canEditOrganization, canDeleteOrganization } from '@/utils/organizationPermissions'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const organization = ref<any>(null)
const loading = ref(false)

const fetchOrganization = async () => {
  loading.value = true

  try {
    const res = await api.get(`/organizations/${route.params.id}`)
    organization.value = res.data.data ?? res.data
  } finally {
    loading.value = false
  }
}

const deleteOrganization = async () => {
  if (!confirm('Delete this organization?')) return

  try {
    await api.delete(`/organizations/${route.params.id}`)
    router.push('/organizations')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete')
  }
}

onMounted(() => {
  fetchOrganization()
})
</script>

<template>
  <div class="container py-4">
    <button class="btn btn-outline-secondary mb-3" @click="router.push('/organizations')">
      ← Back
    </button>

    <div v-if="loading" class="text-center py-5">Loading organization...</div>

    <div v-else-if="organization">
      <!-- HEADER -->
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2>{{ organization.name }}(ID: {{ organization.id }})</h2>
          <p class="text-muted mb-0">
            {{ organization.description || 'No description' }}
          </p>
        </div>

        <div class="d-flex gap-2">
          <button
            v-if="canEditOrganization(auth.user, organization)"
            class="btn btn-outline-primary"
            @click="router.push(`/organizations/${organization.id}/edit`)"
          >
            Edit
          </button>

          <button
            v-if="canDeleteOrganization(auth.user, organization)"
            class="btn btn-danger"
            @click="deleteOrganization"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- INFO -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Organization Info</h5>

          <p><strong>Sector:</strong> {{ organization.sector || '-' }}</p>
          <p><strong>Email:</strong> {{ organization.email || '-' }}</p>
          <p><strong>Phone:</strong> {{ organization.phone || '-' }}</p>
          <p><strong>Website:</strong> {{ organization.website_url || '-' }}</p>
          <p><strong>ICO:</strong> {{ organization.ico || '-' }}</p>
        </div>
      </div>

      <!-- ADMIN -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Organization Admin</h5>

          <div v-if="organization.organization_admin">
            {{ organization.organization_admin.name }}
          </div>

          <div v-else class="text-muted">No admin assigned</div>
        </div>
      </div>

      <!-- EMPLOYEES -->
      <div class="card mb-3">
        <div class="card-body">
          <h5>Employees</h5>

          <div
            v-if="!organization.employees || organization.employees.length === 0"
            class="text-muted"
          >
            No employees
          </div>

          <ul v-else class="list-group">
            <li
              v-for="emp in organization.employees"
              :key="emp.id"
              class="list-group-item d-flex justify-content-between"
            >
              {{ emp.name }}
            </li>
          </ul>
        </div>
      </div>

      <!-- PROJECTS -->
      <div class="card">
        <div class="card-body">
          <h5>Projects</h5>

          <div
            v-if="!organization.projects || organization.projects.length === 0"
            class="text-muted"
          >
            No projects
          </div>

          <ul v-else class="list-group">
            <li v-for="project in organization.projects" :key="project.id" class="list-group-item">
              {{ project.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">Organization not found</div>
  </div>
</template>
