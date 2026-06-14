/** Распаковка Laravel JsonResource ({ data: ... }). */
export function apiData<T = unknown>(response: { data: unknown }): T {
  const body = response.data as Record<string, unknown> | unknown[]

  if (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    return body.data as T
  }

  return body as T
}

/** Список: массив или { data: [...] }. */
export function apiList<T = unknown>(response: { data: unknown }): T[] {
  const body = response.data

  if (Array.isArray(body)) {
    return body as T[]
  }

  if (body && typeof body === 'object' && 'data' in body && Array.isArray((body as { data: unknown }).data)) {
    return (body as { data: T[] }).data
  }

  return []
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function apiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  const e = error as {
    message?: string
    response?: { data?: { message?: string; errors?: Record<string, string[]> } }
  }

  if (e?.response?.data?.message) {
    return e.response.data.message
  }

  const errors = e?.response?.data?.errors
  if (errors) {
    const first = Object.values(errors)[0]
    if (first?.[0]) {
      return first[0]
    }
  }

  return e?.message || fallback
}
