import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ logout: vi.fn(), replace: vi.fn() }))
vi.mock('../stores/auth', () => ({ auth: { user: ref({ username: 'real_artist' }), logout: mocks.logout } }))
vi.mock('vue-router', () => ({ useRouter: () => ({ replace: mocks.replace }) }))
import AccountMenu from './AccountMenu.vue'
beforeEach(() => { vi.clearAllMocks() })
describe('account menu', () => {
  it('shows the signed-in username and logs out through the server', async () => {
    const wrapper = mount(AccountMenu, { global: { stubs: ['RouterLink'] } })
    expect(wrapper.text()).toContain('@real_artist')
    await wrapper.get('[data-testid="logout"]').trigger('click'); await flushPromises()
    expect(mocks.logout).toHaveBeenCalledOnce()
    expect(mocks.replace).toHaveBeenCalledWith({ name: 'Login', query: { reason: 'logout' } })
  })
  it('shows logout failures instead of pretending the session was revoked', async () => {
    mocks.logout.mockRejectedValueOnce(new Error('Cannot reach the server.'))
    const wrapper = mount(AccountMenu, { global: { stubs: ['RouterLink'] } })
    await wrapper.get('[data-testid="logout"]').trigger('click'); await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Cannot reach the server.')
    expect(mocks.replace).not.toHaveBeenCalled()
  })
})
