import { createApp } from 'vue'
import { createWebHistory, createRouter } from 'vue-router';
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css' // Copied this from the HTML's css links, these should be the same, hopefully
import "./style.css" // Otherwise, the scaling is messed up
import App from './App.vue'
<<<<<<< Updated upstream
=======
import router from './router'
import { auth } from './stores/auth'
import { setUnauthorizedHandler } from './lib/api'

setUnauthorizedHandler(() => auth.invalidate(), () => auth.generation)
>>>>>>> Stashed changes


// Views
import homePage from './views/home.vue'
import creatorProfile from './views/creator-profile.vue';
import inspirationFeed from './views/inspiration-feed.vue';
import loginPage from "./views/login.vue";

const paths = [
  {"path": "/", "component": homePage},
  {"path": "/login", "component": loginPage},
  {"path": "/inspiration", "component": inspirationFeed},
  {"path": "/creator", "component": creatorProfile}
];

const router = createRouter({
    history: createWebHistory(),
    routes: paths
});

const application = createApp(App)
application.use(router)
application.mount('#app')

