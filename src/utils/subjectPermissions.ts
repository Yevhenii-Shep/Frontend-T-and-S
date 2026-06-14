import { ROLES } from '@/constants/roles'

export const canManageSubjects = (user: any) => {
  if (!user) return false

  return [ROLES.ADMIN, ROLES.NTI_EMPLOYEE].includes(user.role)
}

export const canDeleteSubjects = (user: any) => {
  return user?.role === ROLES.ADMIN
}
