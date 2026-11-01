<script setup lang="ts">
import FocalNav from '../components/FocalNav.vue'
// The discovery cards currently use sample data from the Bootstrap Studio design.
// Navigation uses the existing named routes in src/router/index.ts.
</script>

<template>
  <div class="inspiration-feed-page">
    <FocalNav />
    <p class="alert alert-info m-3" role="status">Discovery preview: these are sample artworks. The feed and uploads are not connected yet.</p>

    <!-- Page title -->
    <h1 style="text-align: center; font-family: Adamina, serif; padding-top: 8px; padding-bottom: 5px; margin-bottom: 4px; font-size: 50px; margin-top: 16px;">
      Discover Inspiration
    </h1>

    <!-- Category filters -->
    <div class="d-flex flex-row align-items-center flex-wrap" style="padding-top: 0px; padding-right: 16px; padding-bottom: 10px; padding-left: 16px;">
      <button class="btn" style="background: #465344; border-radius: 8px; font-size: 14px; padding-top: 5px; padding-bottom: 5px; padding-right: 15px; padding-left: 15px; border-top-width: 0px; color: var(--bs-light);" type="button">
        All
      </button>
      <button class="btn" style="background: transparent; border-radius: 8px; font-size: 14px; padding-top: 5px; padding-bottom: 5px; padding-right: 15px; padding-left: 15px; border-top-width: 0px; color: var(--bs-dark); margin-left: 10px;" type="button">
        Painting
      </button>
      <button class="btn" style="background: transparent; border-radius: 8px; font-size: 14px; padding-top: 5px; padding-bottom: 5px; padding-right: 15px; padding-left: 15px; border-top-width: 0px; color: var(--bs-dark); margin-left: 10px;" type="button">
        Crafts
      </button>
      <button class="btn" style="background: transparent; border-radius: 8px; font-size: 14px; padding-top: 5px; padding-bottom: 5px; padding-right: 15px; padding-left: 15px; border-top-width: 0px; color: var(--bs-dark); margin-left: 10px;" type="button">
        3D Animation
      </button>
      <button class="btn" style="background: transparent; border-radius: 8px; font-size: 14px; padding-top: 5px; padding-bottom: 5px; padding-right: 15px; padding-left: 15px; border-top-width: 0px; color: var(--bs-dark); margin-left: 10px;" type="button">
        Video
      </button>
    </div>

    <!-- Artwork grid -->
    <div class="container-fluid px-3 py-4">
      <div
        class="row gx-3 gy-4 row-cols-1 row-cols-md-2 row-cols-lg-4"
        style="margin-bottom: 0px; padding-top: 0px; margin-top: -36px;"
      >

        <!-- Card 1 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <div class="card rounded-0 h-100" style="border-width: 0px; border-radius: 10px; overflow: hidden; background: transparent;">
              <div class="card-body" style="background: #F5F3EB; border-radius: 24px; overflow: hidden; max-width: 400px;">
                <img alt="Aerial view of turquoise ocean waves crashing onto a sandy beach" height="177" src="/assets/img/photo-1791234537439-b280ab80c590.jpg" style="border-radius: 24px; width: 100%;" width="248"/>
                <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344; color: var(--bs-light); margin-top: 8px; padding-bottom: 4px; border-radius: 0px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <span>Title</span>
                  <i class="far fa-star"></i>
                </div>
                <div style="background: #465344; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px;">
                  <span class="badge" style="background: #DCE5D3; color: #354335; margin-left: 5px; margin-bottom: 5px;">Painting</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Card 2 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <div class="card rounded-0 h-100" style="border-width: 0px; background: transparent;">
              <div class="card-body" style="background: #F5F3EB; border-radius: 24px; max-width: 400px;">
                <img alt="Aerial view of the Brisbane River, Victoria Bridge, and South Bank at dusk" height="177" src="/assets/img/photo-1789758490778-78e757c7f28f.jpg" style="border-radius: 24px; width: 100%;" width="248"/>
                <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344; color: var(--bs-light); margin-top: 8px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <span>Title</span>
                  <i class="far fa-star"></i>
                </div>
                <div style="background: #465344; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px;">
                  <span class="badge" style="background: #DCE5D3; color: #354335; margin-left: 5px; margin-bottom: 5px;">Crafts</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Card 3 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <div class="card rounded-0 h-100" style="border-width: 0px; background: transparent;">
              <div class="card-body" style="background: #F5F3EB; border-radius: 24px; max-width: 400px;">
                <img alt="An aerial view of many colorful kayaks arranged in a star pattern on water" height="177" src="/assets/img/photo-1790564689348-c7c9909f4fd5.jpg" style="border-radius: 24px; width: 100%;" width="248"/>
                <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344; color: var(--bs-light); margin-top: 8px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <span>Title</span>
                  <i class="far fa-star"></i>
                </div>
                <div style="background: #465344; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px;">
                  <span class="badge" style="background: #DCE5D3; color: #354335; margin-left: 5px; margin-bottom: 5px;">Video</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Card 4 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <div class="card rounded-0 h-100" style="border-width: 0px; background: transparent;">
              <div class="card-body" style="background: #F5F3EB; border-width: 0px; border-radius: 24px; padding-top: 16px; max-width: 400px;">
                <img alt="Iridescent soap film ribbons with blue and gold highlights on a grey background" height="177" src="/assets/img/photo-1791350879692-0f88043725b7.jpg" style="border-radius: 24px; width: 100%;" width="248"/>
                <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344; color: var(--bs-light); margin-top: 8px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <span>Title</span>
                  <i class="far fa-star"></i>
                </div>
                <div style="background: #465344; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px;">
                  <span class="badge" style="background: #DCE5D3; color: #354335; margin-left: 5px; margin-bottom: 5px;">3D Animation</span>
                  <span class="badge" style="background: #DCE5D3; color: #354335; margin-left: 5px; margin-bottom: 5px;">Video</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Card 5 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <div class="card rounded-0 h-100" style="border-width: 0px; background: transparent;">
              <div class="card-body" style="background: #F5F3EB; border-radius: 24px; max-width: 400px;">
                <img alt="A light grey vintage Volkswagen Beetle parked on a street in front of a building" height="177" src="/assets/img/photo-1791015759553-227f22b16087.jpg" style="border-radius: 24px; width: 100%;" width="248"/>
                <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344; color: var(--bs-light); margin-top: 8px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <span>Title</span>
                  <i class="far fa-star"></i>
                </div>
                <div style="background: #465344; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px;">
                  <span class="badge" style="background: #DCE5D3; color: #354335; margin-left: 5px; margin-bottom: 5px;">Video</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Card 6 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <div class="card rounded-0 h-100" style="border-width: 0px; background: transparent;">
              <div class="card-body" style="background: #F5F3EB; border-radius: 24px; max-width: 400px;">
                <img alt="A red fox with dark ears and paws on a grey gravel surface" height="177" src="/assets/img/photo-1791121902526-37047a1b93f4.jpg" style="border-radius: 24px; width: 100%;" width="248"/>
                <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344; color: var(--bs-light); margin-top: 8px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <span>Title</span>
                  <i class="far fa-star"></i>
                </div>
                <div style="background: #465344; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px;">
                  <span class="badge" style="background: #DCE5D3; color: #354335; margin-left: 5px; margin-bottom: 5px;">Crafts</span>
                  <span class="badge" style="background: #DCE5D3; color: #354335; margin-left: 5px; margin-bottom: 5px;">Video</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Card 7 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <div class="card rounded-0 h-100" style="border-width: 0px; background: transparent; border-radius: 0px;">
              <div class="card-body" style="background: #F5F3EB; border-radius: 24px; max-width: 400px;">
                <img alt="Two people view a large, ornate painting in a museum" height="177" src="/assets/img/photo-1778587614817-03d4bc181935.jpg" style="border-radius: 24px; width: 100%;" width="248"/>
                <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344; color: var(--bs-light); margin-top: 8px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <span>Title</span>
                  <i class="far fa-star"></i>
                </div>
                <div style="background: #465344; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px;">
                  <span class="badge" style="background: #DCE5D3; color: #354335; margin-left: 5px; margin-bottom: 5px;">Painting</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Card 8 -->
        <div class="col">
          <RouterLink :to="{ name: 'TwoDView' }" class="text-decoration-none text-reset d-block h-100">
            <div class="card rounded-0 h-100" style="border-width: 0px; background: transparent;">
              <div class="card-body" style="background: #F5F3EB; border-radius: 24px; max-width: 400px;">
                <img alt="Three people walking past a bronze sculpture against a large concrete wall" height="177" src="/assets/img/photo-1791231979059-f2a36c2a2e5d.jpg" style="height: 177px; border-radius: 24px; max-width: 400px; width: 100%;" width="248"/>
                <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344; color: var(--bs-light); margin-top: 8px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <span>Title</span>
                  <i class="far fa-star"></i>
                </div>
                <div style="background: #465344; border-radius: 1px; border-bottom-right-radius: 8px; border-bottom-left-radius: 8px; border-top-left-radius: 0px; border-top-right-radius: 0px;">
                  <span class="badge" style="background: #DCE5D3; color: #354335; margin-left: 5px; margin-bottom: 5px;">3D Animation</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

  </div>
</div>
  </div>

</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Adamina&display=swap');
.inspiration-feed-page {
  min-height: 100vh;
  background: #a6b793;
}
</style>
