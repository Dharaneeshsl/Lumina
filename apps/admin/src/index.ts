/**
 * Lumina Admin Dashboard client.
 * Framework-free typed client so the admin app stays deployable in the
 * existing Bun workspace while sharing the authenticated API contract.
 */
export type AdminRole = 'SUPER_ADMIN' | 'COLLEGE_ADMIN'

export type AdminSection =
  | 'overview'
  | 'users'
  | 'colleges'
  | 'roles'
  | 'verification'
  | 'moderation'
  | 'clubs'
  | 'events'
  | 'internships'
  | 'notifications'
  | 'analytics'
  | 'audit'
  | 'settings'
  | 'exports'

export const ADMIN_FEATURES: readonly AdminSection[] = [
  'overview',
  'users',
  'colleges',
  'roles',
  'verification',
  'moderation',
  'clubs',
  'events',
  'internships',
  'notifications',
  'analytics',
  'audit',
  'settings',
  'exports',
] as const

export interface AdminSession {
  userId: string
  role: AdminRole
  collegeId?: string
}

export class AdminApi {
  constructor(
    private readonly baseUrl: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      credentials: 'include',
      headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
      ...init,
    })
    if (!response.ok) throw new Error(`ADMIN_API_ERROR:${response.status}`)
    return response.json() as Promise<T>
  }

  metrics() {
    return this.request('/admin/metrics')
  }

  analytics(query = '') {
    return this.request('/analytics/dashboard' + (query ? `?${query}` : ''))
  }

  analyticsExport(query = '') {
    return this.request('/analytics/export' + (query ? `?${query}` : ''))
  }

  trackAnalytics(body: unknown) {
    return this.request('/analytics/events', { method: 'POST', body: JSON.stringify(body) })
  }

  analyticsPrivacy(userId: string, action: 'EXPORT' | 'DELETE' | 'ANONYMIZE') {
    return this.request(`/analytics/privacy/${userId}`, { method: 'POST', body: JSON.stringify({ action }) })
  }

  users(query = '') {
    return this.request('/admin/users' + (query ? `?${query}` : ''))
  }

  updateUser(userId: string, body: unknown) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  verificationQueue() {
    return this.request('/admin/verifications')
  }

  reportsQueue() {
    return this.request('/admin/reports')
  }

  moderate(body: unknown) {
    return this.request('/admin/moderation', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  auditLogs(query = '') {
    return this.request('/admin/audit-logs' + (query ? `?${query}` : ''))
  }

  settings() {
    return this.request('/admin/settings')
  }

  updateSetting(body: unknown) {
    return this.request('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  announcements() {
    return this.request('/admin/announcements')
  }

  announce(body: unknown) {
    return this.request('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

/** Permission gate used by every privileged screen/action. */
export function canAccess(
  session: AdminSession,
  section: AdminSection,
): boolean {
  if (session.role === 'SUPER_ADMIN') return true

  return !(
    ['colleges', 'roles', 'settings', 'exports'] as AdminSection[]
  ).includes(section)
}

/** Dashboard state deliberately contains loading/error/empty states for UI adapters. */
export interface ResourceState<T> {
  status: 'idle' | 'loading' | 'ready' | 'empty' | 'error'
  data: T | null
  error?: string
}

export const adminApp = {
  name: 'admin' as const,
  features: ADMIN_FEATURES,
  createApi(baseUrl: string) {
    return new AdminApi(baseUrl)
  },
  canAccess,
}
