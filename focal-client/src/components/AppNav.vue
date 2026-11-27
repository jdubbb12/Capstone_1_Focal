<script setup lang="ts">
import { useAuthStore } from '../stores/auth-str'

const authStore = useAuthStore()
</script>

<template>
  <div class="focal-2d-root">
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

      <RouterLink :to="{ name: 'Upload' }" class="btn btn-primary" style="background: #465344; border-width: 0px;">Upload</RouterLink>

      <RouterLink :to="{ name: 'InspirationFeed' }" class="text-decoration-none" style="color: var(--bs-secondary);">
        Feed
      </RouterLink>
      <RouterLink :to="{ name: 'CreatorProfile' }" class="text-decoration-none" style="color: var(--bs-secondary);">
        Profile
      </RouterLink>

      <div class="dropdown">
        <button class="btn dropdown-toggle text-nowrap d-inline-flex align-items-center gap-2 nav-link-text"
                type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="far fa-user" aria-hidden="true"></i>
          @{{ authStore.username }}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><RouterLink class="dropdown-item" :to="{ name: 'EditProfile' }">Edit Profile</RouterLink></li>
          <li><RouterLink class="dropdown-item" :to="{ name: 'BoardManagement' }">Saved Boards</RouterLink></li>
          <li><hr class="dropdown-divider" /></li>
          <li><button class="dropdown-item" type="button" @click="authStore.logout()">Log Out</button></li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.focal-2d-root {
  --bg-header: #f2f1ed;
  --bg-search: #f5f5f5;
  --bg-main: #a6b793;
  --bg-frame: #bcbfb8;
  --bg-canvas: #f5f5f5;
  --bg-sidebar: #ccccc8;
  --bg-card: #f2f1ef;
  --bg-filter: #c2c6b9;
  --text-primary: #333330;
  --text-secondary: #5a5a55;

  background-color: var(--bg-main);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  overflow: visible; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.focal-nav {
  background: #f5f3eb;
  min-height: 72px;
  position: relative;
  z-index: 1000;
}

.search-group { min-width: 160px; }
.search-group input { border: 4px solid #a6b793; max-width: 700px; }
.search-button { background: #a6b793; color: #fff; border: 0; }
.nav-link-text { color: var(--bs-secondary); }
.dropdown > .btn { border: none; }

@media (max-width: 767px) {
  .focal-nav { flex-wrap: wrap; padding-block: 10px; }
  .edit-panel { border-radius: 16px; }
}
</style>

