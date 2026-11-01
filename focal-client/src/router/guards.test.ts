import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { installAuthGuards } from './guards'
import type { User } from '../lib/types'
const dummy = { template: '<div />' }
function setup(user: User|null = null) {
  const session = { user: ref(user), connectionError: ref(''), signedOutReason: ref(''), restore: vi.fn().mockResolvedValue(undefined) }
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/', name: 'Signup', component: dummy, meta: { guestOnly: true } },
    { path: '/login', name: 'Login', component: dummy, meta: { guestOnly: true } },
    { path: '/profile', name: 'CreatorProfile', component: dummy, meta: { requiresAuth: true } },
    { path: '/edit-profile', name: 'EditProfile', component: dummy, meta: { requiresAuth: true } },
  ] })
  installAuthGuards(router,session)
  return {router, session}
}
describe('session-aware routing', () => {
  it('protects account pages and keeps an internal return path', async () => {
    const { router } = setup(); await router.push('/edit-profile')
    expect(router.currentRoute.value.name).toBe('Login')
    expect(router.currentRoute.value.query.redirect).toBe('/edit-profile')
  })
  it('rechecks cookie sessions on protected navigation', async () => {
    const { router,session } = setup({ username:'artist' } as User); await router.push('/profile')
    expect(router.currentRoute.value.name).toBe('CreatorProfile')
    expect(session.restore).toHaveBeenCalledWith(true)
  })
  it('redirects signed-in users away from login and rejects external redirects', async () => {
    const {router} = setup({username:'artist'} as User)
    await router.push('/login?redirect=https://attacker.example')
    expect(router.currentRoute.value.path).toBe('/profile')
  })
  it('does not enter protected pages or loop redirects when the backend is unavailable', async () => {
    const {router,session} = setup({username:'artist'} as User)
    session.connectionError.value = 'Offline'; session.restore.mockRejectedValue(new Error('Offline'))
    await router.push('/edit-profile')
    expect(router.currentRoute.value.name).toBe('Login')
    expect(router.currentRoute.value.query.reason).toBe('server-unavailable')
  })
})
