// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import UserLayout from '@/layouts/UserLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';

// User-facing views
import HomeView from '@/views/HomeView.vue';
import SchedulerView from '@/views/SchedulerView.vue';
import CoursesView from '@/views/CoursesView.vue';
import AdminLogin from '@/views/AdminLogin.vue';

// Admin-facing views
import AdminView from '@/views/AdminView.vue';

const routes = [
  {
    path: '/',
    component: UserLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { title: 'Home - University Scheduler' },
      },
      {
        path: 'schedule',
        name: 'schedule',
        component: SchedulerView,
        meta: { title: 'Schedule Builder' },
      },
      {
        path: 'courses',
        name: 'courses',
        component: CoursesView,
        meta: { title: 'Course Catalog' },
      },
      {
        path: 'login',
        name: 'login',
        component: AdminLogin,
        meta: { title: 'Admin Login - University Scheduler' },
      },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'admin',
        component: AdminView,
        meta: {
          title: 'Admin Panel - University Scheduler',
          requiresAuth: true, // Require admin login to access this route
        },
      },
    ],
  },
  // Catch-all route for 404 pages
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