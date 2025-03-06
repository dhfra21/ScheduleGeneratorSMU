<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import EditCourseDialog from '@/components/EditCourseDialog.vue';
import DeleteCourseDialog from '@/components/DeleteCourseDialog.vue';
import AddCourseDialog from '@/components/AddCourseDialog.vue';
import SnackbarNotification from '@/components/SnackbarNotification.vue';

const courses = ref([]);
const loading = ref(true);
const error = ref(null);
const deleteDialog = ref(false);
const editDialog = ref(false);
const addDialog = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const searchQuery = ref(''); // Search input
const courseToDelete = ref(null);
const courseToEdit = ref(null);
const newCourse = ref({
  course_code: '',
  course_name: '',
  major: '',
  year: '',
  credits: 0,
  groups: [{ group_number: 1, professor: '', classroom: '', time_slots: [''] }],
});

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/courses');
    courses.value = response.data || [];
  } catch (err) {
    error.value = 'Failed to load courses. Please try again.';
  } finally {
    loading.value = false;
  }
});

// Computed property for filtering courses based on search input
const filteredCourses = computed(() => {
  if (!searchQuery.value) {
    return courses.value;
  }
  return courses.value.filter(course =>
    Object.values(course).some(value =>
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
});

const confirmDeleteCourse = (index) => {
  courseToDelete.value = index;
  deleteDialog.value = true;
};

const deleteCourse = async () => {
  try {
    const courseId = courses.value[courseToDelete.value].id;
    await axios.delete(`http://localhost:3000/courses/${courseId}`);
    courses.value.splice(courseToDelete.value, 1);
    snackbarText.value = 'Course deleted successfully!';
    snackbarColor.value = 'success';
  } catch (err) {
    snackbarText.value = 'Failed to delete course';
    snackbarColor.value = 'error';
  } finally {
    snackbar.value = true;
    deleteDialog.value = false;
    courseToDelete.value = null;
  }
};

const confirmEditCourse = (index) => {
  courseToEdit.value = { ...courses.value[index] };
  editDialog.value = true;
};

const saveEditedCourse = async (updatedCourse) => {
  try {
    await axios.put(`http://localhost:3000/courses/${updatedCourse.id}`, updatedCourse);
    const index = courses.value.findIndex(course => course.id === updatedCourse.id);
    if (index !== -1) courses.value[index] = { ...updatedCourse };
    snackbarText.value = 'Course updated successfully!';
    snackbarColor.value = 'success';
  } catch (err) {
    snackbarText.value = 'Failed to update course';
    snackbarColor.value = 'error';
  } finally {
    snackbar.value = true;
    editDialog.value = false;
  }
};

const openAddCourseDialog = () => {
  addDialog.value = true;
};

const saveNewCourse = async (newCourseData) => {
  try {
    const response = await axios.post('http://localhost:3000/courses', newCourseData);
    courses.value.push(response.data);
    snackbarText.value = 'Course added successfully!';
    snackbarColor.value = 'success';
  } catch (err) {
    snackbarText.value = 'Failed to add course';
    snackbarColor.value = 'error';
  } finally {
    snackbar.value = true;
    addDialog.value = false;
  }
};
</script>

<template>
  <v-container fluid>
    <!-- Title -->
    <h1 class="text-h5 font-weight-bold mb-4 page-title">
      Manage Courses
    </h1>

    <!-- Search Bar -->
    <v-text-field
      v-model="searchQuery"
      label="Search courses..."
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mb-4"
    ></v-text-field>

    <!-- Add Course Button -->
    <v-btn
      color="primary"
      variant="flat"
      @click="openAddCourseDialog"
      class="mb-4 add-btn"
    >
      <v-icon left>mdi-plus</v-icon>
      Add Course
    </v-btn>

    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

    <!-- Courses Table -->
    <v-table v-if="!loading && !error">
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Major</th>
          <th>Year</th>
          <th>Credits</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(course, index) in filteredCourses" :key="course.id" class="course-row">
          <td class="highlightable">{{ course.course_code }}</td>
          <td class="highlightable">{{ course.course_name }}</td>
          <td>{{ course.major }}</td>
          <td>{{ course.year }}</td>
          <td>{{ course.credits }}</td>
          <td>
            <div class="action-buttons">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                color="primary"
                @click="confirmEditCourse(index)"
                class="action-btn"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                @click="confirmDeleteCourse(index)"
                class="action-btn"
              ></v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Edit Course Dialog -->
    <EditCourseDialog v-model="editDialog" :course="courseToEdit" @save="saveEditedCourse" />

    <!-- Delete Confirmation Dialog -->
    <DeleteCourseDialog 
      v-model="deleteDialog" 
      :course-id="courses[courseToDelete]?.id" 
      @confirm="deleteCourse" 
    />

    <!-- Add Course Dialog -->
    <AddCourseDialog v-model="addDialog" :course="newCourse" @save="saveNewCourse" />

    <!-- Snackbar Notifications -->
    <SnackbarNotification v-model="snackbar" :text="snackbarText" :color="snackbarColor" />
  </v-container>
</template>

<style scoped>
/* Styling for the page title */
.page-title {
  color: #1e293b;
}

/* Table row styling */
.course-row {
  position: relative;
}

/* Search field */
.v-text-field {
  max-width: 400px;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  transition: transform 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.add-btn {
  transition: transform 0.2s ease;
}

.add-btn:hover {
  transform: scale(1.05);
}

.v-table tbody td {
  border-bottom: 1px solid #e5e7eb;
}
</style>
