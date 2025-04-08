<template>
    <v-app-bar app color="primary" density="comfortable">
      <v-app-bar-title>
        <v-btn
          variant="text"
          :to="{ name: 'home' }"
          class="d-flex align-center pa-0"
          style="text-transform: none; color: inherit;"
          aria-label="Navigate to University Scheduler Home"
        >
          <v-icon icon="mdi-calendar-clock" class="mr-2"></v-icon>
          <span class="app-title">SMU University Scheduler</span>
        </v-btn>
      </v-app-bar-title>
  
      <v-spacer></v-spacer>
  
      <v-btn
        variant="text"
        :to="{ name: 'schedule' }"
        :active-class="'text-white'"
        class="mx-2 d-flex align-center justify-center nav-btn"
        aria-label="Navigate to Schedule Builder"
      >
        <v-icon icon="mdi-calendar-edit" class="mr-2"></v-icon>
        <span>Schedule Builder</span>
      </v-btn>
  
      <v-btn
        variant="text"
        :to="{ name: 'courses' }"
        :active-class="'text-white'"
        class="mx-2 d-flex align-center justify-center nav-btn"
        aria-label="Navigate to Course Catalog"
      >
        <v-icon icon="mdi-book-multiple" class="mr-2"></v-icon>
        <span>Course Catalog</span>
      </v-btn>
  
      <template v-if="!authStore.isAuthenticated">
        <v-btn
          variant="text"
          :to="{ name: 'user-login' }"
          class="mx-2 d-flex align-center justify-center nav-btn"
          aria-label="Navigate to User Login"
        >
          <v-icon icon="mdi-account" class="mr-2"></v-icon>
          <span>Login</span>
        </v-btn>
      </template>
  
      <template v-else>
        <v-btn
          variant="text"
          @click="handleLogout"
          class="mx-2 d-flex align-center justify-center nav-btn"
          aria-label="Logout"
        >
          <v-icon icon="mdi-logout" class="mr-2"></v-icon>
          <span>Logout</span>
        </v-btn>
      </template>
  
      <template v-if="authStore.isAdmin">
        <v-btn
          variant="text"
          :to="{ name: 'admin' }"
          class="mx-2 d-flex align-center justify-center nav-btn"
          aria-label="Navigate to Admin Panel"
        >
          <v-icon icon="mdi-shield-account" class="mr-2"></v-icon>
          <span>Admin Panel</span>
        </v-btn>
      </template>
  
      <template v-if="authStore.isAuthenticated && !authStore.isAdmin">
        <v-btn
          variant="text"
          @click="showAIChat = true"
          class="mx-2 d-flex align-center justify-center nav-btn"
          aria-label="Open AI Course Advisor"
        >
          <v-icon icon="mdi-robot" class="mr-2"></v-icon>
          <span>AI Advisor</span>
        </v-btn>
        <ScheduleNotificationIcon class="mx-2" />
      </template>
    </v-app-bar>
    <AIChatDialog v-model="showAIChat" />
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import ScheduleNotificationIcon from './ScheduleNotificationIcon.vue';
  import AIChatDialog from './AIChatDialog.vue';
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  const handleLogout = () => {
    authStore.logout();
    router.push('/');
  };
  
  const showAIChat = ref(false);
  
  // Initialize auth state when component mounts
  onMounted(() => {
    authStore.initializeAuth();
  });
  </script>
  
  <style scoped>
  /* Improve typography and spacing */
  .app-title {
    font-size: 1.5rem; /* Slightly larger for prominence */
    font-weight: 600; /* Bold for emphasis */
    letter-spacing: -0.5px; /* Tighter letter spacing */
  }
  
  .v-btn {
    min-width: 120px; /* Adjust as needed */
    font-size: 1rem; /* Consistent font size */
    font-weight: 500; /* Medium weight for readability */
    letter-spacing: 0.5px; /* Slightly spaced letters */
    transition: all 0.3s ease; /* Smooth transitions */
  }
  
  /* Hover effects for buttons */
  .v-btn:hover {
    opacity: 0.9; /* Slight fade on hover */
    transform: translateY(-2px); /* Lift effect */
  }
  
  /* Active state styling */
  .v-btn--active {
    font-weight: 600; /* Bold for active state */
    color: inherit; /* Inherit theme color */
  }
  
  /* Ensure the title button blends seamlessly */
  .v-btn span {
    font-size: 1.25rem; /* Match default app-bar-title size */
  }
  
  /* Spacing and alignment for nav buttons */
  .nav-btn {
    padding: 8px 12px; /* Comfortable padding */
    border-radius: 4px; /* Subtle rounded corners */
  }
  
  /* Icon styling */
  .v-icon {
    font-size: 1.2rem; /* Slightly larger icons */
    transition: transform 0.3s ease; /* Smooth icon transitions */
  }
  
  .v-btn:hover .v-icon {
    transform: scale(1.1); /* Slightly enlarge icons on hover */
  }
  </style>