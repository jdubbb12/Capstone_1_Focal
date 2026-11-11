<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Sample profile data. Replace this with API-loaded profile information later.
const displayName = ref('First & Last Name')
const username = ref('username')
const bio = ref('This is where the user will put their bio')
const creatorType = ref('Digital Artist')
const email = ref('creator@example.com')
const profileImage = ref('/assets/img/photo-1779896411959-26149949fdc3.jpg')
const errorMessage = ref('')
const savedMessage = ref('')
let previewUrl: string | null = null

function selectPhoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Choose an image file.'
    return
  }
  if (previewUrl) URL.revokeObjectURL(previewUrl)
  previewUrl = URL.createObjectURL(file)
  profileImage.value = previewUrl
  errorMessage.value = ''
  savedMessage.value = ''
}

function saveProfile() {
  errorMessage.value = ''
  savedMessage.value = ''
  if (!displayName.value.trim() || !username.value.trim() || !email.value.trim()) {
    errorMessage.value = 'Display name, username, and email are required.'
    return
  }
  // Frontend prototype only: no backend endpoint or shared profile state yet.
  savedMessage.value = 'Your changes are ready.'
}

onUnmounted(() => {
  if (previewUrl) URL.revokeObjectURL(previewUrl)
})
</script>

<template>
  <main class="edit-profile-page">
    <!-- Focal navbar -->
    <nav class="focal-nav d-flex flex-row justify-content-start align-items-center gap-3 px-4">
      <RouterLink :to="{ name: 'InspirationFeed' }" aria-label="FOCAL Home">
        <img src="/assets/img/Focal%20Logo.png" width="96" height="72" alt="FOCAL logo" />
      </RouterLink>

      <div class="input-group rounded-pill flex-grow-1 search-group">
        <input class="form-control rounded-pill" type="search" placeholder="Search..." aria-label="Search" />
        <button class="btn rounded-circle search-button" type="button" aria-label="Search">
          <i class="fas fa-search" aria-hidden="true"></i>
        </button>
      </div>

      <button class="btn upload-button" type="button">Upload</button>
      <RouterLink :to="{ name: 'InspirationFeed' }" class="text-decoration-none nav-link-text">Feed</RouterLink>
      <RouterLink :to="{ name: 'CreatorProfile' }" class="text-decoration-none nav-link-text">Profile</RouterLink>

      <div class="dropdown">
        <button class="btn dropdown-toggle text-nowrap d-inline-flex align-items-center gap-2 nav-link-text"
                type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="far fa-user" aria-hidden="true"></i>
          @username
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><RouterLink class="dropdown-item" :to="{ name: 'EditProfile' }">Edit Profile</RouterLink></li>
          <li><RouterLink class="dropdown-item" :to="{ name: 'BoardManagement' }">Saved Boards</RouterLink></li>
          <li><hr class="dropdown-divider" /></li>
          <li><button class="dropdown-item" type="button">Log Out</button></li>
        </ul>
      </div>
    </nav>

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

        <form @submit.prevent="saveProfile">
          <section class="form-section mb-4">
            <h2 class="section-title">Profile Picture</h2>
            <div class="d-flex align-items-center flex-wrap gap-4">
              <img :src="profileImage" class="profile-preview" alt="Profile picture preview" />
              <div>
                <label for="profile-photo" class="btn choose-photo">Choose Photo</label>
                <input id="profile-photo" class="visually-hidden" type="file" accept="image/*" @change="selectPhoto" />
              </div>
            </div>
          </section>

          <section class="form-section mb-4">
            <h2 class="section-title">Basic Information</h2>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label" for="display-name">Display Name</label>
                <input id="display-name" v-model="displayName" class="form-control" maxlength="100" required />
              </div>
              <div class="col-md-6">
                <label class="form-label" for="username">Username</label>
                <div class="input-group">
                  <span class="input-group-text">@</span>
                  <input id="username" v-model="username" class="form-control" maxlength="40" required />
                </div>
              </div>
              <div class="col-12">
                <label class="form-label" for="bio">Bio</label>
                <textarea id="bio" v-model="bio" class="form-control" rows="4" maxlength="500" placeholder="Tell other creators about yourself"></textarea>
                <div class="text-muted small text-end mt-1">{{ bio.length }}/500 characters</div>
              </div>
            </div>
          </section>

          <section class="form-section mb-4">
            <h2 class="section-title">Creator Information</h2>
            <label class="form-label" for="creator-type">Creator Type</label>
            <select id="creator-type" v-model="creatorType" class="form-select">
              <option>Digital Artist</option>
              <option>Illustrator</option>
              <option>3D Artist</option>
              <option>Photographer</option>
              <option>Animator</option>
              <option>Architect</option>
              <option>Other</option>
            </select>
          </section>

          <section class="form-section mb-4">
            <h2 class="section-title">Account Information</h2>
            <label class="form-label" for="email">Email Address</label>
            <input id="email" v-model="email" class="form-control" type="email" autocomplete="email" required />
          </section>

          <p v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</p>
          <p v-if="savedMessage" class="alert alert-info" role="status">{{ savedMessage }}</p>

          <div class="d-flex justify-content-end flex-wrap gap-3">
            <button type="button" class="btn cancel-button" @click="router.push({ name: 'CreatorProfile' })">Cancel</button>
            <button type="submit" class="btn save-button">Save Changes</button>
          </div>
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
