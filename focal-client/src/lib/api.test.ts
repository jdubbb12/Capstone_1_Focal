import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, ApiError, setUnauthorizedHandler } from './api'
afterEach(() => { vi.unstubAllGlobals(); setUnauthorizedHandler(() => {}) })
describe('API transport', () => {
  it('sends JSON via the same-origin /api proxy with cookies', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: { username: 'artist' } }), { status: 200 }))
    vi.stubGlobal('fetch', fetcher)
    expect(await apiRequest('/auth/login', { method: 'POST', body: { email: 'artist@example.com', password: 'fixture-only' } }))
      .toEqual({ user: { username: 'artist' } })
    expect(fetcher).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ credentials: 'include', method: 'POST', body: JSON.stringify({ email: 'artist@example.com', password: 'fixture-only' }) }))
    expect(new Headers(fetcher.mock.calls[0]![1].headers).get('Content-Type')).toBe('application/json')
  })
  it('handles successful empty responses without trying to parse JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    await expect(apiRequest('/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
  })
  it('preserves safe API errors and distinguishes expiration from incorrect credentials', async () => {
    const expired = vi.fn(); setUnauthorizedHandler(expired)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' } }), { status: 401 })))
    await expect(apiRequest('/auth/login')).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' })
    expect(expired).not.toHaveBeenCalled()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Sign in to continue.' } }), { status: 401 })))
    await expect(apiRequest('/auth/me')).rejects.toBeInstanceOf(ApiError)
    expect(expired).toHaveBeenCalledOnce()
  })
  it('does not notify expiration for a request from an earlier authentication generation', async () => {
    let generation = 0
    const expired = vi.fn()
    setUnauthorizedHandler(expired, () => generation)
    let resolveResponse!: (response: Response) => void
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise<Response>(resolve => { resolveResponse = resolve })))
    const pending = apiRequest('/auth/me')
    const rejected = expect(pending).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
    generation++
    resolveResponse(new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Sign in.' } }), { status: 401 }))
    await rejected
    expect(expired).not.toHaveBeenCalled()
  })
  it('converts network and non-JSON proxy failures to actionable errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(apiRequest('/auth/me')).rejects.toMatchObject({ code: 'NETWORK_ERROR', status: 0 })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('upstream crashed', { status: 502 })))
    await expect(apiRequest('/auth/me')).rejects.toMatchObject({ code: 'SERVER_UNAVAILABLE', status: 502 })
  })
})
