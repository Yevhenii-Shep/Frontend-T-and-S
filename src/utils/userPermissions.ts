import { ROLES } from '@/constants/roles'

export const canViewUsers = (user: any) => {
  if (!user) return false

  return [ROLES.ADMIN, ROLES.NTI_EMPLOYEE].includes(user.role)
}

export const canCreateUser = (user: any) => {
  if (!user) return false

  if (user.role === ROLES.ADMIN) return true

  if (user.role === ROLES.NTI_EMPLOYEE) return true

  if (user.role === ROLES.ORGANIZATION_ADMIN) return true

  return false
}

export const canEditUser = (actor: any, target: any) => {
  if (!actor || !target) return false

  if (actor.role === ROLES.ADMIN) return true

  if (actor.role === ROLES.NTI_EMPLOYEE) return true

  // org admin может редактировать только свою организацию
  if (actor.role === ROLES.ORGANIZATION_ADMIN) {
    return actor.organization_id === target.organization_id
  }

  // пользователь может редактировать себя
  return actor.id === target.id
}

export const canDeleteUser = (actor: any, target: any) => {
  if (!actor || !target) return false

  if (actor.role === ROLES.ADMIN) return true

  if (actor.role === ROLES.NTI_EMPLOYEE) return true

  if (actor.role === ROLES.ORGANIZATION_ADMIN) {
    return actor.organization_id === target.organization_id
  }

  return false
}

export const canViewUser = (actor: any, target: any) => {
  if (!actor || !target) return false

  if (actor.role === ROLES.ADMIN || actor.role === ROLES.NTI_EMPLOYEE) return true

  if (actor.role === ROLES.ORGANIZATION_ADMIN) {
    return actor.organization_id === target.organization_id
  }

  return actor.id === target.id
}
