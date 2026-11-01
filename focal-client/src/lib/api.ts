export class ApiError extends Error {
  status: number
  code: string
  fields: string[]
  constructor(status: number, code: string, message: string, fields: string[] = []) {
    super(message); this.name = 'ApiError'; this.status = status; this.code = code; this.fields = fields
  }
}
let onUnauthorized = () => {}
let getCurrentGeneration = () => 0
export function setUnauthorizedHandler(handler: () => void, getGeneration: () => number = () => 0) {
  onUnauthorized = handler; getCurrentGeneration = getGeneration
}
export interface ApiOptions { method?: string; body?: unknown }

// Relative requests keep the browser and its HttpOnly cookie on one origin.
// Vite forwards /api to Express in development; deployment needs the same rule.
export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const requestGeneration = getCurrentGeneration()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(`/api${path}`, {
      method: options.method ?? 'GET', credentials: 'include', signal: controller.signal,
      headers: { Accept: 'application/json', ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    })
    if (response.status === 204) return undefined as T
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      const error = payload?.error
      const code = typeof error?.code === 'string' ? error.code : 'SERVER_UNAVAILABLE'
      const message = response.status >= 500 || !error
        ? 'The server is unavailable. Make sure the backend and database are running, then try again.'
        : typeof error.message === 'string' ? error.message : 'The request could not be completed.'
      if (response.status === 401 && code === 'UNAUTHORIZED' && requestGeneration === getCurrentGeneration()) onUnauthorized()
      throw new ApiError(response.status, code, message, Array.isArray(error?.fields) ? error.fields.filter((field: unknown) => typeof field === 'string') : [])
    }
    if (payload === null) throw new ApiError(response.status, 'INVALID_RESPONSE', 'The server returned an unexpected response. Please try again.')
    return payload as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Make sure the backend is running, then try again.')
  } finally { clearTimeout(timeout) }
}
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
