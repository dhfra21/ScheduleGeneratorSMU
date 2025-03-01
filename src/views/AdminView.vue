<script setup>
import { ref, onMounted, watch } from 'vue';
import AdminSidebar from '@/components/AdminSidebar.vue';
import ManageCourses from '@/components/ManageCourses.vue'; // ✅ Import Manage Courses

const currentView = ref('courses'); // Default to Manage Courses

// Debug currentView changes
console.log('Initial currentView:', currentView.value);
onMounted(() => {
  console.log('Mounted with currentView:', currentView.value);
});
watch(() => currentView.value, (newValue) => {
  console.log('currentView changed to:', newValue);
});
</script>

<template>
  <v-container fluid class="admin-container d-flex">
    <!-- Sidebar Navigation -->
    <AdminSidebar @navigate="(view) => { currentView = view; console.log('Navigated to:', view); }" />
    
    <v-main class="admin-content pa-6">
      <v-card v-if="currentView === 'courses'" class="pa-4 elevation-2">
        <ManageCourses />
        <p class="text-caption">Rendering ManageCourses (currentView: {{ currentView }})</p>
      </v-card>

      <v-card v-else-if="currentView === 'dashboard'" class="pa-4 elevation-2">
        <h2 class="text-h5">Dashboard Overview</h2>
        <p>Coming soon...</p>
        <p class="text-caption">Rendering Dashboard (currentView: {{ currentView }})</p>
      </v-card>

      <v-card v-else class="pa-4 elevation-2">
        <h2 class="text-h5">Unknown View</h2>
        <p>Current view is '{{ currentView }}'. Please check navigation.</p>
        <p class="text-caption">Rendering Unknown (currentView: {{ currentView }})</p>
      </v-card>
    </v-main>
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