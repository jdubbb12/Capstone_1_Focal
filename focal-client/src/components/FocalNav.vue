<script setup lang="ts">
import AccountMenu from './AccountMenu.vue'
</script>
<template>
  <nav class="focal-nav d-flex flex-wrap align-items-center gap-3 px-4" aria-label="Main navigation">
    <RouterLink :to="{ name: 'InspirationFeed' }" aria-label="Focal home"><img height="72" width="96" src="/assets/img/Focal%20Logo.png" alt="Focal logo" /></RouterLink>
    <div class="input-group flex-grow-1 nav-search">
      <input class="form-control rounded-pill" type="search" placeholder="Search (coming soon)" aria-label="Search (coming soon)" disabled />
    </div>
    <button class="btn upload-button" type="button" disabled title="Artwork upload is not connected yet">Upload (soon)</button>
    <RouterLink :to="{ name: 'InspirationFeed' }" class="nav-link-text">Feed</RouterLink>
    <RouterLink :to="{ name: 'CreatorProfile' }" class="nav-link-text">Profile</RouterLink>
    <AccountMenu />
  </nav>
</template>
<style scoped>
.focal-nav { background:#f5f3eb; min-height:72px; text-align:left; }
.nav-search { min-width:160px; max-width:700px; }
.nav-search input { border:4px solid #a6b793; }
.upload-button { background:#465344; color:white; }
.nav-link-text { text-decoration:none; color:#465344; }
@media (max-width:767px) { .focal-nav { padding-block:10px; } }
</style>
