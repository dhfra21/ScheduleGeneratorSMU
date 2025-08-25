// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import UserLayout from '@/layouts/UserLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useAuthStore } from '@/stores/auth';

// User-facing views
import HomeView from '@/views/HomeView.vue';
import SchedulerView from '@/views/SchedulerView.vue';
import CoursesView from '@/views/CoursesView.vue';
import Login from '@/views/Login.vue';
import UserRegistration from '@/views/UserRegistration.vue';

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
        meta: { 
          title: 'Schedule Builder',
          requiresAuth: true 
        },
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
        component: Login,
        meta: { 
          title: 'Login - University Scheduler',
          requiresGuest: true
        },
      },
      {
        path: 'register',
        name: 'register',
        component: UserRegistration,
        meta: { 
          title: 'User Registration - University Scheduler',
          requiresGuest: true
        },
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
          requiresAuth: true,
          requiresAdmin: true
        },
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: AdminView,
        meta: {
          title: 'Admin Dashboard - University Scheduler',
          requiresAuth: true,
          requiresAdmin: true
        },
      },
      {
        path: 'courses',
        name: 'admin-courses',
        component: AdminView,
        meta: {
          title: 'Manage Courses - University Scheduler',
          requiresAuth: true,
          requiresAdmin: true
        },
      },
      {
        path: 'schedule-requests',
        name: 'admin-schedule-requests',
        component: AdminView,
        meta: {
          title: 'Schedule Requests - University Scheduler',
          requiresAuth: true,
          requiresAdmin: true
        },
      }
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

// Navigation guard to protect routes
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Initialize auth state if not already done
  if (!authStore.isAuthenticated) {
    authStore.initializeAuth();
  }

  // Update document title
  const title = to.meta.title || 'University Scheduler';
  document.title = title;

  // Handle guest-only routes (login pages)
  if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      // Redirect to appropriate dashboard based on role
      next(authStore.isAdmin ? '/admin' : '/schedule');
    } else {
      next();
    }
    return;
  }

  // Handle protected routes
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Redirect to login page
      next('/login');
      return;
    }

    // Check admin requirement
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next('/schedule');
      return;
    }
  }

  next();
});

export default router;