<template>
  <v-app-bar app color="primary" elevation="0" class="custom-navbar">
    <!-- Logo and Title -->
    <v-app-bar-title class="d-flex align-center">
      <v-btn
        variant="text"
        :to="{ name: 'home' }"
        class="d-flex align-center pa-0 logo-btn"
        style="text-transform: none; color: inherit;"
        aria-label="Navigate to University Scheduler Home"
      >
        <v-icon icon="mdi-calendar-clock" class="mr-2 logo-icon"></v-icon>
        <span class="app-title">SMU University Scheduler</span>
      </v-btn>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Navigation Links -->
    <div class="nav-links">
      <v-btn
        variant="text"
        :to="{ name: 'schedule' }"
        :active-class="'active-nav-btn'"
        class="nav-btn"
        aria-label="Navigate to Schedule Builder"
      >
        <v-icon icon="mdi-calendar-edit" class="mr-2"></v-icon>
        <span>Schedule Builder</span>
      </v-btn>

      <v-btn
        variant="text"
        :to="{ name: 'courses' }"
        :active-class="'active-nav-btn'"
        class="nav-btn"
        aria-label="Navigate to Course Catalog"
      >
        <v-icon icon="mdi-book-multiple" class="mr-2"></v-icon>
        <span>Course Catalog</span>
      </v-btn>

      <template v-if="!authStore.isAuthenticated">
        <v-btn
          variant="text"
          :to="{ name: 'login' }"
          class="nav-btn"
          aria-label="Navigate to Login"
        >
          <v-icon icon="mdi-account" class="mr-2"></v-icon>
          <span>Login</span>
        </v-btn>
      </template>

      <template v-else>
        <v-btn
          variant="text"
          @click="handleLogout"
          class="nav-btn"
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
          class="nav-btn"
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
          class="nav-btn"
          aria-label="Open AI Course Advisor"
        >
          <v-icon icon="mdi-robot" class="mr-2"></v-icon>
          <span>AI Advisor</span>
        </v-btn>
        <ScheduleNotificationIcon class="notification-icon" />
      </template>
    </div>
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
.custom-navbar {
  background: white !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.logo-btn {
  transition: transform 0.3s ease;
}

.logo-btn:hover {
  transform: translateY(-2px);
}

.logo-icon {
  font-size: 1.8rem;
  transition: transform 0.3s ease;
  color: #1976D2;
}

.logo-btn:hover .logo-icon {
  transform: rotate(15deg);
}

.app-title {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.5px;
  color: #1E293B;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-btn {
  min-width: 120px;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 8px 16px;
  color: #64748B !important;
}

.nav-btn:hover {
  background-color: rgba(0, 0, 0, 0.05) !important;
  transform: translateY(-2px);
  color: #1976D2 !important;
}

.nav-btn .v-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  color: #64748B;
}

.nav-btn:hover .v-icon {
  transform: scale(1.1);
  color: #1976D2;
}

.active-nav-btn {
  background-color: #EFF6FF !important;
  color: #1976D2 !important;
  font-weight: 600;
}

.active-nav-btn .v-icon {
  color: #1976D2 !important;
}

.notification-icon {
  margin-left: 8px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .nav-links {
    gap: 2px;
  }
  
  .nav-btn {
    min-width: 100px;
    padding: 6px 12px;
  }
  
  .app-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 600px) {
  .nav-links {
    display: none;
  }
  
  .app-title {
    font-size: 1.1rem;
  }
}
</style>