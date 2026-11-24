import { createRouter, createWebHistory } from 'vue-router'
import InspirationFeed from '../views/InspirationFeed.vue'
import CreatorProfile from '../views/CreatorProfile.vue'
import BoardManagement from '../views/BoardManagement.vue'
import TwoDView from '../views/TwoDView.vue'
import FocalSignup from '../views/FocalSignup.vue'
import FocalLogin from '../views/FocalLogin.vue'
import EditProfile from '../views/EditProfile.vue'
import { useAuthStore } from '../stores/auth-str.ts'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      alias: '/signup',
      name: 'Signup',
      component: FocalSignup,
      meta: { guestOnly: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: FocalLogin,
      meta: { guestOnly: true }
    },
    {
      path: '/feed',
      name: 'InspirationFeed',
      component: InspirationFeed,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'CreatorProfile',
      component: CreatorProfile,
      meta: { requiresAuth: true }
    },
    {
      path: '/boards',
      name: 'BoardManagement',
      component: BoardManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/2d',
      name: 'TwoDView',
      component: TwoDView,
      meta: { requiresAuth: true }
    },
    {
      path: '/edit-profile',
      name: 'EditProfile',
      component: EditProfile,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "Login" };
  }
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: "CreatorProfile" };
  }
  else {
    return true;
  }
})

export default router