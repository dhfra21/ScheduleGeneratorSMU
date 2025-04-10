<<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3000/courses'; // Use '/api/courses' with proxy

const props = defineProps({
  selectedCourses: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['confirm-selection', 'update:selectedCourses']);

const availableCourses = ref([]);
const stagedCourse = ref(null);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

onMounted(async () => {
  try {
    const response = await axios.get(API_URL);
    availableCourses.value = response.data;
  } catch (error) {
    console.error("Error loading courses:", error);
    snackbarText.value = 'Failed to load courses';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
});

const filteredCourses = computed(() => {
  if (!stagedCourse.value || typeof stagedCourse.value === 'object') {
    return availableCourses.value;
  }
  return availableCourses.value.filter(course =>
    course.course_code.toLowerCase().includes(stagedCourse.value.toLowerCase()) ||
    course.course_name.toLowerCase().includes(stagedCourse.value.toLowerCase())
  );
});

const addCourse = () => {
  if (!stagedCourse.value || !stagedCourse.value.course_code) return;

  if (props.selectedCourses.some(c => c.course_code === stagedCourse.value.course_code)) {
    snackbarText.value = `${stagedCourse.value.course_code} is already selected!`;
    snackbarColor.value = 'warning';
    snackbar.value = true;
  } else {
    const updatedCourses = [...props.selectedCourses, stagedCourse.value];
    emit('update:selectedCourses', updatedCourses);
    snackbarText.value = `Added ${stagedCourse.value.course_code}`;
    snackbarColor.value = 'success';
    snackbar.value = true;
    stagedCourse.value = null;
  }
};

const removeCourse = (index) => {
  const updatedCourses = [...props.selectedCourses];
  snackbarText.value = `Removed ${updatedCourses[index].course_code}`;
  snackbarColor.value = 'success';
  snackbar.value = true;
  updatedCourses.splice(index, 1);
  emit('update:selectedCourses', updatedCourses);
};

const confirmSelection = () => {
  emit('confirm-selection', props.selectedCourses);
};
</script>

<template>
  <v-container>
    <v-card-text>
      <v-row align="center" class="mb-4">
        <v-col cols="9">
          <v-autocomplete
            v-model="stagedCourse"
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
            :disabled="!stagedCourse || typeof stagedCourse === 'string'"
          >
            Add Course
          </v-btn>
        </v-col>
      </v-row>

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

    <v-snackbar
      v-model="snackbar"
      location="top"
      :timeout="2000"
      :color="snackbarColor"
      elevation="8"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>