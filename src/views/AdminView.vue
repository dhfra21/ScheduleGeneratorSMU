<template>
  <v-container v-if="isAdminLoggedIn" fluid class="admin-container">
    <!-- Main Content Without Sidebar (Handled by AdminLayout.vue) -->
    <v-main class="admin-content">
      <v-container fluid>
        <v-card class="pa-4 elevation-2">
          <v-card-title class="text-h5 font-weight-bold mb-4" style="color: #1e293b;">
            {{ currentView === 'courses' ? 'Manage Courses' : 'Dashboard Overview' }}
          </v-card-title>

          <v-card-text>
            <div v-if="currentView === 'courses'" class="table-container">
              <ManageCourses />
            </div>
          </v-card-text>

          <!-- Logout Button -->
          
        </v-card>
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ManageCourses from "@/components/ManageCourses.vue";

const router = useRouter();
const currentView = ref("courses");
const isAdminLoggedIn = ref(localStorage.getItem("isAdminLoggedIn") === "true");


onMounted(() => {
  if (!isAdminLoggedIn.value) {
    router.push("/login");
  }
});
</script>

<style scoped>
/* Ensure full screen layout */
.admin-container {
  display: flex;
  height: 100vh;
}

/* Fix sidebar spacing */
.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px; /* No margin-left since AdminLayout.vue handles it */
}

/* Prevent table overflow */
.table-container {
  max-height: 75vh;
  overflow-y: auto;
  padding: 0 10px;
}
</style>
