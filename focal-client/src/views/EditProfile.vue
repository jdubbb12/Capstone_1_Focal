<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../stores/auth'
import FocalNav from '../components/FocalNav.vue'
import { apiRequest, errorMessage } from '../lib/api'
import type { Interest } from '../lib/types'
import { CREATIVE_ROLES } from '../lib/types'

const router = useRouter()
const { user } = auth
const profile = reactive({
  first_name: user.value?.first_name ?? '', last_name: user.value?.last_name ?? '',
  username: user.value?.username ?? '', bio: user.value?.bio ?? '',
  creative_role: user.value?.creative_role ?? 'other',
})
const profileSaved = ref('')
const profileError = ref('')
const profileBusy = ref(false)
async function saveProfile() {
  if (profileBusy.value) return
  profileSaved.value = ''
  profileError.value = ''
  if (![profile.first_name, profile.last_name].every(name => name.trim().length > 0 && name.length <= 80)) {
    profileError.value = 'First and last names are required and must be at most 80 characters.'
    return
  }
  if (!/^[a-z0-9_]{3,50}$/.test(profile.username)) {
    profileError.value = 'Username must contain 3–50 lowercase letters, digits, or underscores.'
    return
  }
  if (profile.bio.length > 1000) {
    profileError.value = 'Bio must be at most 1000 characters.'
    return
  }
  if (!CREATIVE_ROLES.some(role => role.value === profile.creative_role)) {
    profileError.value = 'Choose a valid creator type.'
    return
  }
  profileBusy.value = true
  try {
    await auth.updateProfile({ ...profile })
    profileSaved.value = 'Profile saved.'
  } catch (error) {
    profileError.value = errorMessage(error)
  } finally {
    profileBusy.value = false
  }
}
const catalog = ref<Interest[]>([])
const selectedInterests = ref<number[]>(user.value?.interests.map(interest => interest.interest_id) ?? [])
const interestsSaved = ref('')
const interestsError = ref('')
const interestsBusy = ref(false)
const catalogError = ref('')
const catalogLoading = ref(false)
const catalogLoaded = ref(false)
async function loadInterests() {
  if (catalogLoading.value) return
  catalogLoading.value = true
  catalogError.value = ''
  try {
    catalog.value = (await apiRequest<{ interests: Interest[] }>('/interests')).interests
    catalogLoaded.value = true
  } catch (error) {
    catalogError.value = errorMessage(error)
  } finally {
    catalogLoading.value = false
  }
}
onMounted(loadInterests)
async function saveInterests() {
  if (!catalogLoaded.value || catalogLoading.value || interestsBusy.value) return
  interestsSaved.value = ''
  interestsError.value = ''
  const ids = [...new Set(selectedInterests.value)]
  if (ids.length > 50 || ids.some(id => !Number.isInteger(id) || !catalog.value.some(interest => interest.interest_id === id))) {
    interestsError.value = 'Choose at most 50 interests from the catalog.'
    return
  }
  interestsBusy.value = true
  try {
    await auth.updateInterests(ids)
    interestsSaved.value = 'Interests saved.'
  } catch (error) {
    interestsError.value = errorMessage(error)
  } finally {
    interestsBusy.value = false
  }
}
const email = ref(user.value?.email ?? '')
const emailPassword = ref('')
const emailError = ref('')
const emailBusy = ref(false)
async function changeEmail() {
  if (emailBusy.value) return
  emailBusy.value = true
  emailError.value = ''
  try {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) || email.value.length > 254) {
      emailError.value = 'Enter a valid email address.'
      return
    }
    if (email.value.toLowerCase() === user.value?.email.toLowerCase()) {
      emailError.value = 'Enter a different email address.'
      return
    }
    if (!emailPassword.value || emailPassword.value.length > 128) {
      emailError.value = 'Current password is required and must be at most 128 characters.'
      return
    }
    await auth.updateProfile({ email: email.value, current_password: emailPassword.value })
    await router.push({ name: 'Login', query: { reason: 'credentials-changed' } })
  } catch (error) {
    emailError.value = errorMessage(error)
  } finally {
    clearPasswords()
    emailBusy.value = false
  }
}
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordBusy = ref(false)
function clearPasswords() {
  emailPassword.value = ''
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}
async function changePassword() {
  if (passwordBusy.value) return
  passwordBusy.value = true
  passwordError.value = ''
  try {
    if (!currentPassword.value || currentPassword.value.length > 128) {
      passwordError.value = 'Current password is required and must be at most 128 characters.'
      return
    }
    if (newPassword.value.length < 12 || newPassword.value.length > 128) {
      passwordError.value = 'New password must contain 12–128 characters.'
      return
    }
    if (newPassword.value !== confirmPassword.value) {
      passwordError.value = 'New passwords must match.'
      return
    }
    await auth.changePassword(currentPassword.value, newPassword.value)
    await router.push({ name: 'Login', query: { reason: 'credentials-changed' } })
  } catch (error) {
    passwordError.value = errorMessage(error)
  } finally {
    clearPasswords()
    passwordBusy.value = false
  }
}
onUnmounted(clearPasswords)
</script>

<template>
  <main class="edit-profile-page">
    <FocalNav />

    <!-- Edit form -->
    <div class="container py-4 py-lg-5">
      <div class="edit-panel mx-auto">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 class="page-title mb-1">Edit Profile</h1>
          </div>
          <RouterLink :to="{ name: 'CreatorProfile' }" class="text-decoration-none back-link">
            <i class="fas fa-arrow-left me-2" aria-hidden="true"></i>Back to Profile
          </RouterLink>
        </div>

        <section class="form-section mb-4">
          <h2 class="section-title">Profile Picture</h2>
          <p class="mb-0">Profile photo uploads are not available yet.</p>
        </section>
        <form id="profile-form" data-testid="profile-form" novalidate :aria-busy="profileBusy" @submit.prevent="saveProfile">
          <section class="form-section mb-4">
            <h2 class="section-title">Basic Information</h2>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label" for="first-name">First name</label>
                <input id="first-name" v-model="profile.first_name" class="form-control" maxlength="80" autocomplete="given-name" required />
              </div>
              <div class="col-md-6">
                <label class="form-label" for="last-name">Last name</label>
                <input id="last-name" v-model="profile.last_name" class="form-control" maxlength="80" autocomplete="family-name" required />
              </div>
              <div class="col-12">
                <label class="form-label" for="username">Username</label>
                <div class="input-group"><span class="input-group-text">@</span><input id="username" v-model="profile.username" class="form-control" minlength="3" maxlength="50" pattern="[a-z0-9_]{3,50}" autocomplete="username" required /></div>
              </div>
              <div class="col-12">
                <label class="form-label" for="bio">Bio</label>
                <textarea id="bio" v-model="profile.bio" class="form-control" rows="4" maxlength="1000" placeholder="Tell other creators about yourself"></textarea>
                <div class="text-muted small text-end mt-1">{{ profile.bio.length }}/1000 characters</div>
              </div>
              <div class="col-12">
                <label class="form-label" for="creative-role">Creative role</label>
                <select id="creative-role" v-model="profile.creative_role" class="form-select"><option v-for="role in CREATIVE_ROLES" :key="role.value" :value="role.value">{{ role.label }}</option></select>
              </div>
            </div>
            <p v-if="profileError" class="alert alert-danger mt-3" role="alert">{{ profileError }}</p>
            <p v-if="profileSaved" class="alert alert-info mt-3" role="status">{{ profileSaved }}</p>
            <div class="d-flex justify-content-end flex-wrap gap-3 mt-3">
              <button type="button" class="btn cancel-button" @click="router.push({ name: 'CreatorProfile' })">Cancel</button>
              <button type="submit" class="btn save-button" :disabled="profileBusy">{{ profileBusy ? 'Saving…' : 'Save Profile' }}</button>
            </div>
          </section>
        </form>
        <form id="interests-form" data-testid="interests-form" novalidate class="form-section mb-4" :aria-busy="catalogLoading || interestsBusy" @submit.prevent="saveInterests">
          <h2 class="section-title">Interests</h2>
          <p v-if="catalogLoading" role="status">Loading interests…</p>
          <div v-if="catalogError" class="alert alert-danger" role="alert">
            {{ catalogError }} <button id="retry-interests" type="button" class="btn cancel-button" @click="loadInterests">Retry loading interests</button>
          </div>
          <div v-for="interest in catalog" :key="interest.interest_id" class="form-check">
            <input :id="`interest-${interest.interest_id}`" v-model="selectedInterests" :value="interest.interest_id" type="checkbox" class="form-check-input" />
            <label :for="`interest-${interest.interest_id}`" class="form-check-label">{{ interest.name }}</label>
          </div>
          <p v-if="interestsError" class="alert alert-danger mt-3" role="alert">{{ interestsError }}</p>
          <p v-if="interestsSaved" class="alert alert-info mt-3" role="status">{{ interestsSaved }}</p>
          <button type="submit" class="btn save-button mt-3" :disabled="!catalogLoaded || catalogLoading || interestsBusy">{{ interestsBusy ? 'Saving…' : 'Save Interests' }}</button>
        </form>
        <form id="email-form" data-testid="email-form" novalidate class="form-section mb-4" :aria-busy="emailBusy" @submit.prevent="changeEmail">
          <h2 class="section-title">Change Email</h2>
          <p id="email-explanation">Changing your email signs you out on all devices. Sign in again with your new email.</p>
          <label for="email" class="form-label">New email address</label>
          <input id="email" v-model="email" class="form-control mb-3" type="email" autocomplete="email" aria-describedby="email-explanation" required />
          <label for="email-current-password" class="form-label">Current password</label>
          <input id="email-current-password" v-model="emailPassword" class="form-control mb-3" type="password" autocomplete="current-password" maxlength="128" required />
          <p v-if="emailError" class="alert alert-danger" role="alert">{{ emailError }}</p>
          <button type="submit" class="btn save-button" :disabled="emailBusy">{{ emailBusy ? 'Changing…' : 'Change Email' }}</button>
        </form>
        <form id="password-form" data-testid="password-form" novalidate class="form-section mb-4" :aria-busy="passwordBusy" @submit.prevent="changePassword">
          <h2 class="section-title">Change Password</h2>
          <p id="password-explanation">Changing your password signs you out on all devices. Sign in again with your new password.</p>
          <label for="current-password" class="form-label">Current password</label>
          <input id="current-password" v-model="currentPassword" class="form-control mb-3" type="password" autocomplete="current-password" maxlength="128" required />
          <label for="new-password" class="form-label">New password</label>
          <input id="new-password" v-model="newPassword" class="form-control mb-3" type="password" autocomplete="new-password" minlength="12" maxlength="128" aria-describedby="password-explanation password-help" required />
          <p id="password-help">Use 12–128 characters.</p>
          <label for="confirm-password" class="form-label">Confirm new password</label>
          <input id="confirm-password" v-model="confirmPassword" class="form-control mb-3" type="password" autocomplete="new-password" minlength="12" maxlength="128" required />
          <p v-if="passwordError" class="alert alert-danger" role="alert">{{ passwordError }}</p>
          <button type="submit" class="btn save-button" :disabled="passwordBusy">{{ passwordBusy ? 'Changing…' : 'Change Password' }}</button>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  width: 100%;
  background: #a6b793;
  color: #303830;
}

.focal-nav {
  background: #f5f3eb;
  min-height: 72px;
}

.search-group { min-width: 160px; }
.search-group input { border: 4px solid #a6b793; max-width: 700px; }
.search-button { background: #a6b793; color: #fff; border: 0; }
.upload-button, .save-button { background: #465344; color: white; border: 0; }
.upload-button:hover, .save-button:hover { background: #354335; color: white; }
.nav-link-text { color: var(--bs-secondary); }
.dropdown > .btn { border: none; }

.edit-panel {
  max-width: 900px;
  background: #f5f3eb;
  border-radius: 24px;
  padding: clamp(20px, 4vw, 40px);
}

.edit-profile-page h1 { color: #465344; }
.edit-profile-page h2,
.edit-profile-page h3 { color: #465344; }
.page-title { font-size: 30px; font-weight: 700; }
.page-description { color: #465344; }
.back-link { color: #465344; }
.form-section { padding: 22px; background: #fff; border-radius: 16px; }
.section-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
.profile-preview { width: 110px; height: 110px; border-radius: 50%; object-fit: cover; }
.choose-photo { background: #dce5d3; color: #354335; border: 1px solid #b1c4a5; }
.choose-photo:hover { background: #cbdcc2; }
.form-label { font-weight: 600; font-size: 14px; }
.form-control, .form-select, .input-group-text { border-color: #c7cfbd; }
.form-control:focus, .form-select:focus { border-color: #a6b793; box-shadow: 0 0 0 0.2rem rgba(166, 183, 147, 0.2); }
.cancel-button { color: #465344; border: 1px solid #465344; }
.cancel-button:hover { background: #e4e9df; }
.save-button { padding-inline: 25px; }

@media (max-width: 767px) {
  .focal-nav { flex-wrap: wrap; padding-block: 10px; }
  .edit-panel { border-radius: 16px; }
}
</style>
