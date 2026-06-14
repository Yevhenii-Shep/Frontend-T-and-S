export const PROJECT_STATUS = {
  PENDING: 0,
  ACTIVE: 1,
  DONE: 2,
  INACTIVE: 3,
} as const

export const PROJECT_STATUS_LABELS: Record<number, string> = {
  0: 'Pending',
  1: 'Active',
  2: 'Done',
  3: 'Inactive',
}

export const PROGRAM_TYPE = {
  A: 1,
  B: 2,
} as const

export const PROGRAM_TYPE_LABELS: Record<number, string> = {
  1: 'Grant / Financing (A)',
  2: 'Living practice / People (B)',
}

export const MILESTONE_STATUS_LABELS: Record<number, string> = {
  0: 'Pending',
  1: 'In progress',
  2: 'Done',
  3: 'Failed',
}

export const AUDIT_RESULT_LABELS: Record<number, string> = {
  1: 'Accepted',
  2: 'Declined',
}
