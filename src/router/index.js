import { createRouter, createWebHistory } from 'vue-router';
import SchedulerView from '@/views/SchedulerView.vue';
import HomeView from '@/views/HomeView.vue';
import CoursesView from '@/views/CoursesView.vue';
import AdminView from '@/views/AdminView.vue'; // Import Admin Panel
import AdminLogin from '@/views/AdminLogin.vue'; // Import the Login view

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Home - University Scheduler' },
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: SchedulerView,
    meta: { title: 'Schedule Builder' },
  },
  {
    path: '/courses',
    name: 'courses',
    component: CoursesView,
    meta: { title: 'Course Catalog' },
  },
  {
    path: '/login',
    name: 'login',
    component: AdminLogin,
    meta: { title: 'Admin Login - University Scheduler' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { 
      title: 'Admin Panel - University Scheduler',
      requiresAuth: true, // Require admin login to access this route
    },
  },
  // Optional: Add a catch-all route for 404 pages
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

// Navigation guard to protect the admin route
router.beforeEach((to, from, next) => {
  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

  // Check if the route requires authentication
  if (to.meta.requiresAuth && !isAdminLoggedIn) {
    next('/login');
  } else {
    // Update document title
    const title = to.meta.title || 'University Scheduler';
    document.title = title;
    next();
  }
});

export default router;