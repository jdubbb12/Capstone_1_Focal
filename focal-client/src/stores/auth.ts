import { computed, ref } from 'vue'
import { apiRequest, ApiError, errorMessage } from '../lib/api'
import type { ProfileInput, SignupInput, User } from '../lib/types'

export function createAuthStore(request = apiRequest) {
  const user = ref<User | null>(null)
  const initialized = ref(false)
  const connectionError = ref('')
  const signedOutReason = ref('')
  let restoring: Promise<void> | null = null
  let revision = 0
  let authEpoch = 0
  function accept(value: User) {
    revision++; user.value = value; initialized.value = true; connectionError.value = ''; signedOutReason.value = ''
  }
  function clear(reason: string) {
    authEpoch++; revision++; user.value = null; initialized.value = true; connectionError.value = ''; signedOutReason.value = reason
  }
  async function restore(force = false) {
    if (restoring) return restoring
    if (initialized.value && !force) return
    const expected = revision
    restoring = (async () => {
      try {
        const result = await request<{ user: User }>('/auth/me')
        if (revision === expected) accept(result.user)
      } catch (error) {
        if (revision !== expected) return
        if (error instanceof ApiError && error.status === 401 && error.code === 'UNAUTHORIZED') clear(user.value ? 'expired' : '')
        else { connectionError.value = errorMessage(error); throw error }
      } finally { restoring = null }
    })()
    return restoring
  }
  return {
    get generation() { return authEpoch },
    user: computed(() => user.value), initialized: computed(() => initialized.value),
    connectionError: computed(() => connectionError.value), signedOutReason: computed(() => signedOutReason.value), restore,
    async login(email: string, password: string) {
      const result = await request<{ user: User }>('/auth/login', { method: 'POST', body: { email, password } })
      authEpoch++; accept(result.user)
    },
    async signup(data: SignupInput) {
      const result = await request<{ user: User }>('/auth/signup', { method: 'POST', body: data })
      authEpoch++; accept(result.user)
    },
    async logout() {
      try { await request<void>('/auth/logout', { method: 'POST' }) }
      catch (error) { if (!(error instanceof ApiError && error.code === 'UNAUTHORIZED')) throw error }
      clear('logout')
    },
    async updateProfile(data: ProfileInput) {
      const expectedEpoch = authEpoch
      const result = await request<{ user: User }>('/users/me', { method: 'PATCH', body: data })
      if (expectedEpoch === authEpoch) {
        if (data.email !== undefined) clear('credentials-changed')
        else {
          // Full response snapshots may predate another independently saved field.
          const updated = { ...(user.value ?? result.user), updated_at: result.user.updated_at }
          for (const field of ['first_name', 'last_name', 'username', 'bio', 'creative_role'] as const) {
            if (data[field] !== undefined) Object.assign(updated, { [field]: result.user[field] })
          }
          accept(updated)
        }
      }
      return result.user
    },
    async updateInterests(ids: number[]) {
      const expectedEpoch = authEpoch
      const result = await request<{ user: User }>('/users/me/interests', { method: 'PUT', body: { interest_ids: ids } })
      if (expectedEpoch === authEpoch) accept({ ...(user.value ?? result.user), interests: result.user.interests })
    },
    async changePassword(current: string, next: string) {
      await request<void>('/users/me/password', { method: 'PUT', body: { current_password: current, new_password: next } })
      clear('credentials-changed')
    },
    invalidate() { clear(user.value ? 'expired' : '') },
  }
}
export const auth = createAuthStore()
