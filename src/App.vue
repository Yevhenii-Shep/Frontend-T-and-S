<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NavBarComponent from '@/components/NavBarComponent.vue'

const authStore = useAuthStore()

onMounted(async () => {
  if (!authStore.isReady) {
    await authStore.initAuth()
  }
})
</script>

<template>
  <NavBarComponent />

  <RouterView />
</template>
