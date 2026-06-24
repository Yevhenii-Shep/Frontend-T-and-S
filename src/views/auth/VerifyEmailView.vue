<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'
import { ref } from 'vue'
import { onMounted } from 'vue'

const auth = useAuthStore()
const loading = ref(false)
const message = ref<string | null>(null)

const resend = async () => {
  loading.value = true
  message.value = null

  try {
    await api.post('/email/resend')

    message.value = 'Verification email sent again.'
  } catch (e: any) {
    message.value = e?.response?.data?.message || 'Failed to resend email'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await auth.refreshUser()
})
</script>

<template>
  <div v-if="!auth.isEmailVerified" class="container py-5 text-center">
    <h2>Check your email 📩</h2>

    <p class="text-muted mt-2">
      We sent a verification link to <b>{{ auth.user?.email }}</b
      >. Please verify your email to continue.
    </p>

    <button class="btn btn-primary mt-3" :disabled="loading" @click="resend">
      {{ loading ? 'Sending...' : 'Resend email' }}
    </button>

    <p v-if="message" class="mt-3 text-info">
      {{ message }}
    </p>
  </div>
  <div v-else class="container py-5 text-center">
    <h2>Your email is alreasy verified :)</h2>
  </div>
</template>
