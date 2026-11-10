<script setup lang="ts">
    console.log("Successfully loaded view.")
</script>

<template>
    <body style="background: #a6b793;">
    <div class="d-flex flex-row justify-content-start align-items-center gap-3 px-4" style="background: #F5F3EB;"><img src="../assets/img/logo.png" width="96" height="72">
        <div class="input-group rounded-pill flex-grow-1" style="border-width: 0px;border-color: var(--bs-secondary);"><input class="rounded-pill form-control" type="text" placeholder="Search..." style="border-width: 4px;border-color: #a6b793;border-top-color: rgb(33,;border-right-color: 37,;border-bottom-color: 41);border-left-color: 37,;max-width: 700px;"><button class="btn btn-primary rounded-circle" type="button" style="background: #a6b793;border-width: 0px;"><i class="fas fa-search"></i></button></div><button class="btn btn-primary" type="button" style="background: #465344;border-width: 0px;">Upload</button><a class="text-decoration-none" href="#" style="color: var(--bs-secondary);">Feed</a><a class="text-decoration-none" href="#" style="color: var(--bs-secondary);">Profile</a><span class="text-nowrap d-inline-flex align-items-center gap-2" style="color: var(--bs-secondary);"><i class="far fa-user" style="color: var(--bs-secondary);"></i><br>Full Name<br><br></span><i class="fas fa-chevron-down" style="color: var(--bs-secondary);"></i>
    </div>
    <div class="container" style="padding: 24px;width: 100%;margin-right: 0px;margin-left: 80px;">
        <div class="row align-items-center">
            <div class="col d-flex flex-row align-items-center flex-nowrap gap-5" style="margin-left: 0px;"><img alt="A stylish man in a blue suit holds a camera" style="width: 120px;height: 120px;border-radius: 50%;" width="140" height="110" src="../assets/img/photo-1779896411959-26149949fdc3.jpg">
                <div>
                    <h1 style="font-size: 22px;font-weight: bold;color: #303830;text-align: left;">First &amp; Last Name</h1>
                    <p style="font-size: 14px;color: #465344;text-align: left;">This is where the user will put their bio</p><span class="badge" style="background: #DCE5D3;color: #354335;padding-top: 5px;padding-bottom: 5px;padding-right: 12px;padding-left: 12px;">Digital Artist</span>
                </div>
            </div>
            <div class="col d-flex flex-row justify-content-end align-items-end" style="margin-left: auto;">
                <div class="d-flex flex-row justify-content-evenly align-items-center flex-nowrap">
                    <div class="d-flex flex-column align-items-center gap-4" style="margin-right: 24px;">
                        <h1 style="font-size: 26px;color: #303830;font-weight: bold;margin-bottom: 0px;">8</h1><span style="font-size: 14px;font-weight: bold;color: #465344;">Projects</span>
                    </div>
                    <div class="d-flex flex-column align-items-center gap-4" style="margin-right: 24px;">
                        <h1 style="font-size: 26px;color: #303830;font-weight: bold;margin-bottom: 0px;">24</h1><span style="font-size: 14px;font-weight: bold;color: #465344;">Favorites</span>
                    </div>
                    <div class="d-flex flex-column align-items-center gap-4">
                        <h1 style="font-size: 26px;color: #303830;font-weight: bold;margin-bottom: 0px;">3</h1><span style="font-size: 14px;font-weight: bold;color: #465344;">Collections</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="container-fluid px-3 py-4" style="margin-top: -24px;">
        <div class="d-flex flex-row justify-content-between align-items-center" style="margin-bottom: 18px;">
            <h1 style="font-size: 18px;color: #303830;text-align: left;margin-left: 24px;font-weight: bold;">Portfolio</h1>
            <div class="dropdown"><button class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" type="button" style="background: #465344;border-width: 0px;border-radius: 12px;margin-right: 0px;">Visibility</button>
                <div class="dropdown-menu"><a class="dropdown-item" href="#">First Item</a><a class="dropdown-item" href="#">Second Item</a><a class="dropdown-item" href="#">Third Item</a></div>
            </div>
        </div>
        <div class="row gx-3 gy-4 row-cols-1 row-cols-md-2 row-cols-lg-4" style="margin-bottom: 0px;padding-top: 0px;margin-top: -36px;">
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;border-radius: 10px;overflow: hidden;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;overflow: hidden;max-width: 400px;"><img alt="Aerial view of turquoise ocean waves crashing onto a sandy beach" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1791234537439-b280ab80c590.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;padding-bottom: 4px;border-radius: 0px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="fas fa-ellipsis-v"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Painting</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="Aerial view of the Brisbane River, Victoria Bridge, and South Bank at dusk" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1789758490778-78e757c7f28f.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="fas fa-ellipsis-v"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Crafts</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="An aerial view of many colorful kayaks arranged in a star pattern on water" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1790564689348-c7c9909f4fd5.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="fas fa-ellipsis-v"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Video</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-width: 0px;border-radius: 24px;padding-top: 16px;max-width: 400px;"><img alt="Iridescent soap film ribbons with blue and gold highlights on a grey background" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1791350879692-0f88043725b7.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="fas fa-ellipsis-v"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">3D Animation</span><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Video</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="A light grey vintage Volkswagen Beetle parked on a street in front of a building" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1791015759553-227f22b16087.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="fas fa-ellipsis-v"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Video</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="A red fox with dark ears and paws on a grey gravel surface" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1791121902526-37047a1b93f4.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="fas fa-ellipsis-v"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Crafts</span><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Video</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;border-radius: 0px;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="Two people view a large, ornate painting in a museum" width="248" height="177" style="border-radius: 24px;width: 100%;" src="../assets/img/photo-1778587614817-03d4bc181935.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="fas fa-ellipsis-v"></i></div>
                        <div style="background: #465344;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">Painting</span></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card rounded-0 h-100" style="border-width: 0px;background: transparent;">
                    <div class="card-body" style="background: #F5F3EB;border-radius: 24px;max-width: 400px;"><img alt="Three people walking past a bronze sculpture against a large concrete wall" width="248" height="177" style="height: 177px;border-radius: 24px;width: 100%;" src="../assets/img/photo-1791231979059-f2a36c2a2e5d.jpg">
                        <div class="d-flex justify-content-between align-items-center px-2 py-1" style="background: #465344;color: var(--bs-light);margin-top: 8px;border-top-left-radius: 8px;border-top-right-radius: 8px;"><span>Title</span><i class="fas fa-ellipsis-v"></i></div>
                        <div style="background: #465344;border-radius: 1px;border-bottom-right-radius: 8px;border-bottom-left-radius: 8px;border-top-left-radius: 0px;border-top-right-radius: 0px;"><span class="badge" style="background: #DCE5D3;color: #354335;margin-left: 5px;margin-bottom: 5px;">3D Animation</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Obsolete as we are importing Bootstrap from the installed NPM package
     script src="assets/bootstrap/js/bootstrap.min.js"></script-->
</body>
</template>