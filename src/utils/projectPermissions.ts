import { PROGRAM_TYPE } from '@/constants/project'
import {
  canOrgAccessProject,
  isAdmin,
  isNtiEmployee,
  isNtiStaff,
  isOrgAdmin,
  isOrgEmployee,
  isOrgStaff,
  isStudent,
  sharesProjectOrg,
  studentBelongsToProjectTeam,
} from '@/utils/permissionRoleHelpers'

const PROJECT_STATUS_INACTIVE = 3
const PROJECT_STATUS_PENDING = 0
const AUDIT_RESULT_ACCEPTED = 1

export const canViewProject = (user: any, project: any) => {
  if (!user || !project) return false

  if (project.status === PROJECT_STATUS_INACTIVE) {
    return isNtiStaff(user)
  }

  if (isNtiStaff(user)) return true
  if (isOrgStaff(user)) return canOrgAccessProject(user, project)

  return isStudent(user)
}

export const canCreateProject = (user: any) => {
  if (!user) return false
  if (isStudent(user)) return user.has_active_team
  if (isOrgEmployee(user)) return !!user.organization_id

  return isNtiStaff(user) || isOrgAdmin(user)
}

export const creatableProgramTypes = (user: any): number[] => {
  if (!user) return []
  if (isStudent(user)) return [PROGRAM_TYPE.A]
  if (isOrgStaff(user) || isNtiEmployee(user)) return [PROGRAM_TYPE.B]

  return [PROGRAM_TYPE.A, PROGRAM_TYPE.B]
}

export const canWriteProject = (user: any, project: any) => {
  if (!user || !project) return false
  if (isNtiStaff(user)) return true

  return isOrgStaff(user) && sharesProjectOrg(user, project)
}

export const canEditProjectBaseInfo = (user: any, project: any) =>
  !!user &&
  !!project &&
  (canWriteProject(user, project) || studentBelongsToProjectTeam(user, project))

export const canDeleteProject = (user: any, project: any) =>
  !!user && !!project && (isAdmin(user) || canWriteProject(user, project))

export const canUpdateStatusOrDeadline = (user: any, project: any) =>
  !!user && !!project && (isAdmin(user) || project.mentor_from_nti === user.id)

export const canAssignTeamToProject = (user: any, project: any) =>
  !!user && !!project && project.program_type === PROGRAM_TYPE.B && isNtiStaff(user)

export const canAssignOrganizationToProject = (user: any, project: any) => {
  if (!user || !project) return false
  if (isAdmin(user)) return true
  if (!isOrgStaff(user) || !canOrgAccessProject(user, project)) return false

  return !project.organization_id || sharesProjectOrg(user, project)
}

export const canOrgViewProjectAssignmentSection = (user: any, project: any) =>
  isOrgStaff(user) &&
  !!project &&
  project.status === PROJECT_STATUS_PENDING &&
  canAssignOrganizationToProject(user, project)

export const canAssignOrganizationMentor = (user: any, project: any) =>
  !!user &&
  !!project &&
  (isAdmin(user) || (isOrgAdmin(user) && sharesProjectOrg(user, project)))

export const getAuditMainAuditorId = (audit: any): number | null => {
  if (!audit) return null

  if (audit.main_auditor_id != null) {
    return Number(audit.main_auditor_id)
  }

  if (
    audit.main_auditor &&
    typeof audit.main_auditor === 'object' &&
    audit.main_auditor.id != null
  ) {
    return Number(audit.main_auditor.id)
  }

  if (audit.main_auditor != null && typeof audit.main_auditor !== 'object') {
    return Number(audit.main_auditor)
  }

  return null
}

export const canSetAuditResult = (user: any, audit: any) => {
  if (!user || !audit) return false
  if (isAdmin(user)) return true

  const auditorId = getAuditMainAuditorId(audit)

  return auditorId !== null && auditorId === Number(user.id)
}

const getCompletedAudit = (project: any) => {
  if (!project?.audit_events?.length) return null

  return (
    project.audit_events.find((audit: any) => {
      if (!audit.result || !audit.end_time) return false

      return (audit.status = AUDIT_RESULT_ACCEPTED)
      // return new Date(audit.end_time).getTime() <= Date.now()
    }) ?? null
  )
}

const canOrgDecideProjectAfterAudit = (user: any, project: any) =>
  isOrgStaff(user) &&
  !!project &&
  canOrgAccessProject(user, project) &&
  project.status === PROJECT_STATUS_PENDING &&
  !!getCompletedAudit(project)

export const canOrgAcceptProjectAfterAudit = (user: any, project: any) => {
  const audit = getCompletedAudit(project)

  return (
    canOrgDecideProjectAfterAudit(user, project) &&
    audit &&
    Number(audit.result) === AUDIT_RESULT_ACCEPTED
  )
}