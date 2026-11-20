import { createRouter, createWebHistory } from 'vue-router'
import InspirationFeed from '../views/InspirationFeed.vue'
import CreatorProfile from '../views/CreatorProfile.vue'
import BoardManagement from '../views/BoardManagement.vue'
import TwoDView from '../views/TwoDView.vue'
import FocalSignup from '../views/FocalSignup.vue'
import FocalLogin from '../views/FocalLogin.vue'
import EditProfile from '../views/EditProfile.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Signup',
      component: FocalSignup
    },
    {
      path: '/login',
      name: 'Login',
      component: FocalLogin
    },
    {
      path: '/feed',
      name: 'InspirationFeed',
      component: InspirationFeed
    },
    {
      path: '/profile',
      name: 'CreatorProfile',
      component: CreatorProfile
    },
    {
      path: '/boards',
      name: 'BoardManagement',
      component: BoardManagement
    },
    {
      path: '/2d',
      name: 'TwoDView',
      component: TwoDView
    },
    {
      path: '/edit-profile',
      name: 'EditProfile',
      component: EditProfile
    }
  ]
})

export default router