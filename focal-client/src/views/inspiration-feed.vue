<script setup lang="ts">
    console.log("Successfully loaded view.")
</script>

<template>
    <body style="background: #a6b793;">
    <div class="d-flex flex-row justify-content-start align-items-center gap-3 px-4" style="background: #F5F3EB;"><img src="../assets/img/Focal%20Logo.png" width="96" height="72">
        <div class="input-group rounded-pill flex-grow-1" style="border-width: 0px;border-color: var(--bs-secondary);"><input class="rounded-pill form-control" type="text" placeholder="Search..." style="border-width: 4px;border-color: #a6b793;border-top-color: rgb(33,;border-right-color: 37,;border-bottom-color: 41);border-left-color: 37,;max-width: 700px;"><button class="btn btn-primary rounded-circle" type="button" style="background: #a6b793;border-width: 0px;"><i class="fas fa-search"></i></button></div><button class="btn btn-primary" type="button" style="background: #465344;border-width: 0px;">Upload</button><a class="text-decoration-none" href="#" style="color: var(--bs-secondary);">Feed</a><a class="text-decoration-none" href="#" style="color: var(--bs-secondary);">Profile</a><span class="text-nowrap d-inline-flex align-items-center gap-2" style="color: var(--bs-secondary);"><i class="far fa-user" style="color: var(--bs-secondary);"></i><br>Full Name<br><br></span><i class="fas fa-chevron-down" style="color: var(--bs-secondary);"></i>
    </div>
    <h1 style="text-align: center;font-family: Adamina, serif;padding-top: 8px;padding-bottom: 5px;margin-bottom: 4px;font-size: 50px;margin-top: 16px;">Discover Inspiration</h1>
    <div class="d-flex flex-row align-items-center flex-wrap" style="padding-top: 0px;padding-right: 16px;padding-bottom: 10px;padding-left: 16px;"><button class="btn" type="button" style="background: #465344;border-radius: 8px;font-size: 14px;padding-top: 5px;padding-bottom: 5px;padding-right: 15px;padding-left: 15px;border-top-width: 0px;color: var(--bs-light);">All</button><button class="btn" type="button" style="background: transparent;border-radius: 8px;font-size: 14px;padding-top: 5px;padding-bottom: 5px;padding-right: 15px;padding-left: 15px;border-top-width: 0px;color: var(--bs-dark);margin-left: 10px;">Painting</button><button class="btn" type="button" style="background: transparent;border-radius: 8px;font-size: 14px;padding-top: 5px;padding-bottom: 5px;padding-right: 15px;padding-left: 15px;border-top-width: 0px;color: var(--bs-dark);margin-left: 10px;">Crafts</button><button class="btn" type="button" style="background: transparent;border-radius: 8px;font-size: 14px;padding-top: 5px;padding-bottom: 5px;padding-right: 15px;padding-left: 15px;border-top-width: 0px;color: var(--bs-dark);margin-left: 10px;">3D Animation</button><button class="btn" type="button" style="background: transparent;border-radius: 8px;font-size: 14px;padding-top: 5px;padding-bottom: 5px;padding-right: 15px;padding-left: 15px;border-top-width: 0px;color: var(--bs-dark);margin-left: 10px;">Video</button></div>
    <div class="container-fluid px-3 py-4">
        <div class="row gx-3 gy-4 row-cols-1 row-cols-md-2 row-cols-lg-4" style="margin-bottom: 0px;padding-top: 0px;margin-top: -36px;">
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;border-radius: 10px;overflow: hidden;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;overflow: hidden;max-width: 400px;"><img alt="Aerial view of turquoise ocean waves crashing onto a sandy beach" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1791234537439-b280ab80c590.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;padding-bottom: 4px;border-radius: 0px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="far fa-star"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Painting</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="Aerial view of the Brisbane River, Victoria Bridge, and South Bank at dusk" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1789758490778-78e757c7f28f.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="far fa-star"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Crafts</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="An aerial view of many colorful kayaks arranged in a star pattern on water" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1790564689348-c7c9909f4fd5.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="far fa-star"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Video</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-width: 0px;border-radius: 24px;padding-top: 16px;max-width: 400px;"><img alt="Iridescent soap film ribbons with blue and gold highlights on a grey background" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1791350879692-0f88043725b7.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="far fa-star"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">3D Animation</span><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Video</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="A light grey vintage Volkswagen Beetle parked on a street in front of a building" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1791015759553-227f22b16087.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="far fa-star"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Video</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="A red fox with dark ears and paws on a grey gravel surface" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1791121902526-37047a1b93f4.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="far fa-star"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Crafts</span><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Video</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;border-radius: 0px;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="Two people view a large, ornate painting in a museum" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1778587614817-03d4bc181935.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="far fa-star"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Painting</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="Three people walking past a bronze sculpture against a large concrete wall" width="248" height="177" style="height: 177px;border-radius: 24px;max-width: 400px;width: 100%;" src="../assets/img/photo-1791231979059-f2a36c2a2e5d.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="far fa-star"></i></div>
                        <div style="background: #465344;border-radius: 1px;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;border-top-left-radius: 0px;border-top-right-radius: 0px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">3D Animation</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </body>
</template>
