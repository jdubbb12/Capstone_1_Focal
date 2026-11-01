import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { auth } from './stores/auth'
import { setUnauthorizedHandler } from './lib/api'

setUnauthorizedHandler(() => auth.invalidate(), () => auth.generation)

createApp(App).use(router).mount('#app')

