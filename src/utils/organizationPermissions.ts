import { ROLES } from '@/constants/roles'

export const canCreateOrganization = (user: any) => {
  if (!user) return false

  if (user.role === ROLES.ADMIN) return true

  if (user.role === ROLES.ORGANIZATION_ADMIN) {
    return user.organization_id === null
  }

  return false
}

export const canEditOrganization = (user: any, organization: any) => {
  if (!user || !organization) return false

  if (user.role === ROLES.ADMIN) return true

  if (user.role === ROLES.ORGANIZATION_ADMIN) {
    return user.organization_id === organization.id
  }

  return false
}

export const canChangeOrganizationAdmin = (user: any) => {
  if (!user) return false

  return user.role === ROLES.ADMIN
}

export const canDeleteOrganization = (user: any, organization: any) => {
  if (!user || !organization) return false

  if (user.role === ROLES.ADMIN) return true

  return user.role === ROLES.ORGANIZATION_ADMIN && user.organization_id === organization.id
}
