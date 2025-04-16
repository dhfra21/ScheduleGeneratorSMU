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
        class="nav-btn schedule-btn"
        aria-label="Navigate to Schedule Builder"
      >
        <v-icon icon="mdi-calendar-edit" class="mr-2"></v-icon>
        <span>Schedule Builder</span>
      </v-btn>

      <v-btn
        variant="text"
        :to="{ name: 'courses' }"
        :active-class="'active-nav-btn'"
        class="nav-btn courses-btn"
        aria-label="Navigate to Course Catalog"
      >
        <v-icon icon="mdi-book-multiple" class="mr-2"></v-icon>
        <span>Course Catalog</span>
      </v-btn>

      <template v-if="!authStore.isAuthenticated">
        <v-btn
          variant="text"
          :to="{ name: 'login' }"
          class="nav-btn login-btn"
          aria-label="Navigate to Login"
        >
          <v-icon icon="mdi-account" class="mr-2"></v-icon>
          <span>Login</span>
        </v-btn>
        <v-btn
          variant="text"
          @click="toggleTheme"
          class="nav-btn theme-toggle"
          aria-label="Toggle Theme"
          icon
        >
          <v-icon :icon="themeIcon"></v-icon>
        </v-btn>
      </template>

      <template v-else>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              variant="text"
              v-bind="props"
              class="nav-btn"
              aria-label="User Menu"
            >
              <v-icon icon="mdi-account" class="mr-2"></v-icon>
              <span>{{ authStore.user?.name || 'User' }}</span>
            </v-btn>
          </template>

          <v-list>
            <v-list-item :to="{ name: 'profile' }">
              <template v-slot:prepend>
                <v-icon icon="mdi-account-cog" class="mr-2"></v-icon>
              </template>
              <v-list-item-title>Profile Settings</v-list-item-title>
            </v-list-item>
            <v-list-item :to="{ name: 'settings' }">
              <template v-slot:prepend>
                <v-icon icon="mdi-cog" class="mr-2"></v-icon>
              </template>
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleLogout">
              <template v-slot:prepend>
                <v-icon icon="mdi-logout" class="mr-2"></v-icon>
              </template>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          variant="text"
          @click="toggleTheme"
          class="nav-btn theme-toggle"
          aria-label="Toggle Theme"
          icon
        >
          <v-icon :icon="themeIcon"></v-icon>
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
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from 'vuetify';
import ScheduleNotificationIcon from './ScheduleNotificationIcon.vue';
import AIChatDialog from './AIChatDialog.vue';

const router = useRouter();
const authStore = useAuthStore();
const theme = useTheme();
const showAIChat = ref(false);

const themeIcon = computed(() => theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night');
const themeText = computed(() => theme.global.current.value.dark ? 'Light Mode' : 'Dark Mode');

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
  localStorage.setItem('theme', theme.global.name.value);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

// Initialize auth state when component mounts
onMounted(() => {
  authStore.initializeAuth();
  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme.global.name.value = savedTheme;
  }
});
</script>

<style scoped>
.custom-navbar {
  background: rgb(var(--v-theme-surface)) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
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
  color: rgb(var(--v-theme-primary));
}

.logo-btn:hover .logo-icon {
  transform: rotate(15deg);
}

.app-title {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.5px;
  color: rgb(var(--v-theme-on-surface));
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  margin-left: auto;
}

.nav-btn {
  min-width: auto;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 8px 12px;
  color: rgb(var(--v-theme-on-surface)) !important;
  white-space: nowrap;
}

.nav-btn:hover {
  transform: translateY(-2px);
}

.nav-btn .v-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  color: rgb(var(--v-theme-on-surface));
}

.nav-btn:hover .v-icon {
  transform: scale(1.1);
}

/* Schedule Builder button hover */
.schedule-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.schedule-btn:hover .v-icon {
  color: rgb(var(--v-theme-primary));
}

/* Course Catalog button hover */
.courses-btn:hover {
  background-color: rgba(var(--v-theme-success), 0.1) !important;
  color: rgb(var(--v-theme-success)) !important;
}

.courses-btn:hover .v-icon {
  color: rgb(var(--v-theme-success));
}

/* Login/User Settings button hover */
.login-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.login-btn:hover .v-icon {
  color: rgb(var(--v-theme-primary));
}

.active-nav-btn {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
}

.active-nav-btn .v-icon {
  color: rgb(var(--v-theme-primary)) !important;
}

.notification-icon {
  margin-left: 8px;
}

.theme-toggle {
  min-width: 40px !important;
  width: 40px;
  height: 40px;
  padding: 0 !important;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle .v-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  color: rgb(var(--v-theme-on-surface));
}

.theme-toggle:hover .v-icon {
  transform: scale(1.1);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .nav-links {
    gap: 2px;
  }
  
  .nav-btn {
    padding: 6px 8px;
    font-size: 0.85rem;
  }

  .schedule-btn {
    min-width: 120px;
  }

  .courses-btn {
    min-width: 100px;
  }
}

@media (max-width: 600px) {
  .nav-links {
    display: none;
  }
}
</style>