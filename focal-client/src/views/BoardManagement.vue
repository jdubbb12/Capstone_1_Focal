<script setup lang="ts">
// This component preserves the Bootstrap Studio board management design.
// Stylesheets are loaded by the application's index.html.
</script>

<template>
  <main class="board-management-page">
    <!-- Navigation bar -->
    <div
      class="d-flex flex-row justify-content-start align-items-center gap-3 px-4"
      style="background: #F5F3EB;"
    >
      <RouterLink to="/feed" aria-label="FOCAL Home">
        <img height="72" src="/assets/img/Focal%20Logo.png" width="96" />
      </RouterLink>

      <div
        class="input-group rounded-pill flex-grow-1"
        style="border-width: 0px; border-color: var(--bs-secondary);"
      >
        <input
          class="rounded-pill form-control"
          placeholder="Search..."
          style="border-width: 4px; border-color: #a6b793; max-width: 700px;"
          type="text"
        />
        <button
          class="btn btn-primary rounded-circle"
          style="background: #a6b793; border-width: 0px;"
          type="button"
        >
          <i class="fas fa-search"></i>
        </button>
      </div>

      <button
        class="btn btn-primary"
        style="background: #465344; border-width: 0px;"
        type="button"
      >
        Upload
      </button>

      <RouterLink class="text-decoration-none" to="/feed" style="color: var(--bs-secondary);">
        Feed
      </RouterLink>
      <RouterLink class="text-decoration-none" to="/profile" style="color: var(--bs-secondary);">
        Profile
      </RouterLink>
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
    </div>

    <!-- Saved Boards heading and board details -->
    <div
      class="container"
      style="padding: 24px; width: 100%; margin-right: 0px; margin-left: 45px; padding-left: 0px;"
    >
      <div class="row justify-content-start align-items-start">
        <div class="col d-flex flex-column align-items-start flex-nowrap gap-2" style="margin-left: 0px;">
          <div style="margin-top: 0px;">
            <h1
              style="font-size: 28px; font-weight: bold; color: #303830; text-align: left; margin-bottom: 0px; margin-top: 0px; padding-top: 0px;"
            >
              Inspiration Boards
            </h1>
          </div>
          <div
            class="d-flex flex-row justify-content-start gap-5"
            style="padding-bottom: 0px; margin-bottom: 0px; margin-top: 5px;"
          >
            <span><i class="far fa-user"></i>&nbsp;@username</span>
            <span># of items</span>
            <span><i class="fas fa-globe"></i>&nbsp;Visibility</span>
            <span>Tags:&nbsp;</span>
          </div>
        </div>
      </div>

      <!-- Board category filters -->
      <div
        class="d-flex flex-row align-items-center"
        style="padding-left: 0px; padding-bottom: 0px; margin-bottom: 0px;"
      >
        <button class="btn" style="background: transparent; color: #465344; margin-top: 12px; padding-bottom: 0px; margin-bottom: 0px;" type="button">
          All
        </button>
        <button class="btn" style="background: transparent; color: #465344; margin-top: 12px; padding-bottom: 0px; margin-bottom: 0px;" type="button">
          2D Paintings
        </button>
        <button class="btn" style="background: transparent; color: #465344; margin-top: 12px; padding-bottom: 0px; margin-bottom: 0px;" type="button">
          3D Meshes
        </button>
        <button class="btn" style="background: transparent; color: #465344; margin-top: 12px; padding-bottom: 0px; margin-bottom: 0px;" type="button">
          Videos
        </button>
      </div>
    </div>

    <!-- Saved board cards -->
    <div class="container-fluid px-3 py-4" style="margin-top: -24px;">
      <div
        class="row gx-3 gy-4 row-cols-1 row-cols-md-2 row-cols-lg-4"
        style="margin-bottom: 0px; padding-top: 0px; margin-top: -10px;"
      >
        <!-- Card 1 -->
        <div class="col">
          <div class="card rounded-0 h-100" style="border-width: 0px; border-radius: 10px; overflow: hidden; background: transparent;">
            <div class="card-body" style="background: #F5F3EB; border-radius: 24px; overflow: hidden; max-width: 400px;">
              <div class="d-flex flex-column">
                <span style="font-weight: bold; font-size: 18px;">Title</span>
                <span>By: @username</span>
              </div>
              <img
                alt="Aerial view of turquoise ocean waves crashing onto a sandy beach"
                height="177"
                src="/assets/img/photo-1791234537439-b280ab80c590.jpg"
                style="border-radius: 24px; width: 100%;"
                width="248"
              />
              <div class="d-flex flex-column">
                <span>Medium:</span>
                <span>Notes:</span>
              </div>
              <div
                class="text-center d-flex align-items-center px-2 py-1"
                style="background: #465344; color: var(--bs-light); margin-top: 8px; padding-bottom: 4px; border-radius: 0px; border-top-left-radius: 8px; border-top-right-radius: 8px;"
              >
                <span class="text-center w-100" style="color: rgb(248, 249, 250); font-size: 18px;">View Original</span>
              </div>
              <div class="text-center" style="background: #465344; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px;">
                <span style="color: rgb(248,249,250); font-size: 12px; text-align: center;">(View Feedback)</span>
              </div>
              <button class="btn w-100" style="font-weight: bold; color: rgb(0,0,0);" type="button">
                Move / Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="col">
          <div class="card rounded-0 h-100" style="border-width: 0px; background: transparent;">
            <div class="card-body" style="background: #F5F3EB; border-radius: 24px; max-width: 400px;">
              <div class="d-flex flex-column">
                <span style="font-weight: bold; font-size: 18px;">Title</span>
                <span>By: @username</span>
              </div>
              <img
                alt="Aerial view of the Brisbane River, Victoria Bridge, and South Bank at dusk"
                height="177"
                src="/assets/img/photo-1789758490778-78e757c7f28f.jpg"
                style="border-radius: 24px; width: 100%;"
                width="248"
              />
              <div class="d-flex flex-column">
                <span>Medium:</span>
                <span>Notes:</span>
              </div>
              <div
                class="text-center d-flex justify-content-between align-items-center px-2 py-1"
                style="background: #465344; color: var(--bs-light); margin-top: 8px; border-top-left-radius: 8px; border-top-right-radius: 8px;"
              >
                <span class="w-100" style="font-size: 18px;">View Original</span>
              </div>
              <div class="text-center" style="background: #465344; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px;">
                <span style="color: rgb(248,249,250); font-size: 12px; text-align: center;">(View Feedback)</span>
              </div>
              <button class="btn w-100" style="font-weight: bold; color: rgb(0,0,0);" type="button">
                Move / Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="col">
          <div class="card rounded-0 h-100" style="border-width: 0px; background: transparent;">
            <div class="card-body" style="background: #F5F3EB; border-radius: 24px; max-width: 400px;">
              <div class="d-flex flex-column">
                <span style="font-weight: bold; font-size: 18px;">Title</span>
                <span>By: @username</span>
              </div>
              <img
                alt="An aerial view of many colorful kayaks arranged in a star pattern on water"
                height="177"
                src="/assets/img/photo-1790564689348-c7c9909f4fd5.jpg"
                style="border-radius: 24px; width: 100%;"
                width="248"
              />
              <div class="d-flex flex-column">
                <span>Medium:</span>
                <span>Notes:</span>
              </div>
              <div
                class="text-center d-flex justify-content-between align-items-center px-2 py-1"
                style="background: #465344; color: var(--bs-light); margin-top: 8px; border-top-left-radius: 8px; border-top-right-radius: 8px;"
              >
                <span class="text-center w-100" style="font-size: 18px;">View Original</span>
              </div>
              <div class="text-center" style="background: #465344; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px;">
                <span style="color: rgb(248,249,250); font-size: 12px; text-align: center;">(View Feedback)</span>
              </div>
              <button class="btn w-100" style="font-weight: bold; color: rgb(0,0,0);" type="button">
                Move / Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add items button -->
    <div
      class="d-flex flex-row justify-content-between flex-wrap"
      style="padding-right: 24px; padding-bottom: 24px; margin-top: 24px; margin-left: 24px;"
    >
      <button
        class="btn"
        style="background: #465344; color: #FFFFFF; border-radius: 8px; border-width: 0px; font-size: 12px;"
        type="button"
      >
        + Add Items from Feed
      </button>
    </div>
  </main>
</template>

<style scoped>
.board-management-page {
  background: #a6b793;
  min-height: 100vh;
  width: 100%;
}
</style>
