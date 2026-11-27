<script setup lang="ts">
import { ref, onMounted,onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/focal-api'
import { useAuthStore } from '../stores/auth-str'
import MainLayout from '../layouts/MainLayout.vue'

const authStore = useAuthStore()

const router = useRouter()

// User information
const displayName = ref('')
const username = ref('')
const bio = ref('')
const creatorType = ref('')
const email = ref('')
const defaultImage = '/assets/img/photo-1779896411959-26149949fdc3.jpg'
const profileImage = ref(defaultImage)
const errorMessage = ref('')
const savedMessage = ref('')
let previewUrl: string | null = null
const selectedPhoto = ref<File | null>(null)

function selectPhoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = 'Choose a JPG, PNG, or WebP image.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'Image must be under 5 MB.'
    return
  }

  selectedPhoto.value = file

  if (previewUrl) URL.revokeObjectURL(previewUrl)

  previewUrl = URL.createObjectURL(file)
  profileImage.value = previewUrl

  errorMessage.value = ''
  savedMessage.value = ''
}

// Retrieve the user's saved profile information
const loadProfile = async () => {
  try {
    const response = await api.get('/profile')
    const data = response.data

    displayName.value = data.display_name || ''
    username.value = data.username || ''
    bio.value = data.bio || ''
    creatorType.value = data.creator_type || ''
    email.value = data.email || ''

    // Retrieve the saved profile picture
    if (data.profile_picture && data.profile_picture !== 'placeholder') {
      profileImage.value =
        `${api.defaults.baseURL}/profile/picture/${data.user_id}?t=${Date.now()}`
    } else {
      profileImage.value = defaultImage
    }

  } catch (error) {
    errorMessage.value = 'Could not load profile.'
    console.error(error)
  }
}

const saveProfile = async () => {
  savedMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await api.put('/profile', {
      displayName: displayName.value,
      username: username.value,
      bio: bio.value,
      creatorType: creatorType.value
    })

    // Update the username in the authentication store
    authStore.updateUsername(response.data.user.username)

    // Upload the profile picture if a new one was selected
    if (selectedPhoto.value) {
      const formData = new FormData()

      formData.append('image', selectedPhoto.value)

      await api.post('/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      selectedPhoto.value = null
    }

    savedMessage.value = 'Profile saved successfully!'

  } catch (error) {
    errorMessage.value = 'Could not save all profile changes.'
    console.error(error)
  }
}

onMounted(() => {
  loadProfile()
})

onUnmounted(() => {
  if (previewUrl) URL.revokeObjectURL(previewUrl)
})
</script>

<template>
<MainLayout>
  <main class="edit-profile-page">
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
              <img
                :src="profileImage"
                class="profile-preview"
                alt="Profile picture preview"
                @error="profileImage = defaultImage"
              />
              <div>
                <label for="profile-photo" class="btn choose-photo">Choose Photo</label>
                <input
                  id="profile-photo"
                  class="visually-hidden"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="selectPhoto"
                />
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
            <input id="email" v-model="email" class="form-control" type="email" autocomplete="email" readonly />
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
</MainLayout>
</template>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  width: 100%;
  background: #a6b793;
  color: #303830;
}

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
.save-button {
  background: #465344;
  color: white;
  border: 0;
  padding-inline: 25px;
}

.save-button:hover {
  background: #354335;
  color: white;
}

@media (max-width: 767px) {
  .edit-panel { border-radius: 16px; }
}
</style>
