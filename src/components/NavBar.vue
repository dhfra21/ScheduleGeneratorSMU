<!-- components/NavBar.vue -->
<template>
    <v-app-bar app color="primary" density="comfortable">
      <v-app-bar-title>
        <v-icon icon="mdi-calendar-clock" class="mr-2"></v-icon>
        University Scheduler
      </v-app-bar-title>
  
      <v-spacer></v-spacer>
  
      <v-btn
        variant="text"
        :to="{ name: 'schedule' }"
        :active-class="'text-white'"
        class="mx-2 d-flex align-center justify-center"
      >
        <v-icon icon="mdi-calendar-edit" class="mr-2"></v-icon>
        <span>Schedule Builder</span>
      </v-btn>
  
      <v-btn
        variant="text"
        :to="{ name: 'courses' }"
        :active-class="'text-white'"
        class="mx-2 d-flex align-center justify-center"
      >
        <v-icon icon="mdi-book-multiple" class="mr-2"></v-icon>
        <span>Course Catalog</span>
      </v-btn>
    </v-app-bar>
  </template>
  
  <script setup>
  // Component logic (if needed) can go here
  </script>
  
  <style scoped>
  .v-btn {
    min-width: 120px; /* Adjust as needed */
  }
  
  .v-btn--active {
    font-weight: 600;
  }
  </style>