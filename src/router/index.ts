import HomeView from '@/views/home/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import TeamListView from '@/views/teams/TeamListView.vue'
import CategoryListView from '@/views/categories/CategoryListView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import SubjectListView from '@/views/subjects/SubjectListView.vue'
import OrganizationListView from '@/views/organizations/OrganizationListView.vue'
import ProjectListView from '@/views/projects/ProjectListView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },

    // Teams
    {
      path: '/teams',
      name: 'teams',
      component: TeamListView,
    },
    {
      path: '/teams/create',
      name: 'team-create',
      component: () => import('@/views/teams/TeamCreateView.vue'),
    },
    {
      path: '/teams/:id/edit',
      name: 'team-edit',
      component: () => import('@/views/teams/TeamEditView.vue'),
      props: true,
    },
    {
      path: '/teams/:id',
      name: 'team-detail',
      component: () => import('@/views/teams/TeamDetailView.vue'),
      props: true,
    },

    // Categories
    {
      path: '/categories',
      name: 'categories',
      component: CategoryListView,
    },
    {
      path: '/categories/create',
      name: 'category-create',
      component: () => import('@/views/categories/CategoryCreateView.vue'),
    },
    {
      path: '/categories/:id/edit',
      name: 'category-edit',
      component: () => import('@/views/categories/CategoryEditView.vue'),
      props: true,
    },
    {
      path: '/categories/:id',
      name: 'category-detail',
      component: () => import('@/views/categories/CategoryDetailView.vue'),
      props: true,
    },

    // Subjects
    {
      path: '/subjects',
      name: 'subjects',
      component: SubjectListView,
    },
    {
      path: '/subjects/create',
      name: 'subjects-create',
      component: () => import('@/views/subjects/SubjectCreateView.vue'),
    },
    {
      path: '/subjects/:id/edit',
      name: 'subjects-edit',
      component: () => import('@/views/subjects/SubjectEditView.vue'),
      props: true,
    },
    {
      path: '/subjects/:id',
      name: 'subjects-detail',
      component: () => import('@/views/subjects/SubjectDetailView.vue'),
      props: true,
    },

    // Organizations
    {
      path: '/organizations',
      name: 'organizations',
      component: OrganizationListView,
    },
    {
      path: '/organizations/create',
      name: 'organizations-create',
      component: () => import('@/views/organizations/OrganizationCreateView.vue'),
    },
    {
      path: '/organizations/:id/edit',
      name: 'organizations-edit',
      component: () => import('@/views/organizations/OrganizationEditView.vue'),
      props: true,
    },
    {
      path: '/organizations/:id',
      name: 'organizations-detail',
      component: () => import('@/views/organizations/OrganizationDetailView.vue'),
      props: true,
    },

    // Projects
    {
      path: '/projects',
      name: 'projects',
      component: ProjectListView,
    },
    {
      path: '/projects/create',
      name: 'project-create',
      component: () => import('@/views/projects/ProjectCreateView.vue'),
    },
    {
      path: '/projects/:id/edit',
      name: 'project-edit',
      component: () => import('@/views/projects/ProjectEditView.vue'),
      props: true,
    },
    {
      path: '/projects/:id',
      name: 'projects-detail',
      component: () => import('@/views/projects/ProjectDetailView.vue'),
      props: true,
    },

    // Users
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/users/UserListView.vue'),
    },
    {
      path: '/users/create',
      name: 'user-create',
      component: () => import('@/views/users/UserCreateView.vue'),
    },
    {
      path: '/users/:id/edit',
      name: 'user-edit',
      component: () => import('@/views/users/UserEditView.vue'),
      props: true,
    },
    {
      path: '/users/:id',
      name: 'user-detail',
      component: () => import('@/views/users/UserDetailView.vue'),
      props: true,
    },
  ],
})

const publicRoutes = ['home', 'login', 'register']

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.isReady) {
    await auth.initAuth()
  }

  if (!auth.isAuthenticated && !publicRoutes.includes(to.name as string)) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
