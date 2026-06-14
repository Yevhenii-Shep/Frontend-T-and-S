<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { canCreateTeam, canJoinTeam } from '@/utils/teamPermissions'
import { canCreateProject } from '@/utils/projectPermissions'
import { canViewUsers, canCreateUser } from '@/utils/userPermissions'
import { canManageCategories } from '@/utils/categoryPermissions'
import { canManageSubjects } from '@/utils/subjectPermissions'
import { canCreateOrganization } from '@/utils/organizationPermissions'
import { ROLES } from '@/constants/roles'
import MyTeamCardComponent from '@/components/teams/MyTeamCardComponent.vue'
import api from '@/api/axios'
import { apiData } from '@/utils/apiHelpers'

const auth = useAuthStore()
const router = useRouter()

const inviteCode = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const isStaff = () =>
  auth.user &&
  [ROLES.ADMIN, ROLES.NTI_EMPLOYEE, ROLES.ORGANIZATION_ADMIN, ROLES.ORGANIZATION_EMPLOYEE].includes(
    auth.user.role
  )

const joinTeam = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await api.post('/teams/join', {
      invite_code: inviteCode.value,
    })

    await auth.fetchUser()

    inviteCode.value = ''

    const team = apiData<{ id: number }>({ data: res.data.team })
    router.push(`/teams/${team.id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to join team'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-4">
    <div v-if="auth.isAuthenticated && auth.user" class="mb-4">
      <h1 class="mb-1">Welcome, {{ auth.user.name }}</h1>
      <p class="text-muted mb-0">NTI project management portal</p>
    </div>

    <h1 v-else class="mb-4">Home</h1>

    <div v-if="!auth.isAuthenticated" class="card mb-4 border-primary">
      <div class="card-body text-center py-5">
        <h3 class="mb-2">You are not registered yet</h3>

        <p class="text-muted mb-4">
          If you are a student, create an account to join or create a team
        </p>

        <button class="btn btn-lg btn-success" @click="router.push('/register')">
          Register as Student
        </button>
      </div>
    </div>

    <div v-if="auth.isAuthenticated" class="row g-3 mb-4">
      <div class="col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5>Projects</h5>
            <p class="text-muted">Browse and manage projects</p>
            <button class="btn btn-outline-primary btn-sm" @click="router.push('/projects')">
              Open
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5>Teams</h5>
            <p class="text-muted">View all teams</p>
            <button class="btn btn-outline-primary btn-sm" @click="router.push('/teams')">
              Open
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5>My Profile</h5>
            <p class="text-muted">Edit your account</p>
            <button
              class="btn btn-outline-primary btn-sm"
              @click="router.push(`/users/${auth.user?.id}`)"
            >
              Open
            </button>
          </div>
        </div>
      </div>

      <div v-if="canViewUsers(auth.user)" class="col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5>Users</h5>
            <p class="text-muted">Manage system users</p>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary btn-sm" @click="router.push('/users')">
                Open
              </button>
              <button
                v-if="canCreateUser(auth.user)"
                class="btn btn-primary btn-sm"
                @click="router.push('/users/create')"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isStaff()" class="col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5>Organizations</h5>
            <p class="text-muted">Partner organizations</p>
            <button class="btn btn-outline-primary btn-sm" @click="router.push('/organizations')">
              Open
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5>Subjects</h5>
            <p class="text-muted">Academic subjects</p>
            <button class="btn btn-outline-primary btn-sm" @click="router.push('/subjects')">
              Open
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5>Categories</h5>
            <p class="text-muted">Project categories</p>
            <button class="btn btn-outline-primary btn-sm" @click="router.push('/categories')">
              Open
            </button>
          </div>
        </div>
      </div>

      <div v-if="canCreateProject(auth.user)" class="col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5>New Project</h5>
            <p class="text-muted">Start a new project</p>
            <button class="btn btn-primary btn-sm" @click="router.push('/projects/create')">
              Create
            </button>
          </div>
        </div>
      </div>

      <div v-if="canCreateOrganization(auth.user)" class="col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5>New Organization</h5>
            <p class="text-muted">Register organization</p>
            <button
              class="btn btn-primary btn-sm"
              @click="router.push('/organizations/create')"
            >
              Create
            </button>
          </div>
        </div>
      </div>

      <div v-if="canManageSubjects(auth.user)" class="col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5>New Subject</h5>
            <p class="text-muted">Add academic subject</p>
            <button class="btn btn-primary btn-sm" @click="router.push('/subjects/create')">
              Create
            </button>
          </div>
        </div>
      </div>

      <div v-if="canManageCategories(auth.user)" class="col-md-4 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <h5>New Category</h5>
            <p class="text-muted">Add project category</p>
            <button class="btn btn-primary btn-sm" @click="router.push('/categories/create')">
              Create
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="auth.isAuthenticated" class="row g-3">
      <div v-if="canCreateTeam(auth.user)" class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5>Create Team</h5>
            <p class="text-muted">Start your own team</p>

            <button class="btn btn-primary" @click="router.push('/teams/create')">Create</button>
          </div>
        </div>
      </div>

      <div v-if="canJoinTeam(auth.user)" class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5>Join Team</h5>
            <p class="text-muted">Enter invite code</p>

            <input v-model="inviteCode" class="form-control mb-2" placeholder="Invite code" />

            <button class="btn btn-success" :disabled="loading" @click="joinTeam">
              {{ loading ? 'Joining...' : 'Join' }}
            </button>

            <p v-if="error" class="text-danger mt-2">
              {{ error }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="auth.isAuthenticated && auth.user?.has_active_team" class="mt-4">
      <MyTeamCardComponent />
    </div>
  </div>
</template>
