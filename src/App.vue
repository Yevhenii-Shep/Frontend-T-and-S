<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NavBarComponent from '@/components/NavBarComponent.vue'

const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.token) {
    try {
      await authStore.fetchUser()
    } catch {
      await authStore.logout()
    }
  }
})
</script>

<template>
  <NavBarComponent />

  <RouterView />
</template>
