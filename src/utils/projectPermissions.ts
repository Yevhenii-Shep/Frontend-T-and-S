import { ROLES } from '@/constants/roles'

export const canViewProject = (user: any, project: any) => {
  if (!user || !project) return false

  if (user.role === ROLES.ADMIN) return true
  if (user.role === ROLES.NTI_EMPLOYEE) return true

  // org roles
  if (user.role === ROLES.ORGANIZATION_ADMIN || user.role === ROLES.ORGANIZATION_EMPLOYEE) {
    if (user.organization_id && project.organization_id === user.organization_id) {
      return true
    }

    // program A fallback (как на бэке)
    return project.program_type === 1
  }

  // student → только через команду
  if (user.role === ROLES.STUDENT) {
    return project.team?.users?.some((u: any) => u.id === user.id)
  }

  return false
}

export const canCreateProject = (user: any) => {
  if (!user) return false

  return [
    ROLES.ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.ORGANIZATION_EMPLOYEE,
    ROLES.NTI_EMPLOYEE,
  ].includes(user.role)
}

export const canEditProject = (user: any, project: any) => {
  if (!user || !project) return false

  if (user.role === ROLES.ADMIN) return true
  if (user.role === ROLES.NTI_EMPLOYEE) return true

  if (
    (user.role === ROLES.ORGANIZATION_ADMIN || user.role === ROLES.ORGANIZATION_EMPLOYEE) &&
    user.organization_id === project.organization_id
  ) {
    return true
  }

  return false
}

export const canDeleteProject = (user: any, project: any) => {
  if (!user || !project) return false

  if (user.role === ROLES.ADMIN) return true

  return [ROLES.ORGANIZATION_ADMIN, ROLES.ORGANIZATION_EMPLOYEE].includes(user.role)
}
