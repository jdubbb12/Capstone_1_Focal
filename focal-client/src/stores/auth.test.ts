import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, ApiError, setUnauthorizedHandler } from '../lib/api'
import type { User } from '../lib/types'
import { createAuthStore } from './auth'
export const fixture: User = { user_id: 1, email: 'artist@example.com', username: 'artist', first_name: 'Example', last_name: 'Artist',
  creative_role: '2d_artist', bio: '', interests: [], created_at: '2026-10-31T00:00:00Z', updated_at: '2026-10-31T00:00:00Z' }
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); setUnauthorizedHandler(() => {}) })
describe('cookie-backed auth state', () => {
  it('keeps a new login authenticated when an earlier generation returns UNAUTHORIZED', async () => {
    const auth = createAuthStore()
    setUnauthorizedHandler(() => auth.invalidate(), () => auth.generation)
    const nextUser = { ...fixture, user_id: 2, email: 'next@example.com', username: 'next_artist' }
    let resolveOldResponse!: (response: Response) => void
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ user: fixture })))
      .mockReturnValueOnce(new Promise<Response>(resolve => { resolveOldResponse = resolve }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ user: nextUser })))
    vi.stubGlobal('fetch', fetcher)
    await auth.login(fixture.email, 'fixture')
    const updating = auth.updateProfile({ bio: 'old session' })
    const rejected = expect(updating).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
    await auth.logout()
    await auth.login(nextUser.email, 'fixture')
    resolveOldResponse(new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Sign in.' } }), { status: 401 }))
    await rejected
    expect(auth.user.value).toEqual(nextUser)
    expect(auth.signedOutReason.value).toBe('')
  })
  it('initializes anonymous restore with the generation-aware unauthorized handler', async () => {
    const auth = createAuthStore()
    setUnauthorizedHandler(() => auth.invalidate(), () => auth.generation)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Sign in.' } }), { status: 401 })))
    await auth.restore()
    expect(auth.user.value).toBeNull()
    expect(auth.initialized.value).toBe(true)
    expect(auth.signedOutReason.value).toBe('')
    expect(auth.connectionError.value).toBe('')
  })
  it('expires the current user when UNAUTHORIZED arrives in the same generation', async () => {
    const auth = createAuthStore()
    setUnauthorizedHandler(() => auth.invalidate(), () => auth.generation)
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ user: fixture })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Sign in.' } }), { status: 401 })))
    await auth.login(fixture.email, 'fixture')
    await expect(apiRequest('/users/me/interests')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    expect(auth.user.value).toBeNull()
    expect(auth.signedOutReason.value).toBe('expired')
  })
  it('keeps the current session when credential reauthentication fails', async () => {
    const auth = createAuthStore()
    setUnauthorizedHandler(() => auth.invalidate(), () => auth.generation)
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ user: fixture })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect password.' } }), { status: 401 })))
    await auth.login(fixture.email, 'fixture')
    await expect(auth.updateProfile({ email: 'changed@example.com', current_password: 'incorrect fixture' })).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    expect(auth.user.value).toEqual(fixture)
    expect(auth.signedOutReason.value).toBe('')
  })
  it.each(['profile-first', 'interests-first'] as const)('preserves independently saved fields with overlapping full snapshots (%s)', async order => {
    let resolveProfile!: (value: { user: User }) => void
    let resolveInterests!: (value: { user: User }) => void
    const profileResponse = { ...fixture, username: 'edited_artist', first_name: 'Saved', last_name: 'Name', creative_role: 'architect' as const,
      bio: 'Saved biography', updated_at: '2026-10-31T00:01:00Z' }
    const interestsResponse = { ...fixture, interests: [{ interest_id: 1, name: 'Painting' }] }
    const request = vi.fn().mockResolvedValueOnce({ user: fixture })
      .mockReturnValueOnce(new Promise<{ user: User }>(resolve => { resolveProfile = resolve }))
      .mockReturnValueOnce(new Promise<{ user: User }>(resolve => { resolveInterests = resolve }))
    const auth = createAuthStore(request)
    await auth.login(fixture.email, 'fixture')
    const savingProfile = auth.updateProfile({ username: 'edited_artist', first_name: 'Saved', last_name: 'Name', creative_role: 'architect', bio: 'Saved biography' })
    const savingInterests = auth.updateInterests([1])
    expect(request).toHaveBeenCalledTimes(3)
    if (order === 'profile-first') {
      resolveProfile({ user: profileResponse }); await savingProfile
      resolveInterests({ user: interestsResponse }); await savingInterests
    } else {
      resolveInterests({ user: interestsResponse }); await savingInterests
      resolveProfile({ user: profileResponse }); await savingProfile
    }
    expect(auth.user.value).toEqual({ ...profileResponse, interests: interestsResponse.interests })
    await expect(savingProfile).resolves.toEqual(profileResponse)
    await expect(savingInterests).resolves.toBeUndefined()
  })
  it('never restores a signed-out user from an old interests response', async () => {
    let resolveInterests!: (value: { user: User }) => void
    const request = vi.fn().mockResolvedValueOnce({ user: fixture })
      .mockReturnValueOnce(new Promise<{ user: User }>(resolve => { resolveInterests = resolve }))
      .mockResolvedValueOnce(undefined)
    const auth = createAuthStore(request)
    await auth.login(fixture.email, 'fixture')
    const updating = auth.updateInterests([1])
    await auth.logout()
    resolveInterests({ user: { ...fixture, interests: [{ interest_id: 1, name: 'Painting' }] } })
    await updating
    expect(auth.user.value).toBeNull()
    expect(auth.signedOutReason.value).toBe('logout')
  })
  it('never restores a signed-out user from an old profile response', async () => {
    let resolveUpdate!: (value: { user: User }) => void
    const pending = new Promise<{ user: User }>(resolve => { resolveUpdate = resolve })
    const request = vi.fn().mockResolvedValue({ user: fixture })
    const auth = createAuthStore(request)
    await auth.login(fixture.email, 'test fixture password')
    request.mockReturnValueOnce(pending)
    const updating = auth.updateProfile({ bio: 'late response' })
    request.mockResolvedValueOnce(undefined)
    await auth.logout()
    resolveUpdate({ user: { ...fixture, bio: 'late response' } })
    await updating
    expect(auth.user.value).toBeNull()
    expect(auth.signedOutReason.value).toBe('logout')
  })
  it('never restores a signed-out user from an old session check', async () => {
    let resolveCheck!: (value: { user: User }) => void
    const pending = new Promise<{ user: User }>(resolve => { resolveCheck = resolve })
    const request = vi.fn().mockResolvedValue({ user: fixture })
    const auth = createAuthStore(request)
    await auth.login(fixture.email, 'test fixture password')
    request.mockReturnValueOnce(pending)
    const checking = auth.restore(true)
    request.mockResolvedValueOnce(undefined)
    await auth.logout()
    resolveCheck({ user: fixture }); await checking
    expect(auth.user.value).toBeNull()
  })
  it('restores the user from the server once, without browser storage', async () => {
    const request = vi.fn().mockResolvedValue({ user: fixture })
    const storage = vi.spyOn(Storage.prototype, 'setItem')
    const auth = createAuthStore(request)
    await auth.restore(); await auth.restore()
    expect(auth.user.value).toEqual(fixture)
    expect(request).toHaveBeenCalledOnce()
    expect(request).toHaveBeenCalledWith('/auth/me')
    expect(storage).not.toHaveBeenCalled()
  })
  it('treats missing sessions as signed out but distinguishes server failures', async () => {
    const request = vi.fn().mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Sign in'))
    const auth = createAuthStore(request)
    await auth.restore()
    expect(auth.user.value).toBeNull()
    expect(auth.initialized.value).toBe(true)
    request.mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', 'Cannot reach server'))
    await expect(auth.restore(true)).rejects.toBeInstanceOf(ApiError)
    expect(auth.connectionError.value).toBe('Cannot reach server')
  })
  it('signs in through the server and does not pretend a failed logout succeeded', async () => {
    const request = vi.fn().mockResolvedValue({ user: fixture })
    const auth = createAuthStore(request)
    await auth.login('artist@example.com', 'test fixture password')
    expect(request).toHaveBeenCalledWith('/auth/login', { method: 'POST', body: { email: 'artist@example.com', password: 'test fixture password' } })
    request.mockRejectedValueOnce(new ApiError(0, 'NETWORK_ERROR', 'Offline'))
    await expect(auth.logout()).rejects.toThrow('Offline')
    expect(auth.user.value).toEqual(fixture)
    request.mockResolvedValueOnce(undefined)
    await auth.logout()
    expect(auth.user.value).toBeNull()
    expect(auth.signedOutReason.value).toBe('logout')
  })
  it('updates profile and interests from server responses and clears sessions after credential changes', async () => {
    const updated = { ...fixture, bio: 'Saved on server', interests: [{ interest_id: 1, name: 'Painting' }] }
    const request = vi.fn().mockResolvedValue({ user: updated })
    const auth = createAuthStore(request)
    await auth.updateProfile({ bio: updated.bio })
    expect(auth.user.value?.bio).toBe(updated.bio)
    await auth.updateInterests([1])
    expect(request).toHaveBeenLastCalledWith('/users/me/interests', { method: 'PUT', body: { interest_ids: [1] } })
    expect(auth.user.value?.interests).toEqual(updated.interests)
    await auth.updateProfile({ email: 'new@example.com', current_password: 'fixture' })
    expect(auth.user.value).toBeNull()
    expect(auth.signedOutReason.value).toBe('credentials-changed')
    await auth.login('new@example.com', 'fixture')
    request.mockResolvedValueOnce(undefined)
    await auth.changePassword('fixture', 'new fixture password')
    expect(auth.user.value).toBeNull()
    expect(request).toHaveBeenLastCalledWith('/users/me/password', { method: 'PUT', body: { current_password: 'fixture', new_password: 'new fixture password' } })
  })
})
