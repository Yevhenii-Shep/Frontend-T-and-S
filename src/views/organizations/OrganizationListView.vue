<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { canCreateOrganization } from '@/utils/organizationPermissions'
import MyOrganizationCardComponent from '@/components/organizations/MyOrganizationCardComponent.vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const organizations = ref<any[]>([])
const loading = ref(false)

const fetchOrganizations = async () => {
  loading.value = true

  try {
    const res = await api.get('/organizations')
    organizations.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrganizations)
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Organizations</h2>

      <button
        v-if="canCreateOrganization(auth.user)"
        class="btn btn-primary"
        @click="router.push('/organizations/create')"
      >
        Create Organization
      </button>
    </div>

    <div v-if="auth.isAuthenticated && auth.user?.organization_id" class="mt-4 mb-2">
      <MyOrganizationCardComponent />
    </div>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else class="row g-3">
      <div v-for="org in organizations" :key="org.id" class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <h5>{{ org.name }}</h5>

            <p class="text-muted mb-1">
              {{ org.sector || 'No sector' }}
            </p>

            <RouterLink class="btn btn-outline-primary btn-sm" :to="`/organizations/${org.slug}`">
              Open
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
