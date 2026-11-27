
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import App from './App.vue'
import router from './router'
import AppNav from './components/AppNav.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('AppNav', AppNav)

app.mount('#app')

