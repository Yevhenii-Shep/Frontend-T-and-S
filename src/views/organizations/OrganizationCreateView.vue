<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)

const form = ref({
  name: '',
  slug: '',
  ico: '',
  description: '',
  website_url: '',
  phone: '',
  email: '',
  sector: '',
  organization_admin_id: null as number | null,
})

const submit = async () => {
  loading.value = true

  try {
    const payload: any = { ...form.value }

    // если пользователь ORG_ADMIN — он сам становится лидером
    if (auth.user?.role === ROLES.ORGANIZATION_ADMIN) {
      delete payload.organization_admin_id
    }

    const res = await api.post('/organizations', payload)

    router.push(`/organizations/${res.data.organization.id}`)
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to create organization')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-4">
    <h2>Create Organization</h2>

    <form @submit.prevent="submit" class="mt-3">
      <div class="mb-2">
        <input v-model="form.name" class="form-control" placeholder="Name" />
      </div>

      <div class="mb-2">
        <input
          v-model="form.slug"
          class="form-control"
          placeholder="Slug (leave blank for auto-generated)"
        />
      </div>

      <div class="mb-2">
        <input v-model="form.ico" class="form-control" placeholder="ICO" />
      </div>

      <div class="mb-2">
        <textarea v-model="form.description" class="form-control" placeholder="Description" />
      </div>

      <div class="mb-2">
        <input v-model="form.website_url" class="form-control" placeholder="Website" />
      </div>

      <div class="mb-2">
        <input v-model="form.phone" class="form-control" placeholder="Phone" />
      </div>

      <div class="mb-2">
        <input v-model="form.email" class="form-control" placeholder="Email" />
      </div>

      <div class="mb-2">
        <input v-model="form.sector" class="form-control" placeholder="Sector" />
      </div>

      <!-- ADMIN ONLY -->
      <div v-if="auth.user?.role === 1" class="mb-2">
        <input
          v-model.number="form.organization_admin_id"
          class="form-control"
          placeholder="Organization Admin ID"
        />
      </div>

      <button class="btn btn-primary" :disabled="loading">Create</button>
    </form>
  </div>
</template>
