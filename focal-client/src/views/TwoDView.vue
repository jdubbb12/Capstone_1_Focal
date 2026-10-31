<script setup>
import { computed, ref } from 'vue'

const selectedFilter = ref('All')
const filterOpen = ref(false)
const replyOpen = ref(false)
const replyText = ref('')

const comments = ref([
  { id: 1, username: '@username', text: 'This is a sample comment', status: 'Open' },
])

const filteredComments = computed(() =>
  selectedFilter.value === 'All'
    ? comments.value
    : comments.value.filter((comment) => comment.status === selectedFilter.value),
)

function chooseFilter(value) {
  selectedFilter.value = value
  filterOpen.value = false
}
</script>

<template>
  <div class="view-page">
    <!-- Navigation retained from the exported Bootstrap Studio page. -->
    <nav class="focal-navbar d-flex flex-row align-items-center gap-3 px-4">
      <RouterLink to="/feed" aria-label="FOCAL Home">
        <img height="72" src="/assets/img/Focal%20Logo.png" width="96" />
      </RouterLink>

      <div class="input-group rounded-pill flex-grow-1 search-group">
        <input class="form-control rounded-pill search-input" type="search" placeholder="Search..." aria-label="Search" />
        <button class="btn rounded-circle search-button" type="button" aria-label="Search">
          <i class="fas fa-search" aria-hidden="true"></i>
        </button>
      </div>

      <button class="btn upload-button" type="button">Upload</button>
      <a class="text-decoration-none nav-link-text" href="/feed">Feed</a>
      <a class="text-decoration-none nav-link-text" href="/profile">Profile</a>
      <div class="dropdown">
        <button
          class="btn dropdown-toggle text-nowrap d-inline-flex align-items-center gap-2"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style="color: var(--bs-secondary); border: none;"
        >
          <i class="far fa-user"></i>
          @username
        </button>

        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <RouterLink
              class="dropdown-item"
              :to="{ name: 'EditProfile' }"
            >
              Edit Profile
            </RouterLink>
          </li>

          <li>
            <RouterLink
              class="dropdown-item"
              :to="{ name: 'BoardManagement' }"
            >
              Saved Boards
            </RouterLink>
          </li>

          <li>
            <hr class="dropdown-divider" />
          </li>

          <li>
            <button class="dropdown-item" type="button">
              Log Out
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <main class="container-fluid">
      <div class="row align-items-stretch workspace-row">
        <section class="col-9 canvas-column" aria-label="2D artwork canvas">
          <div class="canvas-frame">
            <div class="canvas-inner">
              <img
                class="canvas-image"
                src="/assets/img/photo-1791015759553-227f22b16087.jpg"
                alt="A light grey vintage Volkswagen Beetle parked on a street in front of a building"
              />
            </div>
          </div>

          <div class="dropdown filter-dropdown">
            <button
              class="btn dropdown-toggle filter-button"
              type="button"
              :aria-expanded="filterOpen"
              aria-haspopup="true"
              @click="filterOpen = !filterOpen"
            >
              Filter Comments
            </button>
            <div v-if="filterOpen" class="dropdown-menu show">
              <button
                v-for="option in ['All', 'Open', 'Resolved']"
                :key="option"
                class="dropdown-item"
                type="button"
                @click="chooseFilter(option)"
              >{{ option }}</button>
            </div>
          </div>
        </section>

        <aside class="col-3 comments-column" aria-label="Spatial annotations">
          <h1 class="comments-heading">Spatial Annotations</h1>
          <div v-for="comment in filteredComments" :key="comment.id" class="comment-card">
            <p class="comment-author">[{{ comment.id }}] {{ comment.username }}</p>
            <p class="comment-text">{{ comment.text }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <button class="btn btn-link text-decoration-none reply-button" type="button" @click="replyOpen = !replyOpen">
                Reply
              </button>
              <p class="comment-status">Status: {{ comment.status }}</p>
            </div>
            <div v-if="replyOpen" class="mt-2">
              <textarea v-model="replyText" class="form-control form-control-sm" rows="2" placeholder="Write a reply..."></textarea>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
.view-page {
  min-height: 100vh;
  background: #a6b793;
}
.focal-navbar {
  min-height: 72px;
  background: #f5f3eb;
}
.focal-logo { object-fit: contain; }
.search-group { min-width: 0; }
.search-input {
  border: 4px solid #a6b793;
  max-width: 700px;
}
.search-button {
  background: #a6b793;
  color: white;
  border: 0;
  width: 40px;
  height: 40px;
}
.upload-button { background: #465344; color: white; }
.upload-button:hover { background: #384537; color: white; }
.nav-link-text { color: var(--bs-secondary-color, #6c757d); }
.workspace-row { min-height: calc(100vh - 72px); }
.canvas-column { padding-top: 40px; }
.canvas-frame {
  background: #b0b5af;
  width: 100%;
  height: 400px;
  border-radius: 20px;
  padding: 20px;
}
.canvas-inner {
  background: #c4c8c3;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.canvas-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 20px;
}
.filter-dropdown { margin-top: 15px; }
.filter-button {
  background: #b9c3b4;
  color: #344238;
  border-radius: 10px;
  font-size: 14px;
}
.comments-column { background: #cecece; padding-top: 12px; }
.comments-heading { font-size: 16px; margin: 0 0 20px; }
.comment-card {
  background: #f5f5f5;
  border-radius: 20px;
  width: 100%;
  padding: 12px;
  margin-top: 15px;
}
.comment-author {
  font-size: 12px;
  color: #343434;
  background: #e4a47b;
  width: fit-content;
  margin-bottom: 10px;
}
.comment-text { color: #444; font-size: 14px; margin-bottom: 10px; }
.reply-button { background: transparent; font-size: 12px; color: #444; padding: 0; }
.comment-status { color: #444; font-size: 12px; margin: 0; }
@media (max-width: 767px) {
  .focal-navbar { flex-wrap: wrap; padding: 8px 12px !important; }
  .workspace-row { min-height: calc(100vh - 72px); }
  .canvas-column, .comments-column { width: 100%; }
  .canvas-column { padding-top: 20px; }
  .comments-column { min-height: 240px; padding-bottom: 20px; }
}
</style>
