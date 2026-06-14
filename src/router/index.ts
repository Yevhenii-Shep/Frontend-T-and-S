import HomeView from '@/views/home/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import TeamListView from '@/views/teams/TeamListView.vue'
import CategoryListView from '@/views/categories/CategoryListView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import SubjectListView from '@/views/subjects/SubjectListView.vue'
import OrganizationListView from '@/views/organizations/OrganizationListView.vue'
import ProjectListView from '@/views/projects/ProjectListView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'

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
      path: '/teams/:id',
      name: 'team-detail',
      component: () => import('@/views/teams/TeamDetailView.vue'),
      props: true,
    },
    {
      path: '/teams/:id/edit',
      name: 'team-edit',
      component: () => import('@/views/teams/TeamEditView.vue'),
      props: true,
    },
    {
      path: '/teams/create',
      name: 'team-create',
      component: () => import('@/views/teams/TeamCreateView.vue'),
    },

    // Categories
    {
      path: '/categories',
      name: 'categories',
      component: CategoryListView,
    },
    {
      path: '/categories/:id',
      name: 'category-detail',
      component: () => import('@/views/categories/CategoryDetailView.vue'),
      props: true,
    },
    {
      path: '/categories/:id/edit',
      name: 'category-edit',
      component: () => import('@/views/categories/CategoryEditView.vue'),
      props: true,
    },
    {
      path: '/categories/create',
      name: 'category-create',
      component: () => import('@/views/categories/CategoryCreateView.vue'),
    },

    // Subjects
    {
      path: '/subjects',
      name: 'subjects',
      component: SubjectListView,
    },
    {
      path: '/subjects/:id',
      name: 'subjects-detail',
      component: () => import('@/views/subjects/SubjectDetailView.vue'),
      props: true,
    },
    {
      path: '/subjects/:id/edit',
      name: 'subjects-edit',
      component: () => import('@/views/subjects/SubjectEditView.vue'),
      props: true,
    },
    {
      path: '/subjects/create',
      name: 'subjects-create',
      component: () => import('@/views/subjects/SubjectCreateView.vue'),
    },

    // Organizations
    {
      path: '/organizations',
      name: 'organizations',
      component: OrganizationListView,
    },
    {
      path: '/organizations/:id',
      name: 'organizations-detail',
      component: () => import('@/views/organizations/OrganizationDetailView.vue'),
      props: true,
    },
    {
      path: '/organizations/:id/edit',
      name: 'organizations-edit',
      component: () => import('@/views/organizations/OrganizationEditView.vue'),
      props: true,
    },
    {
      path: '/organizations/create',
      name: 'organizations-create',
      component: () => import('@/views/organizations/OrganizationCreateView.vue'),
    },

    // Projects
    {
      path: '/projects',
      name: 'projects',
      component: ProjectListView,
    },
    {
      path: '/projects/:id',
      name: 'projects-detail',
      component: () => import('@/views/projects/ProjectDetailView.vue'),
      props: true,
    },
  ],
})

export default router
