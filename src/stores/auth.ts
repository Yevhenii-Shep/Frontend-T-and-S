import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null as any,
    isReady: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
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

      // сразу загружаем пользователя
      await this.fetchUser()
    },

    async login(email: string, password: string) {
      const response = await api.post('/login', {
        email,
        password,
      })

      this.token = response.data.token
      localStorage.setItem('token', response.data.token)

      // ❗ ВСЕГДА берем актуального user с /me
      await this.fetchUser()
    },

    async fetchUser() {
      try {
        const response = await api.get('/me')
        this.user = response.data
      } catch (error) {
        // если токен невалидный — чистим всё
        this.token = null
        this.user = null
        localStorage.removeItem('token')
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

    // полезно при перезагрузке приложения
    async initAuth() {
      if (!this.token) {
        this.isReady = true
        return
      }

      await this.fetchUser()
    },
  },
})
