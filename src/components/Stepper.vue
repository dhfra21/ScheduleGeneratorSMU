<script setup>
import { ref } from 'vue';
import CourseSelection from './CourseSelection.vue';
import ScheduleOptimization from './ScheduleOptimization.vue';

const steps = ['Courses', 'Options', 'Schedules'];
const currentStep = ref(0);
const selectedCourses = ref([]);
const optimizationOptions = ref({
  minimizeGaps: true,
  maximizeSleep: false,
  maximizeDaysOff: false,
  minimizeCourses: false,
  minimizeCertificationPeriods: false
});
const generatedSchedules = ref([]);

// Handle course selection confirmation
const handleConfirmCourses = (courses) => {
  selectedCourses.value = courses;
  currentStep.value = 1; // Move to next step
};

// Generate schedules (mocked for now)
const generateSchedules = () => {
  generatedSchedules.value = [
    {
      courses: selectedCourses.value,
      days: ['Mon 08:00-12:00', 'Fri 09:00-11:00'],
      gaps: 1
    }
  ];
  currentStep.value = 2;
};
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6 elevation-4" width="800" rounded="lg">
      <!-- Stepper -->
      <v-stepper v-model="currentStep" alt-labels>
        <v-stepper-header>
          <v-stepper-item :complete="currentStep > 0" step="1">Courses</v-stepper-item>
          <v-divider></v-divider>
          <v-stepper-item :complete="currentStep > 1" step="2">Options</v-stepper-item>
          <v-divider></v-divider>
          <v-stepper-item step="3">Schedules</v-stepper-item>
        </v-stepper-header>

        <v-stepper-window>
          <!-- Step 1: Course Selection -->
          <v-stepper-window-item :value="0">
            <CourseSelection @confirm-selection="handleConfirmCourses" />
          </v-stepper-window-item>

          <!-- Step 2: Optimization Options -->
          <v-stepper-window-item :value="1">
            <ScheduleOptimization :selectedCourses="selectedCourses" />
          </v-stepper-window-item>

          <!-- Step 3: Generated Schedules -->
          <v-stepper-window-item :value="2">
            <v-container>
              <v-card class="pa-6 elevation-4">
                <v-card-title class="text-h5 font-weight-bold">📅 Generated Schedules</v-card-title>
                <v-card-subtitle>Review the best schedule options</v-card-subtitle>

                <v-list class="mt-3">
                  <v-list-item v-for="(schedule, index) in generatedSchedules" :key="index">
                    <v-card class="pa-3 mb-3" variant="outlined">
                      <v-card-title class="text-body-1 font-weight-medium">
                        {{ schedule.courses.join(', ') }}
                      </v-card-title>
                      <v-card-subtitle>
                        <span class="font-weight-bold">Days:</span> {{ schedule.days.join(', ') }}
                        | <span class="font-weight-bold">Gaps:</span> {{ schedule.gaps }}
                      </v-card-subtitle>
                    </v-card>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-container>
          </v-stepper-window-item>
        </v-stepper-window>
      </v-stepper>

      <!-- Navigation Buttons -->
      <v-card-actions class="d-flex justify-between mt-4">
        <v-btn v-if="currentStep > 0" @click="currentStep--" variant="tonal">Back</v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="currentStep === 1" color="primary" @click="generateSchedules">Generate</v-btn>
        <v-btn v-else-if="currentStep < 2" color="primary" @click="currentStep++">Continue</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
