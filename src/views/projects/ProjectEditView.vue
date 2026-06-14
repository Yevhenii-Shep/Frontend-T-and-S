<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { canEditProject } from '@/utils/projectPermissions'
import { apiData } from '@/utils/apiHelpers'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const project = ref<any>(null)
const loading = ref(false)
const saving = ref(false)

const form = ref({
  name: '',
  slug: '',
  description: '',
})

const fetchProject = async () => {
  loading.value = true

  try {
    const res = await api.get(`/projects/${route.params.id}`)
    project.value = apiData(res)

    form.value = {
      name: project.value.name,
      slug: project.value.slug,
      description: project.value.description || '',
    }
  } finally {
    loading.value = false
  }
}

const updateProject = async () => {
  saving.value = true

  try {
    await api.patch(`/projects/${route.params.id}`, form.value)
    router.push(`/projects/${route.params.id}`)
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to update project')
  } finally {
    saving.value = false
  }
}

onMounted(fetchProject)
</script>

<template>
  <div class="container py-4">
    <button
      class="btn btn-outline-secondary mb-3"
      @click="router.push(`/projects/${route.params.id}`)"
    >
      ← Back
    </button>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else-if="project">
      <div v-if="canEditProject(auth.user, project)">
        <h2 class="mb-4">Edit Project</h2>

        <div class="card">
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input v-model="form.name" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Slug</label>
              <input v-model="form.slug" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="form-control" rows="4" />
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-primary" :disabled="saving" @click="updateProject">
                {{ saving ? 'Saving...' : 'Save changes' }}
              </button>

              <button class="btn btn-secondary" @click="router.push(`/projects/${project.id}`)">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5 text-danger">
        You don't have permission to edit this project
      </div>
    </div>

    <div v-else class="text-center py-5">Project not found</div>
  </div>
</template>
