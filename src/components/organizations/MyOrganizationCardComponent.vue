<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const organizationId = computed(() => auth.user?.organization_id)
const organization = computed(() => auth.user?.organization)
const organizationName = computed(() => auth.user?.organization?.name)

const goToOrg = () => {
  const slug = organization.value?.slug
  if (!slug) return
  router.push(`/organizations/${slug}`)
}
</script>

<template>
  <div v-if="organizationId" class="card mt-3">
    <div class="card-body">
      <h5>You are a member of the "{{ organizationName }}" organization</h5>

      <div class="d-flex align-items-center justify-content-center">
        <button class="btn btn-outline-primary btn-sm" @click="goToOrg">
          Open Your Organization
        </button>
      </div>
    </div>
  </div>
</template>
