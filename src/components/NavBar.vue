<!-- components/NavBar.vue -->
<template>
    <!-- Global Navbar -->
<v-app-bar color="primary" density="compact">
  <v-container class="d-flex align-center">
    <!-- Left: Page Title -->
    <span class="text-h6 text-white">{{ currentTitle }}</span>

    <v-spacer></v-spacer> <!-- Pushes user info to the right -->

    <!-- Right: User Info -->
    <div class="d-flex align-center">
      <span class="text-h6 mr-2">Place Holder User</span>
      <v-avatar size="40">
        <img src="" alt="Profile">
      </v-avatar>
    </div>
  </v-container>
</v-app-bar>
  </template>
  
  <script setup>
  // Component logic (if needed) can go here
import { ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentTitle = ref('');

// Watch for route changes and update title dynamically
watchEffect(() => {
currentTitle.value = route.meta.title || 'Unknown Page';
});
  </script>
  
  <style scoped>
  .v-btn {
    min-width: 120px; /* Adjust as needed */
  }
  
  .v-btn--active {
    font-weight: 600;
  }
  </style>