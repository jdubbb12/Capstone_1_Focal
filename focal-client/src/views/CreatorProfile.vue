<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../services/focal-api'
import MainLayout from '../layouts/MainLayout.vue'

// Sample creator information from the Bootstrap Studio design.
const fullName = ref('First & Last Name')
const defaultImage = '/assets/img/photo-1779896411959-26149949fdc3.jpg'
const profileImage = ref(defaultImage)
const bio = ref('This is where the user will put their bio')
const creatorType = ref('Digital Artist')
const projects = computed(() => uploadedArtwork.value.length)
const favorites = ref(0)
const profileError = ref('')
// const search = ref('')
const visibility = ref('Visibility')
const visibilityOpen = ref(false)

interface Artwork {
  artwork_id: number
  artwork_title: string
  artwork_link: string
  artwork_description: string
  user_id: number
}

const uploadedArtwork = ref<Artwork[]>([])
const artworkError = ref('')

// Retrieve profile information from PostgreSQL
const loadProfile = async () => {
  try {
    const response = await api.get('/profile')
    const data = response.data

    fullName.value = data.display_name || 'First & Last Name'
    bio.value = data.bio || 'No bio added yet.'
    creatorType.value = data.creator_type || 'Digital Artist'

    // Retrieve the saved profile picture
    if (data.profile_picture && data.profile_picture !== 'placeholder') {
      profileImage.value =
        `${api.defaults.baseURL}/profile/picture/${data.user_id}?t=${Date.now()}`
    } else {
      profileImage.value = defaultImage
    }

    profileError.value = ''
  } catch (error) {
    profileError.value = 'Could not load profile.'
    console.error(error)
  }
}


const loadArtwork = async () => {
  try {
    const profileResponse = await api.get('/profile')
    const userId = profileResponse.data.user_id

    const response = await api.get(
      `/dist/users/${userId}/artworks`
    )

    uploadedArtwork.value = response.data.artwork
    artworkError.value = ''

  } catch (error) {
    artworkError.value = 'Could not load artwork.'
    console.error(error)
  }
}


// Load saved information when the page opens
onMounted(() => {
  loadProfile()
  loadArtwork()
})

</script>

<template>
<MainLayout>
  <main class="creator-profile">
    <!-- Creator information and statistics -->
    <section class="profile-header px-4 py-4">
      <div class="row align-items-center gy-4">
        <div class="col-12 col-lg-7 d-flex align-items-center gap-4 profile-identity">
          <img
            class="profile-photo"
            :src="profileImage"
            alt="Profile picture"
            @error="profileImage = defaultImage"
          />
          <div>
            <h1 class="profile-name">{{ fullName }}</h1>
            <p class="profile-bio">{{ bio }}</p>
            <span class="badge creator-badge d-block text-start">{{ creatorType }}</span>
          </div>
        </div>

        <div class="col-12 col-lg-5 d-flex justify-content-lg-end">
          <div class="d-flex align-items-center gap-4 stats">
            <div class="stat">
              <strong>{{ projects }}</strong>
              <span>Projects</span>
            </div>
            <div class="stat">
              <strong>{{ favorites }}</strong>
              <span>Favorites</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Portfolio heading and visibility filter -->
    <section class="container-fluid px-3 py-4 portfolio-section">
      <div class="d-flex align-items-center justify-content-between portfolio-heading">
        <h2>Portfolio</h2>
        <div class="dropdown">
          <button
            class="btn visibility-button dropdown-toggle"
            type="button"
            @click="visibilityOpen = !visibilityOpen"
            :aria-expanded="visibilityOpen"
          >
            {{ visibility }}
          </button>
          <ul v-if="visibilityOpen" class="dropdown-menu show">
            <li v-for="option in ['All', 'Public', 'Private']" :key="option">
              <button
                class="dropdown-item"
                type="button"
                @click="visibility = option; visibilityOpen = false"
              >
                {{ option }}
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- User's uploaded artwork -->
      <div class="row gx-3 gy-4 row-cols-1 row-cols-md-2 row-cols-lg-4">
        <div
          v-for="artwork in uploadedArtwork"
          :key="artwork.artwork_id"
          class="col"
        >
          <article class="card h-100 portfolio-card">
            <div class="card-body portfolio-card-body">

              <!-- Clickable artwork image -->
              <RouterLink
                :to="{ name: 'TwoDView' }"
                class="text-decoration-none d-block"
              >
                <img
                  :src="`${api.defaults.baseURL}/dist/artworks/${artwork.artwork_id}/img`"
                  :alt="artwork.artwork_title || 'Uploaded artwork'"
                  class="portfolio-image"
                />
              </RouterLink>

              <!-- Artwork title and options -->
              <div class="card-title-row d-flex justify-content-between align-items-center px-2 py-1">
                <span>{{ artwork.artwork_title }}</span>

                <div class="dropdown">
                  <button
                    class="btn p-0 border-0 text-white"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-label="Artwork options"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>

                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <RouterLink
                        class="dropdown-item"
                        :to="{ name: 'TwoDView' }"
                      >
                        View Artwork
                      </RouterLink>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Artwork tag -->
              <div class="card-tags d-flex justify-content-start">
                <span class="badge portfolio-tag">
                  Artwork
                </span>
              </div>

            </div>
          </article>
        </div>
      </div>

      <!-- No uploaded artwork -->
      <p v-if="uploadedArtwork.length === 0" class="text-center mt-4">
        You haven't uploaded any artwork yet.
      </p>

    </section>
  </main>
</MainLayout>
</template>

<style scoped>
.creator-profile {
  min-height: 100vh;
  width: 100%;
  background: #a6b793;
}

.visibility-button {
  background: #465344;
  color: #fff;
  border: 0;
}

.profile-header {
  width: 100%;
}

.profile-photo {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  flex-shrink: 0;
}

.profile-name {
  font-size: 22px;
  font-weight: bold;
  color: #303830;
  text-align: left;
}

.profile-bio {
  font-size: 14px;
  color: #465344;
  text-align: left;
  margin-bottom: 3px;
}

.creator-badge,
.portfolio-tag {
  background: #dce5d3;
  color: #354335;
}

.creator-badge {
  display: table !important;
  text-align: left;
  padding: 5px 12px;
  margin-top: 10px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #465344;
  font-size: 14px;
  font-weight: bold;
}

.stat strong {
  font-size: 26px;
  color: #303830;
}

.portfolio-heading {
  margin: 0 0 18px;
  padding: 0 8px 0 24px;
}

.portfolio-heading h2 {
  font-size: 18px;
  color: #303830;
  font-weight: bold;
  margin: 0;
}

.visibility-button {
  border-radius: 12px;
}

.portfolio-card {
  border: 0;
  background: transparent;
}

.portfolio-card-body {
  background: #f5f3eb;
  border-radius: 24px;
  max-width: 400px;
  width: 100%;
  overflow: hidden;
}

.portfolio-image {
  width: 100%;
  height: 177px;
  object-fit: cover;
  border-radius: 24px;
}

.card-title-row {
  background: #465344;
  color: var(--bs-light);
  margin-top: 8px;
  border-radius: 8px 8px 0 0;
}

.card-tags {
  background: #465344;
  border-radius: 0 0 8px 8px;
  padding-bottom: 1px;
}

.portfolio-tag {
  margin-left: 5px;
  margin-bottom: 5px;
}

@media (max-width: 767px) {
  .profile-identity {
    flex-wrap: wrap;
  }

  .stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
