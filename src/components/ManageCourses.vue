<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; // Import axios
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
    console.log("Courses fetched:", response.data); // Debugging
    courses.value = response.data || [];
  } catch (err) {
    console.error("Error fetching courses:", err);
    error.value = 'Failed to load courses. Please try again.';
  } finally {
    loading.value = false;
  }
});

const confirmDeleteCourse = (index) => {
  console.log('Confirming deletion of course at index:', index); // Debugging
  courseToDelete.value = index;
  deleteDialog.value = true;
};

const deleteCourse = async () => {
  try {
    const courseId = courses.value[courseToDelete.value].id;
    console.log('Deleting course with ID:', courseId); // Debugging
    await axios.delete(`http://localhost:3000/courses/${courseId}`);
    courses.value.splice(courseToDelete.value, 1);
    snackbarText.value = 'Course deleted successfully!';
    snackbarColor.value = 'success';
  } catch (err) {
    console.error("Error deleting course:", err);
    snackbarText.value = 'Failed to delete course';
    snackbarColor.value = 'error';
  } finally {
    snackbar.value = true;
    deleteDialog.value = false;
    courseToDelete.value = null;
  }
};

const confirmEditCourse = (index) => {
  courseToEdit.value = index;
  courseToEdit.value = { ...courses.value[index] };
  editDialog.value = true;
  console.log('Editing course:', courseToEdit.value, 'ID:', courseToEdit.value.id); // Debugging
};

const saveEditedCourse = async (updatedCourse) => {
  try {
    await axios.put(`http://localhost:3000/courses/${updatedCourse.id}`, updatedCourse);
    courses.value[courseToEdit.value] = { ...updatedCourse };
    snackbarText.value = 'Course updated successfully!';
    snackbarColor.value = 'success';
  } catch (err) {
    console.error("Error updating course:", err);
    snackbarText.value = 'Failed to update course';
    snackbarColor.value = 'error';
  } finally {
    snackbar.value = true;
    editDialog.value = false;
  }
};

const openAddCourseDialog = () => {
  newCourse.value = {
    course_code: '',
    course_name: '',
    major: '',
    year: '',
    credits: 0,
    groups: [{ group_number: 1, professor: '', classroom: '', time_slots: [''] }],
  };
  addDialog.value = true;
  console.log('Adding new course:', newCourse.value); // Debugging
};

const saveNewCourse = async (newCourseData) => {
  try {
    const response = await axios.post('http://localhost:3000/courses', newCourseData);
    courses.value.push(response.data);
    snackbarText.value = 'Course added successfully!';
    snackbarColor.value = 'success';
  } catch (err) {
    console.error("Error adding course:", err);
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
    <v-card class="pa-4 elevation-2">
      <v-card-title class="text-h5 d-flex justify-space-between align-center">
        <span>Manage Courses</span>
        <v-btn
          color="primary"
          variant="flat"
          @click="openAddCourseDialog"
          class="add-btn"
        >
          <v-icon left>mdi-plus</v-icon>
          Add Course
        </v-btn>
      </v-card-title>

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
          <tr v-for="(course, index) in courses" :key="course.id" class="course-row">
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
  background-color: #e6f0ff;
  color: #1a202c;
  border-left: 2px solid #3b82f6;
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