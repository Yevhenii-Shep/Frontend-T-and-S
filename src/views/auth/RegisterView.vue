<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const form = ref({
  name: '',
  email: '',
  birth_date: '',
  password: '',
  password_confirmation: '',
  phone: '',
})

const loading = ref(false)

const submit = async () => {
  loading.value = true

  try {
    await auth.register(form.value)
    router.push('/') // после регистрации на главную
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-4">
    <h2>Register</h2>

    <div class="card mt-3">
      <div class="card-body">
        <input v-model="form.name" class="form-control mb-2" placeholder="Name" />
        <input v-model="form.email" class="form-control mb-2" placeholder="Email" />

        <input v-model="form.birth_date" type="date" class="form-control mb-2" />

        <input v-model="form.phone" class="form-control mb-2" placeholder="Phone (optional)" />

        <input
          v-model="form.password"
          type="password"
          class="form-control mb-2"
          placeholder="Password"
        />

        <input
          v-model="form.password_confirmation"
          type="password"
          class="form-control mb-3"
          placeholder="Confirm password"
        />

        <button class="btn btn-primary w-100" :disabled="loading" @click="submit">Register</button>
      </div>
    </div>
  </div>
</template>
