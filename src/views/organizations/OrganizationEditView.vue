<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { canChangeOrganizationAdmin, canEditOrganization } from '@/utils/organizationPermissions'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const organization = ref<any>(null)
const loading = ref(false)
const saving = ref(false)

// employees
const employeeId = ref<number | null>(null)
const addingEmployee = ref(false)
const removingEmployeeId = ref<number | null>(null)

// change admin
const newAdminId = ref<number | null>(null)
const changingAdmin = ref(false)

// form
const form = ref({
  name: '',
  slug: '',
  description: '',
  website_url: '',
  phone: '',
  email: '',
  sector: '',
  ico: '',
})

const fetchOrganization = async () => {
  loading.value = true

  try {
    const res = await api.get(`/organizations/${route.params.id}`)
    organization.value = res.data.data ?? res.data

    Object.assign(form.value, organization.value)
  } finally {
    loading.value = false
  }
}

// update org
const updateOrganization = async () => {
  saving.value = true

  try {
    await api.put(`/organizations/${route.params.id}`, form.value)
    await fetchOrganization()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Update failed')
  } finally {
    saving.value = false
  }
}

// employees
const addEmployee = async () => {
  if (!employeeId.value) return

  addingEmployee.value = true

  try {
    await api.post(`/organizations/${route.params.id}/add-employee`, {
      user_id: employeeId.value,
    })

    employeeId.value = null
    await fetchOrganization()
  } finally {
    addingEmployee.value = false
  }
}

const removeEmployee = async (id: number) => {
  if (!confirm('Remove employee?')) return

  removingEmployeeId.value = id

  try {
    await api.post(`/organizations/${route.params.id}/remove-employee`, {
      user_id: id,
    })

    await fetchOrganization()
  } finally {
    removingEmployeeId.value = null
  }
}

// change admin
const changeAdmin = async () => {
  if (!newAdminId.value) return

  changingAdmin.value = true

  try {
    await api.post(`/organizations/${route.params.id}/change-admin`, {
      user_id: newAdminId.value,
    })

    newAdminId.value = null
    await fetchOrganization()
  } finally {
    changingAdmin.value = false
  }
}

onMounted(fetchOrganization)
</script>

<template>
  <div class="container py-4">
    <button
      class="btn btn-outline-secondary mb-3"
      @click="router.push(`/organizations/${route.params.id}`)"
    >
      ← Back
    </button>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else-if="organization">
      <h2 class="mb-4">Edit Organization</h2>

      <!-- BASIC FORM -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-2">
            <input v-model="form.name" class="form-control" placeholder="Name" />
            <input v-model="form.slug" class="form-control" placeholder="Slug" />
            <input v-model="form.website_url" class="form-control" placeholder="Website" />
            <input v-model="form.phone" class="form-control" placeholder="Phone" />
            <input v-model="form.email" class="form-control" placeholder="Email" />
            <input v-model="form.sector" class="form-control" placeholder="Sector" />
            <input v-model="form.ico" class="form-control" placeholder="ICO" />

            <textarea v-model="form.description" class="form-control" placeholder="Description" />
          </div>

          <button class="btn btn-primary mt-3" :disabled="saving" @click="updateOrganization">
            Save
          </button>
        </div>
      </div>

      <!-- CHANGE ADMIN -->
      <div class="card mb-4">
        <div class="card-body">
          <h5>Organization Admin</h5>

          <p class="text-muted">Current: {{ organization.organization_admin?.name || '-' }}</p>

          <div v-if="canChangeOrganizationAdmin(auth.user)" class="d-flex gap-2">
            <input
              v-model.number="newAdminId"
              type="number"
              class="form-control"
              placeholder="New admin user IDss"
            />

            <button class="btn btn-warning" :disabled="changingAdmin" @click="changeAdmin">
              Change
            </button>
          </div>
        </div>
      </div>

      <!-- EMPLOYEES -->
      <div class="card">
        <div class="card-body">
          <h5>Employees</h5>

          <div class="d-flex gap-2 mb-3">
            <input
              v-model.number="employeeId"
              type="number"
              class="form-control"
              placeholder="User ID"
            />

            <button class="btn btn-primary" :disabled="addingEmployee" @click="addEmployee">
              Add
            </button>
          </div>

          <ul class="list-group">
            <li
              v-for="emp in organization.employees"
              :key="emp.id"
              class="list-group-item d-flex justify-content-between"
            >
              {{ emp.name }}

              <button
                class="btn btn-sm btn-danger"
                :disabled="removingEmployeeId === emp.id"
                @click="removeEmployee(emp.id)"
              >
                Remove
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
