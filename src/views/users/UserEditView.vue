<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { ROLES, ROLE_LABELS } from '@/constants/roles'
import { canEditUser } from '@/utils/userPermissions'
import { apiData } from '@/utils/apiHelpers'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const user = ref<any>(null)
const loading = ref(false)
const saving = ref(false)

const form = ref({
  role: null as number | null,
  name: '',
  email: '',
  organization_id: null as number | null,
  birth_date: '',
  password: '',
  phone: '',
})

const isSelf = computed(() => auth.user?.id === user.value?.id)

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

const fetchUser = async () => {
  loading.value = true

  try {
    const res = await api.get(`/users/${route.params.id}`)
    user.value = apiData(res)

    form.value = {
      role: user.value.role,
      name: user.value.name,
      email: user.value.email,
      organization_id: user.value.organization_id,
      birth_date: user.value.birth_date || '',
      password: '',
      phone: user.value.phone || '',
    }
  } finally {
    loading.value = false
  }
}

const updateUser = async () => {
  saving.value = true

  try {
    const payload: any = {
      name: form.value.name,
      email: form.value.email,
      birth_date: form.value.birth_date,
      phone: form.value.phone || null,
    }

    if (form.value.password) {
      payload.password = form.value.password
    }

    if (!isSelf.value) {
      payload.role = form.value.role
      payload.organization_id = form.value.organization_id
    }

    const response = await api.patch(`/users/${route.params.id}`, payload)

    if (isSelf.value) {
      auth.user = apiData(response)
    }

    router.push(`/users/${route.params.id}`)
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to update user')
  } finally {
    saving.value = false
  }
}

onMounted(fetchUser)
</script>

<template>
  <div class="container py-4">
    <button class="btn btn-outline-secondary mb-3" @click="router.push(`/users/${route.params.id}`)">
      ← Back
    </button>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else-if="user">
      <div v-if="canEditUser(auth.user, user)">
        <h2 class="mb-4">Edit User</h2>

        <div class="card">
          <div class="card-body">
            <div v-if="!isSelf" class="mb-3">
              <label class="form-label">Role</label>
              <select v-model.number="form.role" class="form-select">
                <option v-for="role in assignableRoles" :key="role.value" :value="role.value">
                  {{ role.label }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Name</label>
              <input v-model="form.name" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Birth date</label>
              <input v-model="form.birth_date" type="date" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Phone</label>
              <input v-model="form.phone" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">New password</label>
              <input v-model="form.password" type="password" class="form-control" />
              <small class="text-muted">Leave empty to keep current password</small>
            </div>

            <div v-if="!isSelf" class="mb-3">
              <label class="form-label">Organization ID</label>
              <input v-model.number="form.organization_id" type="number" class="form-control" />
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-primary" :disabled="saving" @click="updateUser">
                {{ saving ? 'Saving...' : 'Save changes' }}
              </button>

              <button class="btn btn-secondary" @click="router.push(`/users/${user.id}`)">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5 text-danger">
        You don't have permission to edit this user
      </div>
    </div>

    <div v-else class="text-center py-5">User not found</div>
  </div>
</template>
