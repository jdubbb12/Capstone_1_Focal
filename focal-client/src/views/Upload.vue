<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue'
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'


const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })
const router = useRouter()
const title = ref('')
const description = ref('')
const visibility = ref('public')
const file = ref<File | null>(null)
const preview = ref('')
const kind = ref('')
const error = ref('')
const busy = ref(false)
const progress = ref<number | undefined>()
let controller: AbortController | null = null
let request = 0

function fileKind(candidate: File) {
  if (/\.(png|jpe?g|webp)$/i.test(candidate.name) && ['image/png', 'image/jpeg', 'image/webp'].includes(candidate.type)) return 'image'
  if (/\.(mp4|webm)$/i.test(candidate.name) && ['video/mp4', 'video/webm'].includes(candidate.type)) return 'video'
  if (/\.glb$/i.test(candidate.name) && ['', 'model/gltf-binary', 'application/octet-stream'].includes(candidate.type)) return 'model'
  return ''
}

function fileError(candidate: File | null) {
  if (!candidate) return 'Choose an artwork file.'
  const type = fileKind(candidate)
  if (!type) return 'Choose a PNG, JPG, WebP, MP4, WebM, or GLB file.'
  const limit = type === 'image' ? 10 : 50
  if (!candidate.size || candidate.size > limit * 1024 * 1024) return `File must be non-empty and at most ${limit} MiB.`
  return ''
}

function apiError(failure: unknown, fallback: string) {
  if (failure && typeof failure === 'object' && 'response' in failure) {
    const response = failure.response
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data
      if (data && typeof data === 'object') {
        if ('message' in data && typeof data.message === 'string') return data.message
        if ('detail' in data && typeof data.detail === 'string') return data.detail
      }
    }
  }
  return failure instanceof Error && failure.message ? failure.message : fallback
}

function clearPreview() {
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = ''
}

function selectFile(event: Event) {
  if (busy.value) return
  clearPreview()
  const candidate = (event.target as HTMLInputElement).files?.[0] || null
  file.value = candidate
  error.value = fileError(candidate)
  kind.value = candidate ? fileKind(candidate) : ''
  if (candidate && !error.value && kind.value !== 'model') preview.value = URL.createObjectURL(candidate)
}

async function upload() {
  if (busy.value) return
  error.value = ''
  if (!title.value.trim() || title.value.trim().length > 75) error.value = 'Enter a title of 1–75 characters.'
  else if (description.value.length > 500) error.value = 'Description must be at most 500 characters.'
  else if (!['public', 'private'].includes(visibility.value)) error.value = 'Choose Public or Private visibility.'
  else error.value = fileError(file.value)
  if (error.value) return

  const current = ++request
  controller = new AbortController()
  const signal = controller.signal
  const form = new FormData()
  form.append('image', file.value!)
  form.append('title', title.value.trim())
  form.append('desc', description.value)
  form.append('is_visible', String(visibility.value === 'public'))
  busy.value = true
  progress.value = undefined

  try {
    const response = await api.post('/dist/artworks', form, {
      signal,
      onUploadProgress: (event: import('axios').AxiosProgressEvent) => {
        if (current === request && !signal.aborted) {
          progress.value = event.total ? Math.min(100, Math.round(event.loaded / event.total * 100)) : undefined
        }
      },
    })
    if (current !== request || signal.aborted) return
    const id = response.data.artwork?.artwork_id
    if (response.status !== 201 || !Number.isInteger(id) || id < 1) {
      throw new Error('The server did not confirm a saved artwork. Check your portfolio before retrying.')
    }
    await router.push({ name: 'ArtworkDetail', params: { id } })
  } catch (failure) {
    if (current === request && !signal.aborted) {
      error.value = apiError(failure, 'Could not upload artwork. Please try again.')
    }
  } finally {
    if (current === request) {
      busy.value = false
      controller = null
    }
  }
}

function cancel() {
  ++request
  controller?.abort()
  busy.value = false
  void router.push('/profile')
}

onBeforeUnmount(() => {
  ++request
  controller?.abort()
  clearPreview()
})
</script>

<template>
    <MainLayout>
        <main class="artwork-upload-page">
            <section class="upload-panel container mt-2 mb-4 p-4">
            <h1>Upload Artwork</h1>
            <form novalidate :aria-busy="busy" @submit.prevent="upload">
                <fieldset :disabled="busy">
                <div class="mb-3">
                    <label for="artwork-title" class="form-label">Title</label>
                    <input id="artwork-title" v-model="title" class="form-control" maxlength="75" required />
                    <small>{{ title.length }}/75 characters</small>
                </div>
                <div class="mb-3">
                    <label for="artwork-description" class="form-label">Description (optional)</label>
                    <textarea id="artwork-description" v-model="description" class="form-control" rows="4" maxlength="500"></textarea>
                    <small>{{ description.length }}/500 characters</small>
                </div>
                <div class="mb-3">
                    <label for="artwork-file" class="form-label">Artwork File</label>
                    <input id="artwork-file" type="file" class="form-control" accept=".png,.jpg,.jpeg,.webp,.mp4,.webm,.glb" aria-describedby="file-help" required @change="selectFile" />
                    <p id="file-help" class="small mt-2">PNG, JPG, WebP: up to 10 MiB. MP4, WebM, GLB: up to 50 MiB.</p>
                </div>
                <div v-if="preview" class="preview mb-3">
                    <img v-if="kind === 'image'" :src="preview" alt="Artwork preview" />
                    <video v-else :src="preview" controls preload="metadata" aria-label="Artwork preview"></video>
                </div>
                <p v-if="kind === 'model' && file && !error">GLB selected: {{ file.name }} — download preview only.</p>
                <div class="mb-3">
                    <label for="artwork-visibility" class="form-label">Visibility</label>
                    <select id="artwork-visibility" v-model="visibility" class="form-select">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    </select>
                    <small>Private artwork is only visible to you.</small>
                </div>
                </fieldset>
                <p v-if="error" role="alert" class="alert alert-danger">{{ error }}</p>
                <div v-if="busy" class="mb-3" role="status">
                <progress :value="progress" max="100" aria-label="Upload progress"></progress>
                <span> {{ progress === undefined ? 'Uploading…' : `${progress}% transferred — waiting for server confirmation…` }}</span>
                <p class="small">Cancelling stops this request, but a file already received by the server may be saved. Check your portfolio before uploading again.</p>
                </div>
                <div class="d-flex justify-content-end gap-3">
                <button data-testid="cancel-upload" class="btn cancel-button" type="button" @click="cancel">{{ busy ? 'Cancel upload' : 'Cancel / Back to profile' }}</button>
                <button class="btn upload-button" type="submit" :disabled="busy">{{ busy ? 'Uploading…' : 'Upload artwork' }}</button>
                </div>
            </form>
            </section>
        </main>
    </MainLayout>
</template>

<style scoped>
.artwork-upload-page { 
    min-height: 100vh; 
    background: #a6b793; 
    color: #303830; 
    padding: 24px 16px;
}


.upload-panel { 
    background: #f5f3eb;
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
    border-radius: 24px;
}

h1 { font-family: Georgia, serif; }
.form-control, .form-select { background: #efe7da; border-color: #d3d3c6; }
.upload-button { background: #465344; color: white; border: 0; }
.cancel-button { border: 1px solid #465344; color: #465344; }
.preview img, .preview video { display: block; width: 100%; max-height: 360px; object-fit: contain; border-radius: 16px; }
small { color: #5e685a; }
progress { max-width: 100%; }
</style>