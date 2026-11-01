<script setup lang="ts">
import FocalNav from '../components/FocalNav.vue'
import { computed, ref } from 'vue'
import { auth } from '../stores/auth'
import { CREATIVE_ROLES } from '../lib/types'
const { user } = auth
const fullName = computed(() => `${user.value?.first_name ?? ''} ${user.value?.last_name ?? ''}`.trim())
const bio = computed(() => user.value?.bio || 'Tell other creators about yourself in Edit Profile.')
const creatorType = computed(() => CREATIVE_ROLES.find(role => role.value === user.value?.creative_role)?.label ?? 'Other')
const initials = computed(() => `${user.value?.first_name.charAt(0) ?? ''}${user.value?.last_name.charAt(0) ?? ''}`)
const projects = '—'
const favorites = '—'
const collections = '—'
const visibility = ref('Visibility')
const visibilityOpen = ref(false)
</script>

<template>
  <main class="creator-profile">
    <FocalNav />

    <!-- Creator information and statistics -->
    <section class="profile-header px-4 py-4">
      <div class="row align-items-center gy-4">
        <div class="col-12 col-lg-7 d-flex align-items-center gap-4 profile-identity">
          <div class="profile-photo profile-initials" aria-label="Profile initials">{{ initials }}</div>
          <div>
            <h1 class="profile-name">{{ fullName }}</h1>
            <p class="profile-bio">{{ bio }}</p>
            <span class="badge creator-badge">{{ creatorType }}</span>
            <p class="mt-2">@{{ user?.username }}</p>
            <div class="d-flex flex-wrap gap-2 mt-2"><span v-for="interest in user?.interests" :key="interest.interest_id" class="badge creator-badge">{{ interest.name }}</span></div>
            <RouterLink to="/edit-profile" class="btn btn-sm btn-outline-dark mt-3">Edit Profile</RouterLink>
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
            <div class="stat">
              <strong>{{ collections }}</strong>
              <span>Collections</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <p class="alert alert-info mx-4" role="status">The artwork below is a design preview, not your uploaded portfolio. Uploads and portfolio statistics are not connected yet.</p>
    <!-- Portfolio heading and visibility filter -->
    <section class="container-fluid px-3 py-4 portfolio-section">
      <div class="d-flex align-items-center justify-content-between portfolio-heading">
        <h2>Portfolio preview</h2>
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

      <div class="row gx-3 gy-4 row-cols-1 row-cols-md-2 row-cols-lg-4">
        <!-- Card 1 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <article class="card h-100 portfolio-card">
              <div class="card-body portfolio-card-body">
                <img
                  src="../assets/img/photo-1791234537439-b280ab80c590.jpg"
                  alt="Aerial view of turquoise ocean waves crashing onto a sandy beach"
                  class="portfolio-image"
                />
                <div class="card-title-row d-flex justify-content-between align-items-center px-2 py-1">
                  <span>Title</span>
                  <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                </div>
                <div class="card-tags">
                  <span class="badge portfolio-tag">Painting</span>
                </div>
              </div>
            </article>
          </RouterLink>
        </div>

        <!-- Card 2 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <article class="card h-100 portfolio-card">
              <div class="card-body portfolio-card-body">
                <img
                  src="../assets/img/photo-1789758490778-78e757c7f28f.jpg"
                  alt="Aerial view of the Brisbane River, Victoria Bridge, and South Bank at dusk"
                  class="portfolio-image"
                />
                <div class="card-title-row d-flex justify-content-between align-items-center px-2 py-1">
                  <span>Title</span>
                  <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                </div>
                <div class="card-tags">
                  <span class="badge portfolio-tag">Crafts</span>
                </div>
              </div>
            </article>
          </RouterLink>
        </div>

        <!-- Card 3 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <article class="card h-100 portfolio-card">
              <div class="card-body portfolio-card-body">
                <img
                  src="../assets/img/photo-1790564689348-c7c9909f4fd5.jpg"
                  alt="An aerial view of many colorful kayaks arranged in a star pattern on water"
                  class="portfolio-image"
                />
                <div class="card-title-row d-flex justify-content-between align-items-center px-2 py-1">
                  <span>Title</span>
                  <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                </div>
                <div class="card-tags">
                  <span class="badge portfolio-tag">Video</span>
                </div>
              </div>
            </article>
          </RouterLink>
        </div>

        <!-- Card 4 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <article class="card h-100 portfolio-card">
              <div class="card-body portfolio-card-body">
                <img
                  src="../assets/img/photo-1791350879692-0f88043725b7.jpg"
                  alt="Iridescent soap film ribbons with blue and gold highlights on a grey background"
                  class="portfolio-image"
                />
                <div class="card-title-row d-flex justify-content-between align-items-center px-2 py-1">
                  <span>Title</span>
                  <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                </div>
                <div class="card-tags">
                  <span class="badge portfolio-tag">3D Animation</span>
                  <span class="badge portfolio-tag">Video</span>
                </div>
              </div>
            </article>
          </RouterLink>
        </div>

        <!-- Card 5 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <article class="card h-100 portfolio-card">
              <div class="card-body portfolio-card-body">
                <img
                  src="../assets/img/photo-1791015759553-227f22b16087.jpg"
                  alt="A light grey vintage Volkswagen Beetle parked on a street in front of a building"
                  class="portfolio-image"
                />
                <div class="card-title-row d-flex justify-content-between align-items-center px-2 py-1">
                  <span>Title</span>
                  <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                </div>
                <div class="card-tags">
                  <span class="badge portfolio-tag">Video</span>
                </div>
              </div>
            </article>
          </RouterLink>
        </div>

        <!-- Card 6 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <article class="card h-100 portfolio-card">
              <div class="card-body portfolio-card-body">
                <img
                  src="../assets/img/photo-1791121902526-37047a1b93f4.jpg"
                  alt="A red fox with dark ears and paws on a grey gravel surface"
                  class="portfolio-image"
                />
                <div class="card-title-row d-flex justify-content-between align-items-center px-2 py-1">
                  <span>Title</span>
                  <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                </div>
                <div class="card-tags">
                  <span class="badge portfolio-tag">Crafts</span>
                  <span class="badge portfolio-tag">Video</span>
                </div>
              </div>
            </article>
          </RouterLink>
        </div>

        <!-- Card 7 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <article class="card h-100 portfolio-card">
              <div class="card-body portfolio-card-body">
                <img
                  src="../assets/img/photo-1778587614817-03d4bc181935.jpg"
                  alt="Two people view a large, ornate painting in a museum"
                  class="portfolio-image"
                />
                <div class="card-title-row d-flex justify-content-between align-items-center px-2 py-1">
                  <span>Title</span>
                  <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                </div>
                <div class="card-tags">
                  <span class="badge portfolio-tag">Painting</span>
                </div>
              </div>
            </article>
          </RouterLink>
        </div>

        <!-- Card 8 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <article class="card h-100 portfolio-card">
              <div class="card-body portfolio-card-body">
                <img
                  src="../assets/img/photo-1791231979059-f2a36c2a2e5d.jpg"
                  alt="Three people walking past a bronze sculpture against a large concrete wall"
                  class="portfolio-image"
                />
                <div class="card-title-row d-flex justify-content-between align-items-center px-2 py-1">
                  <span>Title</span>
                  <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                </div>
                <div class="card-tags">
                  <span class="badge portfolio-tag">3D Animation</span>
                </div>
              </div>
            </article>
          </RouterLink>
        </div>

      </div>
    </section>
  </main>
</template>

<style scoped>
.creator-profile {
  min-height: 100vh;
  width: 100%;
  background: #a6b793;
}

.focal-nav {
  background: #f5f3eb;
  min-height: 72px;
}

.nav-search {
  min-width: 180px;
  max-width: 760px;
}

.nav-search input {
  border: 4px solid #a6b793;
  max-width: 700px;
}

.search-button {
  background: #a6b793;
  color: #fff;
  border: 0;
}

.upload-button,
.visibility-button {
  background: #465344;
  color: #fff;
  border: 0;
}

.nav-link-text {
  color: var(--bs-secondary);
}

.profile-header {
  width: 100%;
}

.profile-initials { display:flex; align-items:center; justify-content:center; background:#f5f3eb; color:#465344; font-size:36px; font-weight:700; }

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
  padding: 5px 12px;
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
