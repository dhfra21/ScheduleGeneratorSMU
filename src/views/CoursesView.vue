<script setup>
  import { ref, computed, onMounted } from 'vue';
  import CourseCard from '@/components/CourseCard.vue';
  
  const courses = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const search = ref('');
  
  const filteredCourses = computed(() => {
    if (!search.value) return courses.value;
    
    const searchTerm = search.value.toLowerCase();
    return courses.value.filter(course => {
      return (
        course.course_code.toLowerCase().includes(searchTerm) ||
        course.course_name.toLowerCase().includes(searchTerm) ||
        course.major.toLowerCase().includes(searchTerm)
      );
    });
  });
  
  onMounted(async () => {
    try {
      const response = await fetch("/courses.json");
      const data = await response.json();
      
      if (data?.courses) {
        courses.value = data.courses.map(course => ({
          course_code: course.course_code,
          course_name: course.course_name,
          major: course.major || 'General',
          year: course.year || 'N/A',
          credits: course.credits || 0
        }));
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  });
  </script>
<template>
    <v-container class="fill-height">
      <v-card class="pa-6 elevation-4" width="100%">
        <v-card-title class="text-h4 font-weight-bold mb-4">
          <v-icon color="primary" size="40" class="mr-2">mdi-book-multiple</v-icon>
          Course Catalog
        </v-card-title>
        
        <v-text-field
          v-model="search"
          label="Search courses..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          class="mb-6"
        ></v-text-field>
  
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
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <CourseCard :course="course" />
          </v-col>
  
          <v-col v-if="!filteredCourses.length" cols="12">
            <v-alert
              type="info"
              variant="tonal"
              class="text-center"
            >
              No courses found matching your search criteria
            </v-alert>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </template>
  
  