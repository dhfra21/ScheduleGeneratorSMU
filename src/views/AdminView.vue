<template>
  <v-container v-if="authStore.isAdmin" fluid class="admin-container">
    <!-- Title outside any card -->
    <h1 class="text-h5 font-weight-bold mb-4 page-title">
      {{ currentView === 'dashboard' ? 'Dashboard' : 
         currentView === 'courses' ? 'Manage Courses' : 
         currentView === 'schedule-requests' ? 'Schedule Requests' : '' }}
    </h1>

    <!-- Main Content Without Extra Cards -->
    <v-main class="admin-content">
      <v-container fluid>
        <ManageCourses v-if="currentView === 'courses'" />
        <ManageScheduleRequests v-if="currentView === 'schedule-requests'" />
        <div v-if="currentView === 'dashboard'" class="dashboard-content">
          <h2>Welcome to the Admin Dashboard</h2>
          <p>Select an option from the sidebar to get started.</p>
        </div>
      </v-container>
    </v-main>
  </v-container>

  <!-- Access Denied View -->
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

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import ManageCourses from "@/components/ManageCourses.vue";
import ManageScheduleRequests from "@/components/ManageScheduleRequests.vue";

const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
});

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

onMounted(() => {
  if (!authStore.isAdmin) {
    router.push("/login");
  }
});
</script>

<style scoped>
/* Styling for the page title */
.page-title {
  color: #1e293b;
  padding-left: 16px;
}

/* Ensure full screen layout */
.admin-container {
  display: flex;
  height: 100vh;
  flex-direction: column;
}

/* Main content area */
.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.dashboard-content {
  text-align: center;
  padding: 40px;
}
</style>
