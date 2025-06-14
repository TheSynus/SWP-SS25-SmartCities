import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardEditView from '../views/DashboardEditView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: DashboardEditView,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    }
  ],
})

export default router
