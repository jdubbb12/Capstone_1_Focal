import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ signup: vi.fn(), replace: vi.fn() }))
vi.mock('../stores/auth', () => ({ auth: { signup: mocks.signup } }))
vi.mock('vue-router', () => ({ useRouter: () => ({ replace: mocks.replace }), useRoute: () => ({ query: {} }) }))
import Signup from './Signup.vue'
beforeEach(() => { vi.clearAllMocks() })
const mountPage = () => mount(Signup, { global: { stubs: ['RouterLink'] } })
async function fill(wrapper: ReturnType<typeof mountPage>) {
  for (const [selector,value] of Object.entries({ '#signup-first-name':'Example', '#signup-last-name':'Artist', '#signup-username':'New_Artist', '#signup-email':'ARTIST@example.com', '#signup-password':'a test-only passphrase' })) await wrapper.get(selector).setValue(value)
}
describe('signup form', () => {
  it('submits all required account fields and navigates only after success', async () => {
    const wrapper = mountPage(); await fill(wrapper)
    await wrapper.get('form').trigger('submit'); await flushPromises()
    expect(mocks.signup).toHaveBeenCalledWith({ first_name:'Example', last_name:'Artist', username:'new_artist', email:'artist@example.com', password:'a test-only passphrase', creative_role:'other' })
    expect(mocks.replace).toHaveBeenCalledWith('/profile')
  })
  it('displays server conflicts without navigating or retaining the password', async () => {
    mocks.signup.mockRejectedValueOnce(new Error('Email or username is already in use.'))
    const wrapper = mountPage(); await fill(wrapper)
    await wrapper.get('form').trigger('submit'); await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('already in use')
    expect(mocks.replace).not.toHaveBeenCalled()
    expect((wrapper.get('#signup-password').element as HTMLInputElement).value).toBe('')
  })
  it('does not send invalid or incomplete accounts to the server', async () => {
    const wrapper = mountPage()
    await wrapper.get('form').trigger('submit'); await flushPromises()
    expect(mocks.signup).not.toHaveBeenCalled()
    expect(wrapper.get('[role="alert"]').text()).toContain('required')
  })
})
