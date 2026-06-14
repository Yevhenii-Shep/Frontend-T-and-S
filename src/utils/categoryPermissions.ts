import { ROLES } from '@/constants/roles'

export const canManageCategories = (user: any) => {
  return user?.role === ROLES.ADMIN
}
