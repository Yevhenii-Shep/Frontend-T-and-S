<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { canViewUsers } from '@/utils/userPermissions'
import { ref } from 'vue'
import api from '@/api/axios'

const auth = useAuthStore()
const router = useRouter()
const loading = ref(false)

const logout = async () => {
  await auth.logout()
  router.push('/login')
}

const sendMailVerification = async () => {
  loading.value = true
  try {
    await api.post('/email/resend')
    router.push('/verify-email')
  } catch (e) {
    alert('Failed to send email')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/"> NTI </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul v-if="auth.isAuthenticated && auth.isEmailVerified" class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/teams"> Teams </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/projects"> Projects </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/subjects"> Subjects </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/categories"> Categories </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/organizations"> Organizations </RouterLink>
          </li>

          <li v-if="canViewUsers(auth.user)" class="nav-item">
            <RouterLink class="nav-link" to="/users"> Users </RouterLink>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto">
          <template v-if="auth.isAuthenticated">
            <li class="nav-item d-flex align-items-center me-3">
              <RouterLink class="nav-link text-light py-0" :to="`/users/${auth.user?.id}`">
                {{ auth.user?.name }}
              </RouterLink>
            </li>

            <li v-if="auth.isAuthenticated && !auth.isEmailVerified" class="nav-item me-2">
              <button
                class="btn btn-warning btn-sm"
                :disabled="loading"
                @click="sendMailVerification"
              >
                {{ loading ? 'Sending...' : 'Please, Verify Your Email' }}
              </button>
            </li>

            <li class="nav-item">
              <button
                class="btn btn-outline-light btn-sm me-1"
                @click="router.push(`/users/${auth.user?.id}`)"
              >
                Your Profile
              </button>
            </li>

            <li class="nav-item">
              <button class="btn btn-outline-light btn-sm" @click="logout">Logout</button>
            </li>
          </template>

          <template v-else>
            <li class="nav-item me-2">
              <RouterLink class="btn btn-outline-light btn-sm" to="/login"> Login </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="btn btn-success btn-sm" to="/register">
                Register as Student
              </RouterLink>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
