<script setup lang="ts">
<<<<<<< Updated upstream
    console.log("Loaded page.");
=======
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from './stores/auth'
import { safeReturnPath } from './lib/navigation'
const { user, connectionError } = auth
const route = useRoute()
const router = useRouter()
const retrying = ref(false)
watch(user, (current, previous) => {
  if (previous && !current && auth.signedOutReason.value === 'expired' && route.meta.requiresAuth) {
    void router.replace({ name: 'Login', query: { reason: 'expired', redirect: route.fullPath } })
  }
})
async function retryConnection() {
  retrying.value = true
  try { await auth.restore(true); if (user.value) await router.replace(safeReturnPath(route.query.redirect)) }
  catch { /* The store keeps the actionable connection error visible. */ }
  finally { retrying.value = false }
}
>>>>>>> Stashed changes
</script>
<template>
<<<<<<< Updated upstream
  <RouterView/>
</template>
=======
  <div v-if="connectionError" class="alert alert-warning m-0 rounded-0" role="alert">
    {{ connectionError }} <button class="btn btn-sm btn-outline-dark ms-2" :disabled="retrying" @click="retryConnection">{{ retrying ? 'Checking…' : 'Retry connection' }}</button>
  </div>
  <RouterView />
</template>

>>>>>>> Stashed changes
