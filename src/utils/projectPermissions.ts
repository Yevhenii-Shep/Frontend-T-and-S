import { ROLES } from '@/constants/roles'

const PROJECT_STATUS_INACTIVE = 3

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

  return [
    ROLES.ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.NTI_EMPLOYEE,
  ].includes(user.role)
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

export const canWriteProject = (user: any, project: any) => {
  if (!user || !project) return false

  if (user.role === ROLES.ADMIN) return true
  if (user.role === ROLES.NTI_EMPLOYEE) return true

  if (user.role === ROLES.ORGANIZATION_ADMIN || user.role === ROLES.ORGANIZATION_EMPLOYEE) {
    return user.organization_id && project.organization_id === user.organization_id
  }

  return false
}

export const canEditProject = (user: any, project: any) => canWriteProject(user, project)

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

/** Команда проекта не меняется после создания. */
export const canAssignTeamToProject = () => false

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

export const canModifyProjectChildren = (user: any, project: any) => canWriteProject(user, project)

/** Первый аудит: admin, NTI или org admin. */
export const canScheduleProjectAudit = (user: any, project: any) => {
  if (!user || !project) return false

  if (user.role === ROLES.ADMIN || user.role === ROLES.NTI_EMPLOYEE) {
    return true
  }

  if (user.role === ROLES.ORGANIZATION_ADMIN && user.organization_id) {
    if (project.organization_id && project.organization_id === user.organization_id) {
      return true
    }

    return project.program_type === 1
  }

  return false
}

/** Главный аудитор выставляет итог после завершения аудита. */
export const canSetAuditResult = (user: any, audit: any) => {
  if (!user || !audit) return false

  if (user.role === ROLES.ADMIN) return true

  return audit.main_auditor === user.id
}

/** Загрузка документов: staff или студент команды проекта. */
export const canUploadProjectDocuments = (user: any, project: any) => {
  if (!user || !project) return false

  if (canWriteProject(user, project)) return true

  if (user.role === ROLES.STUDENT && project.team_id && user.active_team_id) {
    return Number(project.team_id) === Number(user.active_team_id)
  }

  return false
}

/** Удаление документов: staff или студент команды проекта. */
export const canDeleteProjectDocuments = (user: any, project: any) => {
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

export const isStudentRole = (user: any) => user?.role === ROLES.STUDENT
