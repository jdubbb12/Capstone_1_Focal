<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '../stores/auth'
import { errorMessage } from '../lib/api'
import { safeReturnPath } from '../lib/navigation'
const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const busy = ref(false)
const error = ref('')
const notice = computed(() => {
  if (route.query.reason === 'credentials-changed') return 'Account credentials updated. Please log in again.'
  if (route.query.reason === 'expired') return 'Your session expired. Please log in again.'
  if (route.query.reason === 'logout') return 'You have been logged out.'
  return ''
})
async function login() {
  if (busy.value) return
  error.value = ''
  if (!email.value.trim() || !password.value) { error.value = 'Email and password are required.'; return }
  busy.value = true
  try {
    await auth.login(email.value.trim().toLowerCase(), password.value)
    await router.replace(safeReturnPath(route.query.redirect))
  } catch (failure) { error.value = errorMessage(failure) }
  finally { password.value = ''; busy.value = false }
}
onUnmounted(() => { password.value = '' })
</script>
<template>
  <main class="login-page">
    <div class="container py-4">
      <RouterLink to="/" aria-label="Focal home"><img class="login-logo" src="../assets/img/logo.png" alt="Focal logo" /></RouterLink>
      <section class="login-card mx-auto text-start">
        <h1>Welcome back.</h1><p class="mb-4">Log in to your Focal account.</p>
        <p v-if="notice" class="alert alert-info" role="status">{{ notice }}</p>
        <form @submit.prevent="login" :aria-busy="busy">
          <fieldset :disabled="busy">
            <div class="mb-3"><label class="form-label" for="login-email">Email address</label><input id="login-email" v-model="email" class="form-control" type="email" autocomplete="email" maxlength="254" required /></div>
            <div class="mb-4"><label class="form-label" for="login-password">Password</label><div class="input-group"><input id="login-password" v-model="password" class="form-control" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" maxlength="128" required /><button type="button" class="btn btn-outline-secondary" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">{{ showPassword ? 'Hide' : 'Show' }}</button></div></div>
            <p v-if="error" class="alert alert-danger" role="alert">{{ error }}</p>
            <button class="btn login-submit w-100" type="submit">{{ busy ? 'Logging in…' : 'Log in' }}</button>
          </fieldset>
        </form>
        <p class="mt-4 text-center">New to Focal? <RouterLink :to="{ name: 'Signup', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">Create an account</RouterLink></p>
      </section>
    </div>
  </main>
</template>
<style scoped>
.login-page { min-height:100vh; width:100%; background:#f5f5f5; color:#3d3d3d; }
.login-logo { width:250px; height:auto; margin-bottom:24px; }
.login-card { max-width:420px; }
h1 { color:#3d3d3d; font-family:Georgia,serif; font-size:2.8rem; }
.form-control { background:#efe7da; border:1px solid #ddd4c5; min-height:50px; }
.login-submit { min-height:50px; background:#465344; color:white; }
.login-submit:hover { background:#354335; color:white; }
a { color:#465344; }
</style>
