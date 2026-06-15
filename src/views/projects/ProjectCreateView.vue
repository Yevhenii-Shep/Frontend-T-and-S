<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import { creatableProgramTypes } from '@/utils/projectPermissions'
import { PROGRAM_TYPE_LABELS } from '@/constants/project'
import { apiData, apiList } from '@/utils/apiHelpers'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const categories = ref<any[]>([])

const form = ref({
  name: '',
  slug: '',
  description: '',
  team_id: null as number | null,
  organization_id: null as number | null,
  program_type: null as number | null,
  category_id: null as number | null,
  status: 0,
  deadline: '',
})

const programOptions = computed(() => creatableProgramTypes(auth.user))

const isStudent = () => auth.user?.role === ROLES.STUDENT
const isAdmin = () => auth.user?.role === ROLES.ADMIN

const fetchCategories = async () => {
  const response = await api.get('/categories')
  categories.value = apiList(response)
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

watch(
  () => form.value.name,
  (name) => {
    if (!form.value.slug) {
      form.value.slug = slugify(name)
    }
  }
)

const createProject = async () => {
  saving.value = true
  error.value = null

  try {
    const payload: any = {
      name: form.value.name,
      slug: form.value.slug,
      description: form.value.description || null,
      program_type: form.value.program_type,
      category_id: form.value.category_id,
      status: form.value.status,
      deadline: form.value.deadline || null,
    }

    if (!isStudent() && form.value.team_id) {
      payload.team_id = form.value.team_id
    }

    if (isAdmin() && form.value.organization_id) {
      payload.organization_id = form.value.organization_id
    }

    const response = await api.post('/projects', payload)

    router.push(`/projects/${apiData<{ id: number }>(response).id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Failed to create project'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true

  try {
    await fetchCategories()

    const types = programOptions.value
    if (types.length === 1 && types[0] !== undefined) {
      form.value.program_type = types[0]
    }

  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container py-4">
    <button class="btn btn-outline-secondary mb-3" @click="router.push('/projects')">
      ← Back
    </button>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else>
      <h2 class="mb-4">Create Project</h2>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div class="card">
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input v-model="form.name" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Slug</label>
            <input v-model="form.slug" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-control" rows="4" />
          </div>

          <div class="mb-3">
            <label class="form-label">Program type</label>
            <select v-model.number="form.program_type" class="form-select" required>
              <option :value="null" disabled>Select program type</option>
              <option v-for="type in programOptions" :key="type" :value="type">
                {{ PROGRAM_TYPE_LABELS[type] }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Category</label>
            <select v-model.number="form.category_id" class="form-select" required>
              <option :value="null" disabled>Select category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div v-if="isStudent()" class="alert alert-info py-2">
            The project will be linked to your active team automatically.
          </div>

          <div v-else class="mb-3">
            <label class="form-label">Team ID</label>
            <input v-model.number="form.team_id" type="number" class="form-control" />
          </div>

          <div v-if="isAdmin()" class="mb-3">
            <label class="form-label">Organization ID</label>
            <input v-model.number="form.organization_id" type="number" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label">Status</label>
            <select v-model.number="form.status" class="form-select">
              <option :value="0">Pending</option>
              <option :value="1">Active</option>
              <option :value="2">Done</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Deadline</label>
            <input v-model="form.deadline" type="date" class="form-control" />
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary" :disabled="saving" @click="createProject">
              {{ saving ? 'Creating...' : 'Create Project' }}
            </button>

            <button class="btn btn-secondary" @click="router.push('/projects')">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
