export const ROLES = {
  ADMIN: 1,
  STUDENT: 2,
  ORGANIZATION_EMPLOYEE: 3,
  ORGANIZATION_ADMIN: 4,
  NTI_EMPLOYEE: 5,
} as const

export const ROLE_LABELS: Record<number, string> = {
  1: 'Admin',
  2: 'Student',
  3: 'Organization Employee',
  4: 'Organization Admin',
  5: 'NTI Employee',
}
