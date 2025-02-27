<script setup>
import { ref } from 'vue';

const props = defineProps({
  selectedCourses: Array
});

const optimizationOptions = ref({
  minimizeGaps: true,
  maximizeSleep: false,
  maximizeDaysOff: false,
  minimizeCourses: false,
  minimizeCertificationPeriods: false
});
</script>

<template>
  <v-container>
    <v-card class="pa-6 elevation-4">
      <v-card-title class="text-h5 font-weight-bold">⚙️ Optimization Options</v-card-title>
      <v-card-subtitle>Choose your preferences for schedule generation</v-card-subtitle>

      <v-list class="mt-3">
        <v-list-item v-for="(value, option) in optimizationOptions" :key="option">
          <v-checkbox v-model="optimizationOptions[option]" :label="option.replace(/([A-Z])/g, ' $1')"></v-checkbox>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>
