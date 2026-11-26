import { createApp } from 'vue'
import './style.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import App from './App.vue'
import router from './router'
import AppNav from './components/AppNav.vue'

const app = createApp(App)

app.component('AppNav', AppNav)
app.use(router)
app.mount('#app')
