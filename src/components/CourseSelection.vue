<script setup>
import { ref, onMounted, computed } from 'vue';

// Define the structure for available courses
const availableCourses = ref([]);
const selectedCourses = ref([]);
const newCourse = ref('');
const snackbar = ref(false);
const snackbarText = ref('');

// Load available courses from JSON
onMounted(async () => {
  try {
    const response = await fetch("/courses.json"); // Load from public/
    const data = await response.json();
    
    console.log("Loaded courses data:", data); // Debugging

    if (data && Array.isArray(data.courses)) {
      availableCourses.value = data.courses; // Store full course objects
    } else {
      console.error("Invalid JSON structure (expected 'courses' key):", data);
    }
  } catch (error) {
    console.error("Error loading courses:", error);
  }
});

// Filter available courses based on search input
const filteredCourses = computed(() => {
  if (!newCourse.value) return availableCourses.value;
  return availableCourses.value.filter(course =>
    course.course_code.toLowerCase().includes(newCourse.value.toLowerCase()) ||
    course.course_name.toLowerCase().includes(newCourse.value.toLowerCase())
  );
});

// Add course with feedback
const addCourse = (course) => {
  if (!selectedCourses.value.some(c => c.course_code === course.course_code)) {
    selectedCourses.value.push(course);
    snackbarText.value = `Added ${course.course_code}`;
    snackbar.value = true;
    newCourse.value = '';
  }
};

// Remove course with feedback
const removeCourse = (index) => {
  snackbarText.value = `Removed ${selectedCourses.value[index].course_code}`;
  snackbar.value = true;
  selectedCourses.value.splice(index, 1);
};
</script>

<template>
  <v-container class="d-flex align-center justify-center fill-height">
    <v-card class="pa-6 elevation-5" width="800" rounded="lg">
      <!-- Title Section -->
      <div class="text-center mb-6">
        <v-icon class="mb-4" color="primary" size="64">mdi-book-education-outline</v-icon>
        <v-card-title class="text-h4 font-weight-bold text-primary mb-2">
          Select Your Courses
        </v-card-title>
        <v-card-subtitle class="text-body-1 text-medium-emphasis">
          Add the courses you want to include in your schedule
        </v-card-subtitle>
      </div>

      <!-- Course Input Section -->
      <v-card-text>
        <v-row align="center" class="mb-4">
          <v-col cols="9">
            <v-autocomplete
              v-model="newCourse"
              :items="filteredCourses"
              item-title="course_name"
              item-value="course_code"
              label="Search course code or name"
              variant="outlined"
              density="comfortable"
              bg-color="background"
              hide-details
              single-line
              clearable
              return-object
              @update:modelValue="addCourse"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :title="item.raw.course_name" :subtitle="item.raw.course_code"></v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="3" class="pl-0">
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              block
              @click="addCourse"
            >
              Add Course
            </v-btn>
          </v-col>
        </v-row>

        <!-- Selected Courses -->
        <v-card v-if="selectedCourses.length > 0" class="mt-4 pa-4" variant="outlined">
          <v-card-title class="text-h6 font-weight-medium mb-3">
            Selected Courses
          </v-card-title>
          <v-list>
            <v-list-item
              v-for="(course, index) in selectedCourses"
              :key="course.course_code"
              class="px-0"
            >
              <v-list-item-title class="text-body-1 font-weight-medium">
                {{ course.course_code }} - {{ course.course_name }}
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
          </v-list>
        </v-card>

        <!-- Empty State -->
        <v-alert
          v-if="!selectedCourses.length"
          variant="tonal"
          color="info"
          class="mt-4 d-flex justify-center"
        >
          <div class="d-flex align-center">
            <v-icon icon="mdi-information-outline" class="mr-2"></v-icon>
            <span>No courses selected yet. Start adding courses to generate schedules.</span>
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