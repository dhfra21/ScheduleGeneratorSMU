<script setup>
import { ref, computed, onMounted } from 'vue';
import axiosInstance from '@/plugins/axios';
import CourseCard from '@/components/CourseCard.vue';

const API_URL = '/courses'; // Remove the base URL since it's in the axios instance

const courses = ref([]);
const loading = ref(true);
const error = ref(null);
const search = ref('');
const selectedMajor = ref('All');
const selectedYear = ref('All');

const majorOptions = computed(() => {
  const majors = new Set(courses.value.map(course => course.major));
  return ['All', ...Array.from(majors).sort()];
});

const yearOptions = computed(() => {
  const years = new Set(courses.value.map(course => course.year));
  return ['All', ...Array.from(years).sort()];
});

const filteredCourses = computed(() => {
  let result = courses.value;
  if (search.value) {
    const searchTerm = search.value.toLowerCase();
    result = result.filter(course => 
      course.course_code.toLowerCase().includes(searchTerm) ||
      course.course_name.toLowerCase().includes(searchTerm) ||
      course.major.toLowerCase().includes(searchTerm)
    );
  }
  if (selectedMajor.value !== 'All') {
    result = result.filter(course => course.major === selectedMajor.value);
  }
  if (selectedYear.value !== 'All') {
    result = result.filter(course => course.year === selectedYear.value);
  }
  return result;
});

const fetchCourses = async () => {
  try {
    loading.value = true;
    const response = await axiosInstance.get(API_URL);
    courses.value = response.data.map(course => ({
      course_code: course.course_code,
      course_name: course.course_name,
      major: course.major || 'General',
      year: course.year || 'N/A',
      credits: course.credits || 0,
      groups: course.groups || []
    }));
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCourses);
</script>

<template>
  <v-container class="fill-height">
    <v-card class="pa-6 elevation-4" width="100%">
      <v-card-title class="text-h4 font-weight-bold mb-4">
        <v-icon color="primary" size="40" class="mr-2">mdi-book-multiple</v-icon>
        Course Catalog
        <!-- Add a refresh button -->
        <v-btn
          icon="mdi-refresh"
          variant="text"
          color="primary"
          @click="fetchCourses"
          class="ml-2"
        ></v-btn>
      </v-card-title>
      
      <!-- Search and filters -->
      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="Search courses..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="selectedMajor"
            :items="majorOptions"
            label="Filter by Major"
            variant="outlined"
            prepend-inner-icon="mdi-briefcase-outline"
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="selectedYear"
            :items="yearOptions"
            label="Filter by Year"
            variant="outlined"
            prepend-inner-icon="mdi-calendar-outline"
          ></v-select>
        </v-col>
      </v-row>
      
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
        class="mb-4"
      ></v-progress-linear>
      
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        Error loading courses: {{ error }}
      </v-alert>
      
      <v-row v-if="!loading && !error">
        <v-col
          v-for="course in filteredCourses"
          :key="course.course_code"
          cols="12" sm="6" md="4" lg="3"
        >
          <CourseCard :course="course" />
        </v-col>
        
        <v-col v-if="!filteredCourses.length" cols="12">
          <v-alert
            type="info"
            variant="tonal"
            class="text-center"
          >
            No courses found matching your filter criteria
          </v-alert>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>