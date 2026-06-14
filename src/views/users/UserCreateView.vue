<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { ROLES, ROLE_LABELS } from '@/constants/roles'
import { apiData } from '@/utils/apiHelpers'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const form = ref({
  role: null as number | null,
  name: '',
  email: '',
  organization_id: null as number | null,
  birth_date: '',
  password: '',
  phone: '',
})

const assignableRoles = computed(() => {
  if (auth.user?.role === ROLES.ADMIN) {
    return Object.entries(ROLE_LABELS).map(([value, label]) => ({
      value: Number(value),
      label,
    }))
  }

  if (auth.user?.role === ROLES.NTI_EMPLOYEE) {
    return [
      { value: ROLES.STUDENT, label: ROLE_LABELS[ROLES.STUDENT] },
      { value: ROLES.ORGANIZATION_EMPLOYEE, label: ROLE_LABELS[ROLES.ORGANIZATION_EMPLOYEE] },
      { value: ROLES.ORGANIZATION_ADMIN, label: ROLE_LABELS[ROLES.ORGANIZATION_ADMIN] },
    ]
  }

  return []
})

const createUser = async () => {
  saving.value = true
  error.value = null

  try {
    const response = await api.post('/users', {
      role: form.value.role,
      name: form.value.name,
      email: form.value.email,
      organization_id: form.value.organization_id,
      birth_date: form.value.birth_date,
      password: form.value.password,
      phone: form.value.phone || null,
    })

    router.push(`/users/${apiData<{ id: number }>(response).id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Failed to create user'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loading.value = true
  loading.value = false
})
</script>

<template>
  <div class="container py-4">
    <button class="btn btn-outline-secondary mb-3" @click="router.push('/users')">← Back</button>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else>
      <h2 class="mb-4">Create User</h2>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div class="card">
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Role</label>
            <select v-model.number="form.role" class="form-select" required>
              <option :value="null" disabled>Select role</option>
              <option v-for="role in assignableRoles" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Name</label>
            <input v-model="form.name" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="form.email" type="email" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Birth date</label>
            <input v-model="form.birth_date" type="date" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Password</label>
            <input v-model="form.password" type="password" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input v-model="form.phone" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label">Organization ID</label>
            <input v-model.number="form.organization_id" type="number" class="form-control" />
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary" :disabled="saving" @click="createUser">
              {{ saving ? 'Creating...' : 'Create User' }}
            </button>

            <button class="btn btn-secondary" @click="router.push('/users')">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
