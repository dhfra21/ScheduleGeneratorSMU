<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref } from 'vue';

const emit = defineEmits(['navigate']);
const route = useRoute();
const router = useRouter();
const isAdminLoggedIn = ref(true);

const logout = () => {
  localStorage.removeItem("isAdminLoggedIn");
  isAdminLoggedIn.value = false;
  router.push("/login");
};
</script>

<template>
  <v-navigation-drawer
    app
    permanent
    class="admin-sidebar"
    width="250"
    style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-right: 1px solid #e5e7eb;"
  >
    <v-list density="compact" nav>
      <v-list-item
        v-for="item in [
          { title: 'Dashboard', icon: 'mdi-view-dashboard', route: 'dashboard' },
          { title: 'Manage Courses', icon: 'mdi-book', route: 'courses' }
        ]"
        :key="item.route"
        @click="$emit('navigate', item.route)"
        link
        class="sidebar-item"
        :class="{ 'selected': item.route === route.name }"
      >
        <template v-slot:prepend>
          <v-icon :size="20" :color="item.route === route.name ? 'white' : 'grey-darken-2'">
            {{ item.icon }}
          </v-icon>
        </template>
        <v-list-item-content>
          <v-list-item-title class="text-body-2 font-weight-medium" :class="{ 'active-title': item.route === route.name }">
            {{ item.title }}
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
}

.sidebar-item:hover {
  background: #edf2f7;
  transform: translateX(5px);
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.sidebar-item.selected {
  background: #3b82f6;
  color: white !important;
  border-left: 4px solid #2563eb;
  padding-left: 12px;
}

.sidebar-item.selected .v-icon {
  color: white !important;
}

.v-icon {
  transition: color 0.3s ease;
  margin-right: 12px;
}

.v-list-item__title {
  transition: color 0.3s ease;
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
}

.active-title {
  color: white !important;
}

/* Logout Button */
.logout-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(255, 0, 0, 0.1);
}
</style>
