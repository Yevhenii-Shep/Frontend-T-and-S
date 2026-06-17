import { ROLES } from '@/constants/roles'
import { PROGRAM_TYPE } from '@/constants/project'

export const isAdmin = (user: any) => user?.role === ROLES.ADMIN

export const isNtiEmployee = (user: any) => user?.role === ROLES.NTI_EMPLOYEE

export const isNtiStaff = (user: any) =>
  !!user && [ROLES.ADMIN, ROLES.NTI_EMPLOYEE].includes(user.role)

export const isOrgAdmin = (user: any) => user?.role === ROLES.ORGANIZATION_ADMIN

export const isOrgEmployee = (user: any) => user?.role === ROLES.ORGANIZATION_EMPLOYEE

export const isOrgStaff = (user: any) =>
  !!user &&
  [ROLES.ORGANIZATION_ADMIN, ROLES.ORGANIZATION_EMPLOYEE].includes(user.role) &&
  !!user.organization_id

export const isStudent = (user: any) => user?.role === ROLES.STUDENT

export const sharesProjectOrg = (user: any, project: any) =>
  !!user?.organization_id &&
  !!project?.organization_id &&
  Number(user.organization_id) === Number(project.organization_id)

export const studentBelongsToProjectTeam = (user: any, project: any) =>
  isStudent(user) &&
  !!project?.team_id &&
  !!user?.active_team_id &&
  Number(project.team_id) === Number(user.active_team_id)

/** Org: свой проект или program A без привязки к чужой org. */
export const canOrgAccessProject = (user: any, project: any) => {
  if (!user?.organization_id) return false
  if (sharesProjectOrg(user, project)) return true

  return project.program_type === PROGRAM_TYPE.A
}
