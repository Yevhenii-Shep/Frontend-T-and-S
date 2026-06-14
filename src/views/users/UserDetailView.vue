<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS, ROLES } from '@/constants/roles'
import {
  canDeleteUser,
  canEditUser,
  canManageSubjectGrades,
  canViewUser,
  canViewUsers,
} from '@/utils/userPermissions'
import { apiData, apiList } from '@/utils/apiHelpers'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const user = ref<any>(null)
const loading = ref(false)
const accessDenied = ref(false)

// subjects
const subjects = ref<any[]>([])
const allSubjects = ref<any[]>([])
const subjectForm = ref({ subject_id: null as number | null, grade: null as number | null })
const addingSubject = ref(false)

// avatar
const avatarFile = ref<File | null>(null)
const uploadingAvatar = ref(false)

const isSelf = () => auth.user?.id === user.value?.id

const subjectGrade = (subject: any) => subject.grade ?? subject.pivot?.grade ?? '-'

const fetchUser = async () => {
  loading.value = true
  accessDenied.value = false

  try {
    const response = await api.get(`/users/${route.params.id}`)
    user.value = apiData(response)

    if (!canViewUser(auth.user, user.value)) {
      accessDenied.value = true
      user.value = null
      return
    }

    if (user.value.role === ROLES.STUDENT) {
      const subjectsRes = await api.get(`/users/${user.value.id}/subjects`)
      subjects.value = apiList(subjectsRes)
    }
  } catch (e: any) {
    if (e?.response?.status === 403) {
      accessDenied.value = true
    }
    user.value = null
  } finally {
    loading.value = false
  }
}

const fetchAllSubjects = async () => {
  const response = await api.get('/subjects')
  allSubjects.value = apiList(response)
}

const handleDelete = async () => {
  if (!confirm('Deactivate this user?')) return

  try {
    await api.delete(`/users/${user.value.id}`)
    router.push('/users')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to delete user')
  }
}

const addSubject = async () => {
  if (!subjectForm.value.subject_id) return

  addingSubject.value = true

  try {
    await api.post(`/users/${user.value.id}/subjects`, {
      subject_id: subjectForm.value.subject_id,
      grade: subjectForm.value.grade,
    })

    subjectForm.value = { subject_id: null, grade: null }
    await fetchUser()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to add subject')
  } finally {
    addingSubject.value = false
  }
}

const updateGrade = async (subjectId: number, grade: number) => {
  try {
    await api.patch(`/users/${user.value.id}/subjects/${subjectId}`, { grade })
    await fetchUser()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to update grade')
  }
}

const removeSubject = async (subjectId: number) => {
  if (!confirm('Remove subject?')) return

  try {
    await api.delete(`/users/${user.value.id}/subjects/${subjectId}`)
    await fetchUser()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to remove subject')
  }
}

const onAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  avatarFile.value = input.files?.[0] || null
}

const uploadAvatar = async () => {
  if (!avatarFile.value || !isSelf()) return

  uploadingAvatar.value = true

  try {
    const formData = new FormData()
    formData.append('avatar', avatarFile.value)

    const response = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    auth.user = apiData(response)
    avatarFile.value = null
    await fetchUser()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to upload avatar')
  } finally {
    uploadingAvatar.value = false
  }
}

onMounted(async () => {
  await fetchUser()

  if (canManageSubjectGrades(auth.user) && user.value?.role === ROLES.STUDENT) {
    await fetchAllSubjects()
  }
})
</script>

<template>
  <div class="container py-4">
    <button
      v-if="canViewUsers(auth.user)"
      class="btn btn-outline-secondary mb-3"
      @click="router.push('/users')"
    >
      ← Back
    </button>

    <div v-if="loading" class="text-center py-5">Loading...</div>

    <div v-else-if="accessDenied" class="text-center py-5 text-danger">
      You don't have permission to view this user
    </div>

    <div v-else-if="user">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2 class="mb-1">{{ user.name }}</h2>
          <h3 class="mb-1">User ID: {{ user.id }}</h3>
          <p class="text-muted mb-0">{{ user.email }}</p>
        </div>

        <div class="d-flex gap-2">
          <button
            v-if="canEditUser(auth.user, user)"
            class="btn btn-outline-primary btn-sm"
            @click="router.push(`/users/${user.id}/edit`)"
          >
            Edit
          </button>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-body">
          <div v-if="user.avatar_url" class="mb-3">
            <img :src="user.avatar_url" alt="Avatar" class="rounded" style="max-height: 120px" />
          </div>

          <p><strong>Role:</strong> {{ ROLE_LABELS[user.role] ?? user.role }}</p>
          <p><strong>Organization:</strong> {{ user.organization_name || '-' }}</p>
          <p><strong>Birth date:</strong> {{ user.birth_date || '-' }}</p>
          <p><strong>Phone:</strong> {{ user.phone || '-' }}</p>
          <p v-if="user.role === ROLES.STUDENT">
            <strong>Active team:</strong> {{ user.has_active_team ? user.active_team_id : 'None' }}
          </p>
        </div>
      </div>

      <div v-if="isSelf()" class="card mb-3">
        <div class="card-body">
          <h5>Avatar</h5>

          <div class="d-flex gap-2">
            <input type="file" class="form-control" accept="image/*" @change="onAvatarChange" />
            <button
              class="btn btn-primary btn-sm"
              :disabled="uploadingAvatar"
              @click="uploadAvatar"
            >
              Upload
            </button>
          </div>
        </div>
      </div>

      <div v-if="user.role === ROLES.STUDENT" class="card mb-3">
        <div class="card-body">
          <h5>Subjects</h5>

          <div v-if="subjects.length">
            <ul class="list-group mb-3">
              <li
                v-for="subject in subjects"
                :key="subject.id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{{ subject.name }}</span>

                <div class="d-flex gap-2 align-items-center">
                  <span v-if="!canManageSubjectGrades(auth.user)" class="badge bg-secondary">
                    Grade: {{ subjectGrade(subject) }}
                  </span>

                  <template v-else>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      step="0.5"
                      class="form-control form-control-sm"
                      style="width: 80px"
                      :value="subject.grade ?? subject.pivot?.grade"
                      @change="
                        updateGrade(subject.id, Number(($event.target as HTMLInputElement).value))
                      "
                    />

                    <button class="btn btn-sm btn-danger" @click="removeSubject(subject.id)">
                      Remove
                    </button>
                  </template>
                </div>
              </li>
            </ul>
          </div>

          <div v-else class="text-muted mb-3">No subjects</div>

          <div v-if="canManageSubjectGrades(auth.user)" class="d-flex gap-2">
            <select v-model.number="subjectForm.subject_id" class="form-select">
              <option :value="null" disabled>Select subject</option>
              <option v-for="s in allSubjects" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>

            <input
              v-model.number="subjectForm.grade"
              type="number"
              min="1"
              max="4"
              class="form-control"
              placeholder="Grade"
            />

            <button class="btn btn-primary btn-sm" :disabled="addingSubject" @click="addSubject">
              Add
            </button>
          </div>
        </div>
      </div>

      <div v-if="canDeleteUser(auth.user, user)" class="card border-danger">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="text-danger mb-1">Danger Zone</h5>
            <small class="text-muted">Deactivating a user revokes all tokens</small>
          </div>

          <button class="btn btn-danger" @click="handleDelete">Deactivate User</button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">User not found</div>
  </div>
</template>
