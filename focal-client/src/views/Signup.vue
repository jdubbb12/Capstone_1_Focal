<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitted = ref(false)
const signupMessage = ref('')

const emailIsValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
const passwordIsValid = () => password.value.length >= 12

function handleSignup() {
  submitted.value = true
  signupMessage.value = ''

  if (!emailIsValid() || !passwordIsValid()) return

  // UI validation only. Connect this to your authentication backend to create accounts.
  signupMessage.value = 'Form validated. Account creation is not connected yet.'
}
</script>

<template>
  <div class="signup-page">
    <main class="flex-grow-1">
      <div class="container py-4">
        <!-- Logo -->
        <div class="text-center mb-2 pt-1">
          <RouterLink to="/" class="brand" aria-label="Focal home">
            <img
              src="/assets/img/Focal%20Logo.png"
              alt="FOCAL Logo"
              class="signup-logo"
            />
          </RouterLink>
        </div>

        <!-- Signup form -->
        <div class="signup-card mx-auto mt-2">
          <h1 class="headline mb-3">Make room for changes.</h1>
          <p class="subtext mb-4">
            Join Focal to discover artists, receive valuable feedback, and keep the art you love close.
          </p>

          <form novalidate @submit.prevent="handleSignup">
            <!-- Email -->
            <div class="mb-3">
              <label for="signup-email" class="form-label">Email address</label>
              <input
                id="signup-email"
                v-model="email"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': submitted && !emailIsValid() }"
                placeholder="you@example.com"
                autocomplete="email"
                required
              />
              <div class="invalid-feedback">Please enter a valid email address.</div>
            </div>

            <!-- Password -->
            <div class="mb-4">
              <label for="signup-password" class="form-label">Password</label>
              <div class="password-wrap">
                <input
                  id="signup-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': submitted && !passwordIsValid() }"
                  placeholder="Create a password"
                  minlength="12"
                  autocomplete="new-password"
                  required
                />
                <button
                  type="button"
                  class="toggle-pw"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div class="form-hint" :class="{ 'password-error': submitted && !passwordIsValid() }">
                Use at least 12 characters.
              </div>
            </div>

            <!-- Submit -->
            <button type="submit" class="btn btn-focal w-100 d-flex align-items-center justify-content-center gap-2" style="background-color: #a6b793; border-color: #a6b793;">
              Create your account <i class="bi bi-arrow-right"></i>
            </button>
            <p v-if="signupMessage" class="form-hint text-center" role="status">{{ signupMessage }}</p>

            <!-- Legal links: destinations to be connected later -->
            <p class="legal text-center mt-4 mb-4">
              By joining, you agree to our <a href="#">Terms of Service</a> and
              <a href="#">Privacy Policy</a>.
            </p>

            <div class="divider mb-4"><span>or</span></div>

            <!-- Google authentication needs provider integration -->
            <button type="button" class="btn btn-google w-100 d-flex align-items-center justify-content-center gap-2" disabled>
              <i class="bi bi-google"></i> Continue with Google
            </button>

            <p class="login-line text-center mt-4 mb-0">
              Already have an account? <a href="#" class="login-link">Log in</a>
            </p>
          </form>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-5">
      <div class="container-fluid px-4 px-md-5 py-4 d-flex justify-content-between align-items-center">
        <span>&copy; 2026 Focal</span>
        <nav aria-label="Footer navigation">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </nav>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500&display=swap");
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");

.signup-page {
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

    .signup-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--focal-bg);
      color: var(--focal-ink);
      font-family: "Inter", system-ui, sans-serif;
    }

    .signup-logo {
      width: 250px;
      height: auto;
      object-fit: contain;
    }

    .headline {
      font-family: "Cormorant Garamond", serif;
      font-weight: 500;
      font-size: clamp(2.3rem, 5vw, 2.9rem);
      line-height: 1.1;
      color: #3d3d3d;
    }

    .subtext { color: var(--focal-muted); font-size: 0.95rem; line-height: 1.6; }

    .signup-card { max-width: 400px; width: 100%; }

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

    .form-hint { font-size: 0.75rem; color: var(--focal-muted); margin-top: 0.5rem; }

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

    .legal { font-size: 0.75rem; color: var(--focal-muted); }
    .legal a, .login-line a:not(.login-link) {
      color: var(--focal-ink);
      text-decoration: underline;
    }

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

    .login-line { font-size: 0.85rem; color: var(--focal-muted); }
    .login-link { color: var(--focal-green); text-decoration: underline; }
    .login-link:hover { color: var(--focal-pink); }

    .signup-page footer {
      border-top: 1px solid var(--focal-border);
      font-size: 0.75rem;
      color: var(--focal-muted);
    }
    .signup-page footer a { color: var(--focal-muted); text-decoration: none; margin-left: 1.5rem; }
    .signup-page footer a:hover { color: var(--focal-ink); }

    .password-error { color: #b3261e; }

</style>
