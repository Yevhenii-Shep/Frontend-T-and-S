import { defineStore } from 'pinia'
import api from '@/api/axios'
import { apiData } from '@/utils/apiHelpers'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null as any,
    isReady: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isEmailVerified: (state) => !!state.user?.email_verified_at,
  },

  actions: {
    async register(data: {
      name: string
      email: string
      password: string
      password_confirmation: string
      birth_date: string
      phone?: string | null
    }) {
      const response = await api.post('/register', data)

      this.token = response.data.token
      localStorage.setItem('token', response.data.token)

      await this.fetchUser()
    },

    async login(email: string, password: string) {
      const response = await api.post('/login', {
        email,
        password,
      })

      this.token = response.data.token
      localStorage.setItem('token', response.data.token)

      await this.fetchUser()
    },

    async fetchUser() {
      try {
        const response = await api.get('/me')
        this.user = apiData(response)
      } catch (e: any) {
        // НЕ удаляй токен если просто email не verified
        if (e?.response?.status === 401) {
          this.token = null
          this.user = null
          localStorage.removeItem('token')
        }
      } finally {
        this.isReady = true
      }
    },

    async logout() {
      try {
        await api.post('/logout')
      } catch {
        // игнорируем ошибки logout
      }

      this.token = null
      this.user = null
      this.isReady = false

      localStorage.removeItem('token')
    },

    async initAuth() {
      if (!this.token) {
        this.isReady = true
        return
      }

      await this.fetchUser()
    },

    async refreshUser() {
      await this.fetchUser()
    },
  },
})
