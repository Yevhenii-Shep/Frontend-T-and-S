import { ROLES } from '@/constants/roles'
import { PROGRAM_TYPE } from '@/constants/project'

const PROJECT_STATUS_INACTIVE = 3
const PROJECT_STATUS_PENDING = 0
const AUDIT_RESULT_ACCEPTED = 1
const AUDIT_RESULT_DECLINED = 2

// --- Просмотр и создание проекта ---

export const canViewProject = (user: any, project: any) => {
  if (!user || !project) return false

  if (project.status === PROJECT_STATUS_INACTIVE) {
    return user.role === ROLES.ADMIN || user.role === ROLES.NTI_EMPLOYEE
  }

  if (user.role === ROLES.ADMIN) return true
  if (user.role === ROLES.NTI_EMPLOYEE) return true

  if (user.role === ROLES.ORGANIZATION_ADMIN || user.role === ROLES.ORGANIZATION_EMPLOYEE) {
    if (user.organization_id && project.organization_id === user.organization_id) {
      return true
    }

    return project.program_type === 1
  }

  if (user.role === ROLES.STUDENT) {
    return true
  }

  return false
}

export const canCreateProject = (user: any) => {
  if (!user) return false

  if (user.role === ROLES.STUDENT) {
    return user.has_active_team
  }

  if (user.role === ROLES.ORGANIZATION_EMPLOYEE) {
    return !!user.organization_id
  }

  return [ROLES.ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.NTI_EMPLOYEE].includes(user.role)
}

export const creatableProgramTypes = (user: any): number[] => {
  if (!user) return []

  if (user.role === ROLES.STUDENT) return [1]

  if (
    [ROLES.NTI_EMPLOYEE, ROLES.ORGANIZATION_ADMIN, ROLES.ORGANIZATION_EMPLOYEE].includes(user.role)
  ) {
    return [2]
  }

  return [1, 2]
}

// --- Изменение проекта и назначения ---

export const canWriteProject = (user: any, project: any) => {
  if (!user || !project) return false

  if (user.role === ROLES.ADMIN) return true
  if (user.role === ROLES.NTI_EMPLOYEE) return true

  if (user.role === ROLES.ORGANIZATION_ADMIN || user.role === ROLES.ORGANIZATION_EMPLOYEE) {
    return user.organization_id && project.organization_id === user.organization_id
  }

  return false
}

export const canEditProjectBaseInfo = (user: any, project: any) => {
  if (!user || !project) return false

  if (user.role === ROLES.ADMIN) return true
  if (user.role === ROLES.NTI_EMPLOYEE) return true

  if (user.role === ROLES.ORGANIZATION_ADMIN || user.role === ROLES.ORGANIZATION_EMPLOYEE) {
    return user.organization_id && project.organization_id === user.organization_id
  }

  if (user.role === ROLES.STUDENT) {
    return user.active_team_id === project.team_id
  }

  return false
}

export const canDeleteProject = (user: any, project: any) => {
  if (!user || !project) return false

  if (user.role === ROLES.ADMIN) return true

  if (user.role === ROLES.ORGANIZATION_ADMIN || user.role === ROLES.ORGANIZATION_EMPLOYEE) {
    return canWriteProject(user, project)
  }

  return false
}

export const canUpdateStatusOrDeadline = (user: any, project: any) => {
  if (!user || !project) return false

  if (user.role === ROLES.ADMIN) return true

  return project.mentor_from_nti === user.id
}

export const canAdminAssignRelations = (user: any) => user?.role === ROLES.ADMIN

/** Program B: admin и NTI могут назначать и менять команду проекта. */
export const canAssignTeamToProject = (user: any, project: any) => {
  if (!user || !project) return false
  if (project.program_type !== PROGRAM_TYPE.B) return false

  return [ROLES.ADMIN, ROLES.NTI_EMPLOYEE].includes(user.role)
}

export const canAssignOrganizationToProject = (user: any, project: any) => {
  if (!user || !project) return false

  if (user.role === ROLES.ADMIN) return true

  if (user.role === ROLES.ORGANIZATION_ADMIN || user.role === ROLES.ORGANIZATION_EMPLOYEE) {
    if (!user.organization_id) return false

    if (project.organization_id && project.organization_id !== user.organization_id) {
      return false
    }

    if (project.organization_id === user.organization_id) {
      return true
    }

    return project.program_type === 1
  }

  return false
}

/** Org видит блок назначения org на pending-проекте с доступом. */
export const canOrgViewProjectAssignmentSection = (user: any, project: any) =>
  isOrgRole(user) &&
  !!project &&
  project.status === PROJECT_STATUS_PENDING &&
  canAssignOrganizationToProject(user, project)

export const canAssignNtiMentor = (user: any) => {
  if (!user) return false

  return [ROLES.ADMIN, ROLES.NTI_EMPLOYEE].includes(user.role)
}

export const canAssignOrganizationMentor = (user: any, project: any) => {
  if (!user || !project) return false

  if (user.role === ROLES.ADMIN) return true

  return (
    user.role === ROLES.ORGANIZATION_ADMIN &&
    user.organization_id &&
    project.organization_id === user.organization_id
  )
}

/** Назначить аудит: admin или сотрудник NTI. */
export const canScheduleProjectAudit = (user: any, _project?: any) => {
  if (!user) return false

  return [ROLES.ADMIN, ROLES.NTI_EMPLOYEE].includes(user.role)
}

// --- Аудит и решение org после аудита ---

/** ID главного аудитора из ответа API (main_auditor_id или вложенный main_auditor). */
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

/** Главный аудитор выставляет итог после завершения аудита. */
export const canSetAuditResult = (user: any, audit: any) => {
  if (!user || !audit) return false

  if (user.role === ROLES.ADMIN) return true

  const auditorId = getAuditMainAuditorId(audit)

  return auditorId !== null && auditorId === Number(user.id)
}

/** Завершённый аудит с итогом. */
export const getCompletedAudit = (project: any) => {
  if (!project?.audit_events?.length) return null

  const now = Date.now()

  return (
    project.audit_events.find((audit: any) => {
      if (!audit.result || !audit.end_time) return false

      return (audit.status = AUDIT_RESULT_ACCEPTED)
      // return new Date(audit.end_time).getTime() <= now
    }) ?? null
  )
}

/** Org может принять/отклонить проект после итога аудита. */
export const canOrgDecideProjectAfterAudit = (user: any, project: any) => {
  if (!isOrgRole(user) || !project) return false
  if (!canAssignOrganizationToProject(user, project)) return false
  if (project.status !== PROJECT_STATUS_PENDING) return false

  return !!getCompletedAudit(project)
}

/** Принять проект: аудит Accepted, проект Pending → Active. */
export const canOrgAcceptProjectAfterAudit = (user: any, project: any) => {
  const audit = getCompletedAudit(project)

  return (
    canOrgDecideProjectAfterAudit(user, project) &&
    audit &&
    Number(audit.result) === AUDIT_RESULT_ACCEPTED
  )
}

/** Загрузка и удаление документов: staff или студент команды проекта. */
export const canManageProjectDocuments = (user: any, project: any) => {
  if (!user || !project) return false

  if (canWriteProject(user, project)) return true

  if (user.role === ROLES.STUDENT && project.team_id && user.active_team_id) {
    return Number(project.team_id) === Number(user.active_team_id)
  }

  return false
}

export const isOrgRole = (user: any) =>
  user &&
  [ROLES.ORGANIZATION_ADMIN, ROLES.ORGANIZATION_EMPLOYEE].includes(user.role) &&
  user.organization_id
