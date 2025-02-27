import { createRouter, createWebHistory } from 'vue-router';
import SchedulerView from '@/views/SchedulerView.vue';
import HomeView from '@/views/HomeView.vue'; // Optional home page
import CoursesView from '../views/CoursesView.vue';

const routes = [
  { path: '/', component: HomeView }, // Optional: Landing page
  { path: '/schedule', component: SchedulerView }, // Main stepper view
  {path: '/courses',name: 'courses',component: CoursesView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
