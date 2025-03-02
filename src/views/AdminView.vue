<!-- views/AdminView.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter for navigation
import AdminSidebar from '@/components/AdminSidebar.vue';
import ManageCourses from '@/components/ManageCourses.vue';

const router = useRouter();
const currentView = ref('courses');
const isAdminLoggedIn = ref(localStorage.getItem('isAdminLoggedIn') === 'true');

// Logout function
const logout = () => {
  localStorage.removeItem('isAdminLoggedIn');
  isAdminLoggedIn.value = false;
  router.push('/login'); // Redirect to login page after logout
};

onMounted(() => {
  if (!isAdminLoggedIn.value) {
    router.push('/login'); // Redirect to login if not authenticated
  }
});
</script>

<template>
  <v-container v-if="isAdminLoggedIn" fluid class="admin-container d-flex">
    <!-- Admin Sidebar Navigation -->
    <AdminSidebar @navigate="(view) => { currentView = view; console.log('Navigated to:', view); }" />

    <v-main class="admin-content pa-6">
      <v-card class="pa-4 elevation-2">
        <!-- Dynamic Content Based on Current View -->
        <v-card-title class="text-h5 font-weight-bold mb-4" style="color: #1e293b;">
          {{ currentView === 'courses' ? 'Manage Courses' : 'Dashboard Overview' }}
        </v-card-title>

        <v-card-text>
          <div v-if="currentView === 'courses'">
            <ManageCourses />
            <p class="text-caption">Rendering ManageCourses (currentView: {{ currentView }})</p>
          </div>
          <div v-else-if="currentView === 'dashboard'">
            <h2 class="text-h6">Dashboard Overview</h2>
            <p>Coming soon...</p>
            <p class="text-caption">Rendering Dashboard (currentView: {{ currentView }})</p>
          </div>
          <div v-else>
            <h2 class="text-h5">Unknown View</h2>
            <p>Current view is '{{ currentView }}'. Please check navigation.</p>
            <p class="text-caption">Rendering Unknown (currentView: {{ currentView }})</p>
          </div>
        </v-card-text>

        <!-- Logout Button -->
        <v-btn
          color="error"
          variant="outlined"
          size="small"
          class="mt-4"
          @click="logout"
          aria-label="Logout of Admin Panel"
        >
          Logout
        </v-btn>
      </v-card>
    </v-main>
  </v-container>

  <v-container v-else class="fill-height d-flex align-center justify-center">
    <v-card class="pa-4 elevation-2">
      <v-card-text>
        <h2 class="text-h5">Access Denied</h2>
        <p>Please log in as an admin to access this page.</p>
        <v-btn color="primary" @click="router.push('/login')" aria-label="Navigate to Admin Login">
          Go to Login
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.admin-container {
  height: 100vh;
  display: flex;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
}
</style>