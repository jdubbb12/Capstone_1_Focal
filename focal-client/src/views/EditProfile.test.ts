import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { Ref } from 'vue'
import type { User } from '../lib/types'
import { auth } from '../stores/auth'
import { apiRequest } from '../lib/api'
import EditProfile from './EditProfile.vue'

vi.mock('../stores/auth', async () => {
  const { ref } = await import('vue')
  return { auth: { user: ref(null), updateProfile: vi.fn(), updateInterests: vi.fn(), changePassword: vi.fn() } }
})
vi.mock('../lib/api', async (original) => ({ ...await original<typeof import('../lib/api')>(), apiRequest: vi.fn() }))

enableAutoUnmount(afterEach)

const signedIn: User = {
  user_id: 7, email: 'ada@example.com', username: 'ada_artist', first_name: 'Ada', last_name: 'Lovelace',
  bio: 'I make art.', creative_role: '2d_artist', interests: [{ interest_id: 2, name: 'Drawing' }],
  created_at: '2026-01-01', updated_at: '2026-01-01',
}
const user = auth.user as Ref<User | null>
async function render() {
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/edit', name: 'EditProfile', component: EditProfile },
    ...['Login', 'CreatorProfile', 'InspirationFeed', 'BoardManagement'].map(name => ({ path: `/${name}`, name, component: { template: '<div />' } })),
  ] })
  await router.push('/edit')
  const wrapper = mount(EditProfile, { global: { plugins: [router], stubs: { AccountMenu: true } } })
  await flushPromises()
  return { wrapper, router }
}
beforeEach(() => {
  vi.clearAllMocks()
  user.value = structuredClone(signedIn)
  vi.mocked(apiRequest).mockResolvedValue({ interests: [{ interest_id: 2, name: 'Drawing' }, { interest_id: 8, name: 'Architecture' }] })
  vi.mocked(auth.updateProfile).mockResolvedValue(signedIn)
  vi.mocked(auth.updateInterests).mockResolvedValue(undefined)
  vi.mocked(auth.changePassword).mockResolvedValue(undefined)
})

describe('EditProfile', () => {
  it('does not present unimplemented upload and search as live actions', async () => {
    const { wrapper } = await render()
    expect(wrapper.get('button.upload-button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('input[type="search"]').attributes('disabled')).toBeDefined()
  })
  it('also clears unfinished password-change secrets after an email attempt', async () => {
    const { wrapper } = await render()
    await wrapper.get('#current-password').setValue('old-secret')
    await wrapper.get('#new-password').setValue('new-secret-long')
    await wrapper.get('#confirm-password').setValue('new-secret-long')
    await wrapper.get('#email').setValue('invalid')
    await wrapper.get('#email-current-password').setValue('email-secret')
    await wrapper.get('#email-form').trigger('submit')
    await flushPromises()
    for (const id of ['email-current-password', 'current-password', 'new-password', 'confirm-password']) {
      expect((wrapper.get(`#${id}`).element as HTMLInputElement).value).toBe('')
    }
    expect(auth.updateProfile).not.toHaveBeenCalled()
  })

  it('provides native section labels and stable separately validated forms', async () => {
    const { wrapper } = await render()
    for (const section of ['profile', 'interests', 'email', 'password']) {
      const form = wrapper.get(`[data-testid="${section}-form"]`)
      expect(form.element.tagName).toBe('FORM')
      expect((form.element as HTMLFormElement).noValidate).toBe(true)
    }
    for (const [id, label] of [
      ['first-name', 'First name'], ['last-name', 'Last name'], ['username', 'Username'],
      ['bio', 'Bio'], ['creative-role', 'Creative role'], ['email', 'New email address'],
      ['email-current-password', 'Current password'], ['current-password', 'Current password'],
      ['new-password', 'New password'], ['confirm-password', 'Confirm new password'],
    ]) {
      expect(wrapper.get(`label[for="${id}"]`).text()).toBe(label)
    }
  })

  it('rejects more than 50 interests without sending an invalid selection', async () => {
    const interests = Array.from({ length: 51 }, (_, index) => ({ interest_id: index + 1, name: `Interest ${index + 1}` }))
    user.value!.interests = interests.slice(0, 50)
    vi.mocked(apiRequest).mockResolvedValueOnce({ interests })
    const { wrapper } = await render()
    await wrapper.get('#interest-51').setValue(true)
    await wrapper.get('#interests-form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('#interests-form [role="alert"]').text()).toContain('at most 50')
    expect(auth.updateInterests).not.toHaveBeenCalled()
  })

  it('clears all in-memory password refs when leaving the page', async () => {
    const { wrapper } = await render()
    for (const id of ['email-current-password', 'current-password', 'new-password', 'confirm-password']) {
      await wrapper.get(`#${id}`).setValue('secret-not-retained')
    }
    // Retain setup state to verify cleanup after the DOM has been removed.
    const state = (wrapper.vm as unknown as { $: { setupState: Record<string, unknown> } }).$.setupState
    wrapper.unmount()
    for (const key of ['emailPassword', 'currentPassword', 'newPassword', 'confirmPassword']) {
      expect(state[key]).toBe('')
    }
  })

  it('explains that photo uploads are unavailable without offering a fake preview', async () => {
    const { wrapper } = await render()
    expect(wrapper.text()).toContain('Profile photo uploads are not available yet.')
    expect(wrapper.find('input[type="file"]').exists()).toBe(false)
    expect(wrapper.find('img.profile-preview').exists()).toBe(false)
  })

  it('uses the shared account menu instead of a fake username dropdown', async () => {
    const { wrapper } = await render()
    expect(wrapper.find('nav account-menu-stub').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('@username')
  })

  it('prevents duplicate password changes and clears failed passwords for a safe retry', async () => {
    let reject!: (error: Error) => void
    vi.mocked(auth.changePassword).mockImplementationOnce(() => new Promise((_, no) => { reject = no }))
    const { wrapper, router } = await render()
    await wrapper.get('#current-password').setValue('incorrect')
    await wrapper.get('#new-password').setValue('new-secret-long')
    await wrapper.get('#confirm-password').setValue('new-secret-long')
    await wrapper.get('#password-form').trigger('submit')
    expect(wrapper.get('#password-form').attributes('aria-busy')).toBe('true')
    expect((wrapper.get('#password-form button[type="submit"]').element as HTMLButtonElement).disabled).toBe(true)
    await wrapper.get('#password-form').trigger('submit')
    expect(auth.changePassword).toHaveBeenCalledTimes(1)
    reject(new Error('Password change failed'))
    await flushPromises()
    expect(wrapper.get('#password-form [role="alert"]').text()).toContain('Password change failed')
    for (const id of ['current-password', 'new-password', 'confirm-password']) {
      expect((wrapper.get(`#${id}`).element as HTMLInputElement).value).toBe('')
    }
    expect(router.currentRoute.value.name).toBe('EditProfile')
    expect(wrapper.find('#password-form [role="status"]').exists()).toBe(false)
    expect((wrapper.get('#password-form button[type="submit"]').element as HTMLButtonElement).disabled).toBe(false)
  })

  it('rejects invalid password changes and clears every secret after each attempt', async () => {
    const { wrapper, router } = await render()
    for (const [current, next, confirm, message] of [
      ['', 'new-secret-long', 'new-secret-long', 'Current password'],
      ['x'.repeat(129), 'new-secret-long', 'new-secret-long', 'Current password'],
      ['old', 'short', 'short', '12–128'],
      ['old', 'x'.repeat(129), 'x'.repeat(129), '12–128'],
      ['old', 'new-secret-long', 'not-matching', 'match'],
    ]) {
      await wrapper.get('#current-password').setValue(current!)
      await wrapper.get('#new-password').setValue(next!)
      await wrapper.get('#confirm-password').setValue(confirm!)
      await wrapper.get('#password-form').trigger('submit')
      await flushPromises()
      expect(wrapper.get('#password-form [role="alert"]').text()).toContain(message)
      for (const id of ['current-password', 'new-password', 'confirm-password']) {
        expect((wrapper.get(`#${id}`).element as HTMLInputElement).value).toBe('')
      }
    }
    expect(auth.changePassword).not.toHaveBeenCalled()
    expect(router.currentRoute.value.name).toBe('EditProfile')
  })

  it('changes password separately and clears password fields before returning to Login', async () => {
    const { wrapper, router } = await render()
    expect(wrapper.get('#password-form').text()).toContain('all devices')
    await wrapper.get('#current-password').setValue('old-secret')
    await wrapper.get('#new-password').setValue('new-secret-long')
    await wrapper.get('#confirm-password').setValue('new-secret-long')
    await wrapper.get('#password-form').trigger('submit')
    await flushPromises()
    expect(auth.changePassword).toHaveBeenCalledExactlyOnceWith('old-secret', 'new-secret-long')
    expect(auth.updateProfile).not.toHaveBeenCalled()
    expect(router.currentRoute.value.name).toBe('Login')
    expect(router.currentRoute.value.query.reason).toBe('credentials-changed')
    for (const id of ['current-password', 'new-password', 'confirm-password']) {
      expect((wrapper.get(`#${id}`).element as HTMLInputElement).value).toBe('')
    }
  })

  it('disables duplicate email changes, clears failed credentials, and stays on the form', async () => {
    let reject!: (error: Error) => void
    vi.mocked(auth.updateProfile).mockImplementationOnce(() => new Promise((_, no) => { reject = no }))
    const { wrapper, router } = await render()
    await wrapper.get('#email').setValue('next@example.com')
    await wrapper.get('#email-current-password').setValue('wrong-secret')
    await wrapper.get('#email-form').trigger('submit')
    expect(wrapper.get('#email-form').attributes('aria-busy')).toBe('true')
    expect((wrapper.get('#email-form button[type="submit"]').element as HTMLButtonElement).disabled).toBe(true)
    await wrapper.get('#email-form').trigger('submit')
    expect(auth.updateProfile).toHaveBeenCalledTimes(1)
    reject(new Error('Current password is incorrect'))
    await flushPromises()
    expect(wrapper.get('#email-form [role="alert"]').text()).toContain('Current password is incorrect')
    expect((wrapper.get('#email-current-password').element as HTMLInputElement).value).toBe('')
    expect(router.currentRoute.value.name).toBe('EditProfile')
    expect(wrapper.find('#email-form [role="status"]').exists()).toBe(false)
    expect((wrapper.get('#email-form button[type="submit"]').element as HTMLButtonElement).disabled).toBe(false)
  })

  it('validates email changes and clears the password after rejected validation', async () => {
    const { wrapper, router } = await render()
    for (const [nextEmail, password, message] of [
      ['not-an-email', 'current-secret', 'valid email'],
      ['ada@example.com', 'current-secret', 'different email'],
      ['next@example.com', '', 'Current password'],
      ['next@example.com', 'x'.repeat(129), 'Current password'],
    ]) {
      await wrapper.get('#email').setValue(nextEmail!)
      await wrapper.get('#email-current-password').setValue(password!)
      await wrapper.get('#email-form').trigger('submit')
      await flushPromises()
      expect(wrapper.get('#email-form [role="alert"]').text()).toContain(message)
      expect((wrapper.get('#email-current-password').element as HTMLInputElement).value).toBe('')
    }
    expect(auth.updateProfile).not.toHaveBeenCalled()
    expect(router.currentRoute.value.name).toBe('EditProfile')
  })

  it('changes email separately with the current password and redirects after sign-out', async () => {
    const { wrapper, router } = await render()
    expect((wrapper.get('#email').element as HTMLInputElement).value).toBe('ada@example.com')
    expect(wrapper.get('#email-form').text()).toContain('all devices')
    await wrapper.get('#email').setValue('new@example.com')
    await wrapper.get('#email-current-password').setValue('current-secret')
    await wrapper.get('#email-form').trigger('submit')
    await flushPromises()
    expect(auth.updateProfile).toHaveBeenCalledExactlyOnceWith({ email: 'new@example.com', current_password: 'current-secret' })
    expect(auth.updateInterests).not.toHaveBeenCalled()
    expect(router.currentRoute.value.name).toBe('Login')
    expect(router.currentRoute.value.query.reason).toBe('credentials-changed')
    expect((wrapper.get('#email-current-password').element as HTMLInputElement).value).toBe('')
  })

  it('keeps profile success separate when interests fail and permits an interests retry', async () => {
    let reject!: (error: Error) => void
    vi.mocked(auth.updateInterests).mockImplementationOnce(() => new Promise((_, no) => { reject = no }))
    const { wrapper } = await render()
    await wrapper.get('#profile-form').trigger('submit')
    await flushPromises()
    await wrapper.get('#interest-8').setValue(true)
    await wrapper.get('#interests-form').trigger('submit')
    expect(wrapper.get('#interests-form').attributes('aria-busy')).toBe('true')
    expect((wrapper.get('#interests-form button[type="submit"]').element as HTMLButtonElement).disabled).toBe(true)
    await wrapper.get('#interests-form').trigger('submit')
    expect(auth.updateInterests).toHaveBeenCalledTimes(1)
    reject(new Error('Interest save failed'))
    await flushPromises()
    expect(wrapper.get('#interests-form [role="alert"]').text()).toContain('Interest save failed')
    expect(wrapper.find('#interests-form [role="status"]').exists()).toBe(false)
    expect(wrapper.get('#profile-form [role="status"]').text()).toBe('Profile saved.')
    expect((wrapper.get('#interest-8').element as HTMLInputElement).checked).toBe(true)
    await wrapper.get('#interests-form').trigger('submit')
    await flushPromises()
    expect(auth.updateInterests).toHaveBeenLastCalledWith([2, 8])
    expect(wrapper.get('#interests-form [role="status"]').text()).toBe('Interests saved.')
  })

  it('shows a catalog failure and retries loading instead of saving an unknown selection', async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Catalog offline'))
    const { wrapper } = await render()
    expect(wrapper.get('#interests-form [role="alert"]').text()).toContain('Catalog offline')
    expect((wrapper.get('#interests-form button[type="submit"]').element as HTMLButtonElement).disabled).toBe(true)
    await wrapper.get('#interests-form').trigger('submit')
    expect(auth.updateInterests).not.toHaveBeenCalled()
    await wrapper.get('#retry-interests').trigger('click')
    await flushPromises()
    expect(apiRequest).toHaveBeenCalledTimes(2)
    expect(wrapper.find('#interests-form [role="alert"]').exists()).toBe(false)
    expect((wrapper.get('#interest-2').element as HTMLInputElement).checked).toBe(true)
  })

  it('loads the catalog and saves checked interest IDs independently', async () => {
    const { wrapper } = await render()
    expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/interests')
    expect((wrapper.get('#interest-2').element as HTMLInputElement).checked).toBe(true)
    expect(wrapper.get('label[for="interest-8"]').text()).toBe('Architecture')
    await wrapper.get('#interest-2').setValue(false)
    await wrapper.get('#interest-8').setValue(true)
    await wrapper.get('#interests-form').trigger('submit')
    await flushPromises()
    expect(auth.updateInterests).toHaveBeenCalledExactlyOnceWith([8])
    expect(auth.updateProfile).not.toHaveBeenCalled()
    expect(wrapper.get('#interests-form [role="status"]').text()).toBe('Interests saved.')
  })

  it('prevents duplicate profile saves and reports a failed attempt with retry', async () => {
    let reject!: (error: Error) => void
    vi.mocked(auth.updateProfile).mockImplementationOnce(() => new Promise((_, no) => { reject = no }))
    const { wrapper } = await render()
    await wrapper.get('#profile-form').trigger('submit')
    expect(wrapper.get('#profile-form').attributes('aria-busy')).toBe('true')
    expect((wrapper.get('#profile-form button[type="submit"]').element as HTMLButtonElement).disabled).toBe(true)
    await wrapper.get('#profile-form').trigger('submit')
    expect(auth.updateProfile).toHaveBeenCalledTimes(1)
    reject(new Error('Profile connection failed'))
    await flushPromises()
    expect(wrapper.get('#profile-form [role="alert"]').text()).toContain('Profile connection failed')
    expect(wrapper.find('#profile-form [role="status"]').exists()).toBe(false)
    expect((wrapper.get('#profile-form button[type="submit"]').element as HTMLButtonElement).disabled).toBe(false)
    await wrapper.get('#profile-form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('#profile-form [role="alert"]').exists()).toBe(false)
    expect(wrapper.get('#profile-form [role="status"]').text()).toBe('Profile saved.')
  })

  it('blocks invalid profile values before making a request', async () => {
    const { wrapper } = await render()
    for (const [selector, value, message] of [
      ['#first-name', ' ', 'First and last names'],
      ['#first-name', 'a'.repeat(81), 'First and last names'],
      ['#last-name', 'a'.repeat(81), 'First and last names'],
      ['#username', 'Invalid Name!', 'Username'],
      ['#bio', 'a'.repeat(1001), 'Bio'],
    ]) {
      await wrapper.get(selector!).setValue(value!)
      await wrapper.get('#profile-form').trigger('submit')
      expect(wrapper.get('#profile-form [role="alert"]').text()).toContain(message)
      expect(auth.updateProfile).not.toHaveBeenCalled()
      await wrapper.get(selector!).setValue(selector === '#username' ? signedIn.username : selector === '#bio' ? signedIn.bio : 'Ada')
    }
  })

  it('loads the signed-in profile and saves only the profile section', async () => {
    const { wrapper } = await render()
    expect((wrapper.get('#first-name').element as HTMLInputElement).value).toBe('Ada')
    expect((wrapper.get('#last-name').element as HTMLInputElement).value).toBe('Lovelace')
    expect((wrapper.get('#username').element as HTMLInputElement).value).toBe('ada_artist')
    expect((wrapper.get('#bio').element as HTMLTextAreaElement).value).toBe('I make art.')
    expect((wrapper.get('#creative-role').element as HTMLSelectElement).value).toBe('2d_artist')
    await wrapper.get('#first-name').setValue('Augusta')
    await wrapper.get('#profile-form').trigger('submit')
    await flushPromises()
    expect(auth.updateProfile).toHaveBeenCalledExactlyOnceWith({ first_name: 'Augusta', last_name: 'Lovelace', username: 'ada_artist', bio: 'I make art.', creative_role: '2d_artist' })
    expect(auth.updateInterests).not.toHaveBeenCalled()
    expect(wrapper.get('#profile-form [role="status"]').text()).toBe('Profile saved.')
  })
})
