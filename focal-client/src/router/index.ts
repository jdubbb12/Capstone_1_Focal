import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../stores/auth'
import { installAuthGuards } from './guards'
const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', alias: '/signup', name: 'Signup', component: () => import('../views/Signup.vue'), meta: { guestOnly: true } },
    { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { guestOnly: true } },
    { path: '/feed', name: 'InspirationFeed', component: () => import('../views/InspirationFeed.vue'), meta: { requiresAuth: true } },
    { path: '/profile', name: 'CreatorProfile', component: () => import('../views/CreatorProfile.vue'), meta: { requiresAuth: true } },
    { path: '/boards', name: 'BoardManagement', component: () => import('../views/BoardManagement.vue'), meta: { requiresAuth: true } },
    { path: '/2d', name: 'TwoDView', component: () => import('../views/TwoDView.vue'), meta: { requiresAuth: true } },
    { path: '/edit-profile', name: 'EditProfile', component: () => import('../views/EditProfile.vue'), meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
installAuthGuards(router, auth)
export default router