import { createRouter, createWebHistory } from 'vue-router';
import SchedulerView from '@/views/SchedulerView.vue';
import HomeView from '@/views/HomeView.vue'; // Optional home page

const routes = [
  { path: '/', component: HomeView }, // Optional: Landing page
  { path: '/schedule', component: SchedulerView } // Main stepper view
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
