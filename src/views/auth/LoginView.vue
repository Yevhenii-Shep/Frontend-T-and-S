<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  try {
    error.value = ''

    await authStore.login(email.value, password.value)

    router.push('/')
  } catch {
    error.value = 'Invalid credentials'
  }
}
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-4">
        <h2 class="mb-4">Login</h2>

        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label"> Email </label>

            <input v-model="email" type="email" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label"> Password </label>

            <input v-model="password" type="password" class="form-control" />
          </div>

          <button class="btn btn-primary w-100" type="submit">Log In</button>
        </form>
      </div>
    </div>
  </div>
</template>
