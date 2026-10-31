import { createRouter, createWebHistory } from 'vue-router'
import InspirationFeed from '../views/InspirationFeed.vue'
import CreatorProfile from '../views/CreatorProfile.vue'
import BoardManagement from '../views/BoardManagement.vue'
import TwoDView from '../views/TwoDView.vue'
import Signup from '../views/Signup.vue'
import EditProfile from '../views/EditProfile.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Signup',
      component: Signup
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