import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ login: vi.fn(), replace: vi.fn() }))
vi.mock('../stores/auth', () => ({ auth: { login: mocks.login } }))
vi.mock('vue-router', () => ({ useRouter: () => ({ replace: mocks.replace }), useRoute: () => ({ query: { redirect: '/edit-profile' } }) }))
import Login from './Login.vue'
beforeEach(() => vi.clearAllMocks())
const mountPage = () => mount(Login, { global: { stubs: ['RouterLink'] } })
describe('login form', () => {
  it('signs in with cookies and returns to the requested internal page', async () => {
    const wrapper = mountPage()
    expect(wrapper.find('#login-email').exists()).toBe(true)
    await wrapper.get('#login-email').setValue('ARTIST@example.com')
    await wrapper.get('#login-password').setValue('test fixture password')
    await wrapper.get('form').trigger('submit'); await flushPromises()
    expect(mocks.login).toHaveBeenCalledWith('artist@example.com', 'test fixture password')
    expect(mocks.replace).toHaveBeenCalledWith('/edit-profile')
  })
  it('shows server login errors without navigating', async () => {
    mocks.login.mockRejectedValueOnce(new Error('Email or password is incorrect.'))
    const wrapper = mountPage()
    expect(wrapper.find('#login-email').exists()).toBe(true)
    await wrapper.get('#login-email').setValue('artist@example.com')
    await wrapper.get('#login-password').setValue('incorrect')
    await wrapper.get('form').trigger('submit'); await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('incorrect')
    expect(mocks.replace).not.toHaveBeenCalled()
    expect((wrapper.get('#login-password').element as HTMLInputElement).value).toBe('')
  })
})
