<script setup lang="ts">
import AppNav from '../components/AppNav.vue'
</script>

<template>
  <div class="app-shell">
    <AppNav />
    <slot />
  </div>
</template>