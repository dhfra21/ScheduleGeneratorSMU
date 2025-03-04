<template>
  <v-app-bar app color="primary" density="comfortable">
    <v-app-bar-title>
      <v-btn
        variant="text"
        :to="{ name: 'home' }"
        class="d-flex align-center pa-0"
        style="text-transform: none; color: inherit;"
        aria-label="Navigate to University Scheduler Home"
      >
        <v-icon icon="mdi-calendar-clock" class="mr-2"></v-icon>
        <span>University Scheduler</span>
      </v-btn>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn
      variant="text"
      :to="{ name: 'schedule' }"
      :active-class="'text-white'"
      class="mx-2 d-flex align-center justify-center"
      aria-label="Navigate to Schedule Builder"
    >
      <v-icon icon="mdi-calendar-edit" class="mr-2"></v-icon>
      <span>Schedule Builder</span>
    </v-btn>

    <v-btn
      variant="text"
      :to="{ name: 'courses' }"
      :active-class="'text-white'"
      class="mx-2 d-flex align-center justify-center"
      aria-label="Navigate to Course Catalog"
    >
      <v-icon icon="mdi-book-multiple" class="mr-2"></v-icon>
      <span>Course Catalog</span>
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped>
.v-btn {
  min-width: 120px; /* Adjust as needed */
}

.v-btn--active {
  font-weight: 600;
}

/* Ensure the title button blends seamlessly */
.v-btn span {
  font-size: 1.25rem; /* Match default app-bar-title size */
}
</style>