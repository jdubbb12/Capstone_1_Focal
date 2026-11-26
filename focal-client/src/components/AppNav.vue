<script setup lang="ts">
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
  overflow: hidden; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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

