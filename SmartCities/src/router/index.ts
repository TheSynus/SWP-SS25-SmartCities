import { createRouter, createWebHistory } from 'vue-router'
import DashboardEditView from '../views/DashboardEditView.vue'
import MapView from '../views/MapSearchPage.vue'
import CalendarEditView from '../views/CalendarEditView.vue'
import CalendarView from '../views/CalendarEditView.vue'
import MainView from '@/views/MainView.vue'

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
      name: 'main',
      component: MainView,
    },
    {
      path:'/map',
      name:'map',
      component: MapView,
    },
    {
      path: '/calendar',
      name: 'calender',
      component: CalendarEditView,
    }
    ,
      {
      path: '/calendar2',
      name: 'calender2',
      component: CalendarView,
    }
  ],
})

export default router
