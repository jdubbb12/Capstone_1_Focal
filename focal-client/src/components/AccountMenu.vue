<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../stores/auth'
import { errorMessage } from '../lib/api'
const { user } = auth
const router = useRouter()
const busy = ref(false)
const error = ref('')
async function logout() {
  if (busy.value) return
  busy.value = true; error.value = ''
  try { await auth.logout(); await router.replace({ name: 'Login', query: { reason: 'logout' } }) }
  catch (failure) { error.value = errorMessage(failure) }
  finally { busy.value = false }
}
</script>
<template>
  <div class="account-menu">
    <div class="dropdown">
      <button class="btn dropdown-toggle text-nowrap d-inline-flex align-items-center gap-2" type="button"
        data-bs-toggle="dropdown" data-testid="account-menu" aria-expanded="false" aria-label="Account menu">
        <i class="far fa-user" aria-hidden="true"></i> @{{ user?.username }}
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><RouterLink class="dropdown-item" :to="{ name: 'CreatorProfile' }">My Profile</RouterLink></li>
        <li><RouterLink class="dropdown-item" :to="{ name: 'EditProfile' }">Edit Profile</RouterLink></li>
        <li><RouterLink class="dropdown-item" :to="{ name: 'BoardManagement' }">Saved Boards (preview)</RouterLink></li>
        <li><hr class="dropdown-divider" /></li>
        <li><button class="dropdown-item" data-testid="logout" type="button" :disabled="busy" @click="logout">{{ busy ? 'Logging out…' : 'Log Out' }}</button></li>
      </ul>
    </div>
    <p v-if="error" class="text-danger small" role="alert">{{ error }}</p>
  </div>
</template>
<style scoped>
.account-menu { text-align: left; }
.account-menu > .dropdown > button { color: #465344; border: none; }
</style>
