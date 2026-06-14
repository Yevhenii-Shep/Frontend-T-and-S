import { ROLES } from '@/constants/roles'

export const isTeamLeader = (team: any, user: any) => {
  return team?.users?.some((u: any) => u.id === user.id && u.pivot?.is_leader)
}

export const isTeamMember = (team: any, user: any) => {
  return team?.users?.some((u: any) => u.id === user.id)
}

export const canCreateTeam = (user: any) => {
  if (!user) return false

  if (user.role === ROLES.ADMIN) return true

  if (user.role === ROLES.STUDENT) {
    return !user.has_active_team
  }

  return false
}

export const canJoinTeam = (user: any) => {
  if (!user) return false

  return user.role === ROLES.STUDENT && user.has_active_team === false
}

export const canManageTeam = (team: any, user: any) => {
  if (!team || !user) return false

  // admin
  if (user.role === ROLES.ADMIN) return true

  // student leader
  if (user.role === ROLES.STUDENT) {
    return isTeamLeader(team, user)
  }

  return false
}

export const canDisbandTeam = (team: any, user: any) => {
  if (!team || !user) return false

  // admin
  if (user.role === ROLES.ADMIN) return true

  // any member
  return isTeamMember(team, user)
}
