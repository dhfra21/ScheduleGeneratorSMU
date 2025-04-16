<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from 'vuetify';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const theme = useTheme();

const themeIcon = computed(() => theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night');

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
  localStorage.setItem('theme', theme.global.name.value);
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};

const navigate = (route) => {
  router.push(`/admin/${route}`);
};
</script>

<template>
  <v-navigation-drawer
    app
    permanent
    class="admin-sidebar"
    width="250"
    :style="{ background: `linear-gradient(135deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-background)) 100%)`, borderRight: `1px solid rgba(var(--v-border-color), 0.12)` }"
  >
    <v-list density="compact" nav>
      <v-list-item
        v-for="item in [
          { title: 'Dashboard', icon: 'mdi-view-dashboard', route: 'dashboard' },
          { title: 'Manage Courses', icon: 'mdi-book', route: 'courses' },
          { title: 'Schedule Requests', icon: 'mdi-calendar-check', route: 'schedule-requests' }
        ]"
        :key="item.route"
        @click="navigate(item.route)"
        link
        class="sidebar-item"
        :class="{ 'selected': route.path.includes(`/admin/${item.route}`) }"
      >
        <template v-slot:prepend>
          <v-icon :size="20" :color="route.path.includes(`/admin/${item.route}`) ? 'white' : 'grey-darken-2'">
            {{ item.icon }}
          </v-icon>
        </template>
        <v-list-item-content>
          <v-list-item-title class="text-body-2 font-weight-medium" :class="{ 'active-title': route.path.includes(`/admin/${item.route}`) }">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      
      <!-- Theme Toggle Button -->
      <v-divider class="my-3"></v-divider>
      <v-list-item
        class="sidebar-item theme-toggle"
        @click="toggleTheme"
      >
        <template v-slot:prepend>
          <v-icon :icon="themeIcon" size="20" color="grey-darken-2"></v-icon>
        </template>
        <v-list-item-content>
          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ theme.global.current.value.dark ? 'Light Mode' : 'Dark Mode' }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <!-- Logout Button -->
      <v-divider class="my-3"></v-divider>
      <v-list-item
        class="sidebar-item logout-btn"
        @click="logout"
      >
        <template v-slot:prepend>
          <v-icon size="20" color="red-darken-2">mdi-logout</v-icon>
        </template>
        <v-list-item-content>
          <v-list-item-title class="text-body-2 font-weight-medium" style="color: red;">
            Logout
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.admin-sidebar {
  transition: width 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar-item {
  border-radius: 8px;
  margin: 4px 8px;
  padding: 12px 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-on-surface));
}

.sidebar-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
  transform: translateX(5px);
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.sidebar-item.selected {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary)) !important;
  border-left: 4px solid rgb(var(--v-theme-primary-darken-1));
  padding-left: 12px;
}

.sidebar-item.selected .v-icon {
  color: rgb(var(--v-theme-on-primary)) !important;
}

.active-title {
  color: rgb(var(--v-theme-on-primary)) !important;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.theme-toggle:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
}
</style>