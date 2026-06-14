<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { canCreateUser, canViewUsers } from '@/utils/userPermissions'
import { ROLE_LABELS } from '@/constants/roles'
import { apiErrorMessage, apiList } from '@/utils/apiHelpers'

const router = useRouter()
const auth = useAuthStore()

const users = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const filters = ref({
  role: '',
  organization_id: '',
})

const hasAccess = computed(() => canViewUsers(auth.user))

const fetchUsers = async () => {
  if (!hasAccess.value) return

  loading.value = true
  error.value = null

  try {
    const res = await api.get('/users', {
      params: {
        role: filters.value.role || undefined,
        organization_id: filters.value.organization_id || undefined,
      },
    })

    users.value = apiList(res)
  } catch (e: unknown) {
    error.value = apiErrorMessage(e, 'Failed to load users')
    users.value = []
  } finally {
    loading.value = false
  }
}

const goToUser = (id: number) => {
  router.push(`/users/${id}`)
}

onMounted(fetchUsers)
</script>

<template>
  <div class="container py-4">
    <div v-if="!hasAccess" class="text-center py-5 text-danger">
      You don't have permission to view users
    </div>

    <template v-else>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Users</h2>

        <button
          v-if="canCreateUser(auth.user)"
          class="btn btn-primary"
          @click="router.push('/users/create')"
        >
          Create User
        </button>
      </div>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <select v-model="filters.role" class="form-select">
            <option value="">All roles</option>
            <option v-for="(label, key) in ROLE_LABELS" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <input
            v-model="filters.organization_id"
            class="form-control"
            placeholder="Organization ID"
          />
        </div>

        <div class="col-auto">
          <button class="btn btn-outline-primary" @click="fetchUsers">Filter</button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">Loading...</div>

      <div v-else class="card">
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead class="table-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Organization</th>
                <th class="text-end">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ ROLE_LABELS[user.role] ?? user.role }}</td>
                <td>{{ user.organization_name || '-' }}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-primary" @click="goToUser(user.id)">View</button>
                </td>
              </tr>

              <tr v-if="users.length === 0">
                <td colspan="5" class="text-center py-4">No users found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
