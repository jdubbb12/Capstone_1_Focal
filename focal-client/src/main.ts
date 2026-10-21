import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
//import "bootstrap/dist/js/bootstrap.min.js" -- i think this is unnecessary?
import '@fortawesome/fontawesome-free/css/all.min.css' // Copied this from the HTML's css links, these should be the same, hopefully
import "./style.css" // Otherwise, the scaling is messed up
import App from './App.vue'

const application = createApp(App)
application.mount('#app')

