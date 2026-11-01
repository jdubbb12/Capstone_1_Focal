import type { Router } from 'vue-router'
import type { Ref } from 'vue'
import type { User } from '../lib/types'
import { safeReturnPath } from '../lib/navigation'
export interface SessionState { user: Readonly<Ref<User|null>>; connectionError: Readonly<Ref<string>>; signedOutReason: Readonly<Ref<string>>; restore(force?: boolean): Promise<void> }
export function installAuthGuards(router: Router, session: SessionState) {
  router.beforeEach(async to => {
    try { await session.restore(Boolean(to.meta.requiresAuth)) }
    catch {
      if (to.meta.requiresAuth) return { name: 'Login', query: { reason: 'server-unavailable', redirect: to.fullPath } }
      return true
    }
    if (to.meta.requiresAuth && !session.user.value) {
      return { name: 'Login', query: { redirect: to.fullPath, ...(session.signedOutReason.value ? { reason: session.signedOutReason.value } : {}) } }
    }
    if (to.meta.guestOnly && session.user.value && !session.connectionError.value) return safeReturnPath(to.query.redirect)
    return true
  })
}
