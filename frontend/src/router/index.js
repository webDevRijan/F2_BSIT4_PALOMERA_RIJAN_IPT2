import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/events/:id',
      name: 'event-details',
      component: () => import('../views/EventDetailsView.vue'),
    },
    {
      path: '/events/:id/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/registration-success',
      name: 'registration-success',
      component: () => import('../views/SuccessView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
