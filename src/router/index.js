import { createRouter, createWebHistory } from 'vue-router';
import SchedulerView from '@/views/SchedulerView.vue';
import HomeView from '@/views/HomeView.vue';
import CoursesView from '@/views/CoursesView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Home - University Scheduler' }
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: SchedulerView,
    meta: { title: 'Schedule Builder' }
  },
  {
    path: '/courses',
    name: 'courses',
    component: CoursesView,
    meta: { title: 'Course Catalog' }
  },
  // Optional: Add a catch-all route for 404 pages
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  }
});

// Update document title on route change
router.beforeEach((to, from, next) => {
  const title = to.meta.title || 'University Scheduler';
  document.title = title;
  next();
});

export default router;