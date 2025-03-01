<script setup>
import { ref, onMounted } from 'vue';
import EditCourseDialog from '@/components/EditCourseDialog.vue';
import DeleteCourseDialog from '@/components/DeleteCourseDialog.vue';
import SnackbarNotification from '@/components/SnackbarNotification.vue';

const courses = ref([]);
const loading = ref(true);
const error = ref(null);
const deleteDialog = ref(false);
const editDialog = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const courseToDelete = ref(null);
const courseToEdit = ref(null);
const newCourse = ref({
  course_code: '',
  course_name: '',
  major: '',
  year: '',
  credits: '',
});

onMounted(async () => {
  try {
    const response = await fetch('/courses.json');
    const data = await response.json();
    courses.value = data.courses || [];
  } catch (err) {
    error.value = 'Failed to load courses';
  } finally {
    loading.value = false;
  }
});

const confirmDeleteCourse = (index) => {
  courseToDelete.value = index;
  deleteDialog.value = true;
};

const deleteCourse = () => {
  courses.value.splice(courseToDelete.value, 1);
  courseToDelete.value = null;
  snackbarText.value = 'Course deleted successfully!';
  snackbarColor.value = 'success';
  snackbar.value = true;
};

const confirmEditCourse = (index) => {
  courseToEdit.value = index;
  newCourse.value = { ...courses.value[index] };
  editDialog.value = true;
};

const saveEditedCourse = () => {
  courses.value[courseToEdit.value] = { ...newCourse.value };
  editDialog.value = false;
  snackbarText.value = 'Course updated successfully!';
  snackbarColor.value = 'success';
  snackbar.value = true;
};
</script>

<template>
  <v-container fluid>
    <v-card class="pa-4 elevation-2">
      <v-card-title class="text-h5">Manage Courses</v-card-title>

      <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

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
          <tr v-for="(course, index) in courses" :key="course.course_code" class="course-row">
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
    </v-card>

    <!-- Edit Course Dialog -->
    <EditCourseDialog v-model="editDialog" :course="newCourse" @save="saveEditedCourse" />

    <!-- Delete Confirmation Dialog -->
    <DeleteCourseDialog v-model="deleteDialog" @confirm="deleteCourse" />

    <!-- Snackbar Notifications -->
    <SnackbarNotification v-model="snackbar" :text="snackbarText" :color="snackbarColor" />
  </v-container>
</template>

<style scoped>
.course-row {
  position: relative;
}

.highlightable {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  transition: transform 0.2s ease;
}

.action-btn:hover ~ .highlightable {
  background-color: #e6f0ff; /* Bright, distinct blue-gray highlight */
  color: #1a202c; /* Darker text for contrast */
  border-left: 2px solid #3b82f6; /* Subtle blue border for emphasis */
}

.action-btn:hover {
  transform: scale(1.1); /* Slight scale for button hover */
}

.v-table tbody td {
  border-bottom: 1px solid #e5e7eb; /* Consistent border for rows */
}
</style>