<script setup>
import { ref } from 'vue';

const availableCourses = ref(["INF1007", "MTH1101", "PHY2003", "ENG1010"]);
const selectedCourses = ref([]);
const newCourse = ref('');
const snackbar = ref(false);
const snackbarText = ref('');

// Add course with feedback
const addCourse = () => {
  if (newCourse.value.trim() && !selectedCourses.value.includes(newCourse.value)) {
    selectedCourses.value.push(newCourse.value.trim());
    snackbarText.value = `Added ${newCourse.value}`;
    snackbar.value = true;
    newCourse.value = '';
  }
};

// Remove course with feedback
const removeCourse = (index) => {
  snackbarText.value = `Removed ${selectedCourses.value[index]}`;
  snackbar.value = true;
  selectedCourses.value.splice(index, 1);
};
</script>

<template>
  <v-container class="d-flex align-center justify-center fill-height">
    <v-card class="pa-8 elevation-5" width="600" rounded="lg">
      <!-- Title Section -->
      <div class="text-center mb-4">
        <v-icon class="mb-4" color="primary" size="64">mdi-book-education-outline</v-icon>
        <v-card-title class="text-h4 font-weight-bold text-primary mb-2">
          Course Selection
        </v-card-title>
        <v-card-subtitle class="text-body-1 text-medium-emphasis">
          Add your preferred courses to generate optimal schedules
        </v-card-subtitle>
      </div>

      <!-- Course Input Section -->
      <v-card-text>
        <v-row align="center" class="mb-2">
          <v-col cols="9">
            <v-autocomplete
              v-model="newCourse"
              :items="availableCourses"
              label="Search course code"
              variant="solo"
              density="comfortable"
              bg-color="background"
              hide-details
              single-line
            ></v-autocomplete>
          </v-col>
          <v-col cols="3" class="pl-0">
  <v-btn
    color="primary"
    variant="flat"
    size="large"
    icon
    elevation="2"
    @click="addCourse"
  >
    <v-icon>mdi-plus</v-icon>
  </v-btn>
</v-col>
        </v-row>

        <!-- Selected Courses -->
        <v-slide-y-transition group>
          <v-card
            v-for="(course, index) in selectedCourses"
            :key="course"
            class="mb-2"
            variant="outlined"
          >
            <v-list-item class="px-4">
              <v-list-item-title class="text-body-1 font-weight-medium">
                {{ course }}
              </v-list-item-title>
              <template v-slot:append>
                <v-btn
                  variant="text"
                  color="error"
                  icon="mdi-close"
                  @click="removeCourse(index)"
                ></v-btn>
              </template>
            </v-list-item>
          </v-card>
        </v-slide-y-transition>

        <!-- Empty State -->
        <v-alert
  v-if="!selectedCourses.length"
  variant="tonal"
  color="info"
  class="mt-4 d-flex justify-center"
>
  <div class="d-flex align-center">
    <v-icon icon="mdi-information-outline" class="mr-2"></v-icon>
    <span>No courses selected. Start adding courses to generate schedules.</span>
  </div>
</v-alert>
      </v-card-text>

      <!-- Action Button -->
    
    </v-card>

    <!-- Notification -->
    <v-snackbar
      v-model="snackbar"
      location="top"
      :timeout="2000"
      color="success"
      elevation="8"
    >
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>