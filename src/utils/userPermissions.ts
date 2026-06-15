import { ROLES } from '@/constants/roles'

export const canViewUsers = (user: any) => {
  if (!user) return false

  return [ROLES.ADMIN, ROLES.NTI_EMPLOYEE].includes(user.role)
}

export const canCreateUser = (user: any) => canViewUsers(user)

export const canDeleteUser = (user: any, target: any) => {
  if (!user || !target) return false

  if (!canCreateUser(user)) return false

  return user.id !== target.id
}

export const canDeleteOwnAccount = (user: any) => !!user

export const canEditUser = (actor: any, target: any) => {
  if (!actor || !target) return false

  if (actor.id === target.id) return true

  if (actor.role === ROLES.ADMIN) return true

  if (actor.role === ROLES.NTI_EMPLOYEE) {
    return ![ROLES.ADMIN, ROLES.NTI_EMPLOYEE].includes(target.role)
  }

  return false
}

export const canViewUser = (actor: any, target: any) => {
  if (!actor || !target) return false

  if (actor.role === ROLES.ADMIN || actor.role === ROLES.NTI_EMPLOYEE) return true

  if (actor.id === target.id) return true

  if (actor.role === ROLES.ORGANIZATION_ADMIN || actor.role === ROLES.ORGANIZATION_EMPLOYEE) {
    if ([ROLES.ADMIN, ROLES.NTI_EMPLOYEE].includes(target.role)) {
      return false
    }

    if (target.organization_id && actor.organization_id === target.organization_id) {
      return true
    }

    return target.role === ROLES.STUDENT
  }

  return false
}

export const canManageSubjectGrades = (user: any) => canViewUsers(user)

export const canViewStudentSubjects = (actor: any, target: any) => {
  if (!actor || !target || target.role !== ROLES.STUDENT) return false

  if (canManageSubjectGrades(actor)) return true

  if (actor.id === target.id) return true

  if (actor.role === ROLES.ORGANIZATION_ADMIN || actor.role === ROLES.ORGANIZATION_EMPLOYEE) {
    return canViewUser(actor, target)
  }

  return false
}
