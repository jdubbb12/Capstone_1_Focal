<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE = 'http://localhost:3000'
const showPassword = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const password = ref('')
const attempted = ref(false)
const email = ref('')
const validEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
async function submitLogin() {
  attempted.value = true
  errorMessage.value = ''
  if (!validEmail.value || !password.value) return
  submitting.value = true
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), password: password.value })
    })
    const data = await response.json()
    if (!response.ok || !data.token) throw new Error(data.error || 'Login failed.')
    localStorage.setItem('client-credentials', data.token)
    await router.push('/feed')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to log in.'
  } finally { submitting.value = false }
}
</script>

<template>
  <div class="focal-auth-page">
    <main class="flex-grow-1">
      <div class="container py-4">
        <div class="text-center mb-5 pt-1">
          <RouterLink to="/feed" aria-label="Focal home"><img src="/assets/img/Focal%20Logo.png" class="brand-logo" alt="Focal logo" /></RouterLink>
        </div>
        <div class="login-card mx-auto mt-4 mt-md-5">
          <h1 class="headline mb-3">Welcome back.</h1>
          <p class="subtext mb-4">Log in to pick up where you left off with the art you love.</p>
          <form novalidate @submit.prevent="submitLogin">
            <div class="mb-3">
              <label for="login-email" class="form-label text-start w-100">Email address</label>
              <input id="login-email" v-model="email" type="email" class="form-control" :class="{ 'is-invalid': attempted && !validEmail }" placeholder="you@example.com" autocomplete="email" required />
              <div class="invalid-feedback">Please enter a valid email address.</div>
            </div>
            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-baseline">
                <label for="login-password" class="form-label">Password</label>
                <span class="forgot" title="Password reset is not available yet">Forgot password?</span>
              </div>
              <div class="password-wrap">
                <input id="login-password" v-model="password" :type="showPassword ? 'text' : 'password'" class="form-control" :class="{ 'is-invalid': attempted && !password }" placeholder="Enter your password" autocomplete="current-password" required />
                <button type="button" class="toggle-pw" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword"><i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i></button>
              </div>
              <div v-if="attempted && !password" class="invalid-feedback d-block">Please enter your password.</div>
            </div>
            <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
            <button type="submit" class="btn btn-focal w-100 d-flex align-items-center justify-content-center gap-2" :disabled="submitting">{{ submitting ? 'Logging in...' : 'Log in' }} <i class="bi bi-arrow-right"></i></button>
            <div class="divider my-4"><span>or</span></div>
            <button type="button" class="btn btn-google w-100 d-flex align-items-center justify-content-center gap-2" disabled title="Google sign-in is not implemented yet"><i class="bi bi-google"></i> Continue with Google</button>
            <p class="signup-line text-center mt-4 mb-0">New to Focal? <RouterLink to="/signup" class="signup-link">Create an account</RouterLink></p>
          </form>
        </div>
      </div>
    </main>
    <footer class="mt-5">
      <div class="container-fluid px-4 px-md-5 py-4 d-flex justify-content-between align-items-center">
        <span>&copy; 2026 Focal</span><nav><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500&display=swap");
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");

    .focal-auth-page {
      --focal-bg: #f5f5f5;
      --focal-input-bg: #efe7da;
      --focal-ink: #3d3d3d;
      --focal-muted: #6f6f6a;
      --focal-border: #efe7da;
      --focal-green: #76a62a;
      --focal-pink: #ed6a5a;
      --bs-body-font-family: "Inter", system-ui, sans-serif;
      --bs-body-bg: var(--focal-bg);
      --bs-body-color: var(--focal-ink);
    }

    .focal-auth-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--focal-bg);
    }

    .brand-logo {
      display: block;
      width: 150px;
      max-width: 45vw;
      height: auto;
      margin: 0 auto;
    }

    .headline {
      font-family: "Cormorant Garamond", serif;
      font-weight: 500;
      font-size: clamp(2.3rem, 5vw, 2.9rem);
      line-height: 1.1;
    }

    .subtext { color: var(--focal-muted); font-size: 0.95rem; line-height: 1.6; }

    .login-card { max-width: 400px; width: 100%; }

    .form-label { font-size: 0.85rem; font-weight: 500; margin-bottom: 0.5rem; }

    .form-control {
      background: var(--focal-input-bg);
      border: 1px solid var(--focal-border);
      border-radius: 2px;
      height: 50px;
      font-size: 0.9rem;
      padding-inline: 1rem;
    }
    .form-control::placeholder { color: #85857f; }
    .form-control:focus {
      background: var(--focal-input-bg);
      border-color: var(--focal-green);
      box-shadow: 0 0 0 0.2rem rgba(118, 166, 42, 0.2);
    }

    .password-wrap { position: relative; }
    .password-wrap .form-control { padding-right: 3rem; }
    .toggle-pw {
      position: absolute;
      top: 50%;
      right: 0.9rem;
      transform: translateY(-50%);
      border: 0;
      background: none;
      color: var(--focal-muted);
      padding: 0;
      line-height: 1;
    }

    .forgot { font-size: 0.8rem; color: var(--focal-ink); text-decoration: underline; }
    .forgot:hover { color: var(--focal-pink); }

    .btn-focal {
      background: var(--focal-green);
      border: 1px solid var(--focal-green);
      color: #fff;
      height: 50px;
      border-radius: 2px;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .btn-focal:hover, .btn-focal:focus {
      background: var(--focal-pink);
      border-color: var(--focal-pink);
      color: #fff;
    }

    .btn-google {
      background: transparent;
      border: 1px solid var(--focal-border);
      color: var(--focal-ink);
      height: 50px;
      border-radius: 2px;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .btn-google:hover { background: var(--focal-input-bg); border-color: #bdbbb3; color: var(--focal-ink); }

    .divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: var(--focal-muted);
      font-size: 0.75rem;
    }
    .divider::before, .divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--focal-border);
    }

    .signup-line { font-size: 0.85rem; color: var(--focal-muted); }
    .signup-link { color: var(--focal-green); text-decoration: underline; }
    .signup-link:hover { color: var(--focal-pink); }

    footer {
      border-top: 1px solid var(--focal-border);
      font-size: 0.75rem;
      color: var(--focal-muted);
    }
    footer a { color: var(--focal-muted); text-decoration: none; margin-left: 1.5rem; }
    footer a:hover { color: var(--focal-ink); }
  
</style>
