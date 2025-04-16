<template>
  <v-container fluid class="manage-courses-container">
    <!-- Title with Icon -->
    <div class="d-flex align-center mb-6">
      <v-icon icon="mdi-book-open-page-variant" color="primary" size="32" class="mr-3"></v-icon>
      <h1 class="text-h4 font-weight-bold page-title">
        Manage Courses
      </h1>
    </div>

    <!-- Search and Add Section -->
    <v-card class="search-card mb-6 pa-4" elevation="0">
      <v-row align="center">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchQuery"
            label="Search courses..."
            prepend-inner-icon="mdi-magnify"
            clearable
            variant="outlined"
            density="comfortable"
            class="search-field"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-md-end">
          <v-btn
            color="primary"
            variant="flat"
            @click="openAddCourseDialog"
            class="add-btn"
            size="large"
          >
            <v-icon left>mdi-plus</v-icon>
            Add New Course
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Loading and Error States -->
    <v-progress-linear 
      v-if="loading" 
      indeterminate 
      color="primary"
      class="mb-4"
      height="4"
    ></v-progress-linear>
    
    <v-alert 
      v-if="error" 
      type="error" 
      class="mb-4"
      variant="tonal"
      closable
    >
      {{ error }}
    </v-alert>

    <!-- Courses Table -->
    <v-card v-if="!loading && !error" class="courses-table-card" elevation="0">
      <v-table hover>
        <thead>
          <tr>
            <th class="text-left">Code</th>
            <th class="text-left">Name</th>
            <th class="text-left">Major</th>
            <th class="text-left">Year</th>
            <th class="text-left">Credits</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(course, index) in filteredCourses" 
            :key="course.id" 
            class="course-row"
          >
            <td class="highlightable font-weight-medium">{{ course.course_code }}</td>
            <td class="highlightable">{{ course.course_name }}</td>
            <td>
              <v-chip
                :color="getMajorColor(course.major)"
                variant="tonal"
                size="small"
              >
                {{ course.major }}
              </v-chip>
            </td>
            <td>
              <v-chip
                :color="getYearColor(course.year)"
                variant="tonal"
                size="small"
              >
                {{ course.year }}
              </v-chip>
            </td>
            <td class="font-weight-medium">{{ course.credits }}</td>
            <td class="text-right">
              <div class="action-buttons">
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  color="primary"
                  @click="confirmEditCourse(index)"
                  class="action-btn"
                  size="small"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  @click="confirmDeleteCourse(index)"
                  class="action-btn"
                  size="small"
                ></v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialogs -->
    <EditCourseDialog v-model="editDialog" :course="courseToEdit" @save="saveEditedCourse" />
    <DeleteCourseDialog 
      v-model="deleteDialog" 
      :course-id="courses[courseToDelete]?.id" 
      @confirm="deleteCourse" 
    />
    <AddCourseDialog v-model="addDialog" :course="newCourse" @save="saveNewCourse" />
    <SnackbarNotification v-model="snackbar" :text="snackbarText" :color="snackbarColor" />
  </v-container>
</template>

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
    loading.value = true;
    const courseId = courses.value[courseToDelete.value]?.id;
    if (!courseId) {
      throw new Error('Course ID not found');
    }
    await axios.delete(`http://localhost:3000/courses/${courseId}`);
    courses.value.splice(courseToDelete.value, 1);
    snackbarText.value = 'Course deleted successfully!';
    snackbarColor.value = 'success';
  } catch (err) {
    console.error('Error deleting course:', err);
    snackbarText.value = 'Failed to delete course. Please try again.';
    snackbarColor.value = 'error';
  } finally {
    loading.value = false;
    deleteDialog.value = false;
    courseToDelete.value = null;
    snackbar.value = true;
  }
};

const confirmEditCourse = (index) => {
  courseToEdit.value = JSON.parse(JSON.stringify(courses.value[index]));
  editDialog.value = true;
};

const saveEditedCourse = async (updatedCourse) => {
  try {
    loading.value = true;
    const courseId = updatedCourse.id;
    if (!courseId) {
      throw new Error('Course ID not found');
    }
    await axios.put(`http://localhost:3000/courses/${courseId}`, updatedCourse);
    const index = courses.value.findIndex(course => course.id === courseId);
    if (index !== -1) {
      courses.value[index] = { ...updatedCourse };
    }
    snackbarText.value = 'Course updated successfully!';
    snackbarColor.value = 'success';
  } catch (err) {
    console.error('Error updating course:', err);
    snackbarText.value = 'Failed to update course. Please try again.';
    snackbarColor.value = 'error';
  } finally {
    loading.value = false;
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

// Add these new computed properties for styling
const getMajorColor = (major) => {
  const colors = {
    'Pre-engineering': 'indigo',
    'Software Engineering': 'blue',
    'Computer Systems Engineering': 'teal',
    'Renewable Energy Engineering': 'green'
  };
  return colors[major] || 'grey';
};

const getYearColor = (year) => {
  const colors = {
    'Freshman': 'blue',
    'Sophomore': 'green',
    'Junior': 'orange',
    'Senior': 'red',
    'Final': 'purple'
  };
  return colors[year] || 'grey';
};
</script>

<style scoped>
.manage-courses-container {
  padding: 24px;
}

.page-title {
  color: rgb(var(--v-theme-on-surface));
}

.search-card {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 12px;
}

.search-field {
  max-width: 400px;
}

.courses-table-card {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 12px;
  overflow: hidden;
}

.course-row {
  transition: background-color 0.3s ease;
}

.course-row:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
}

.highlightable {
  transition: color 0.3s ease;
}

.highlightable:hover {
  color: rgb(var(--v-theme-primary));
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.add-btn {
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Table styles */
:deep(.v-table) {
  background-color: rgb(var(--v-theme-surface));
}

:deep(.v-table thead th) {
  background-color: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 600;
  font-size: 0.9rem;
  padding: 12px 16px;
}

:deep(.v-table tbody td) {
  color: rgb(var(--v-theme-on-surface));
  padding: 12px 16px;
}

:deep(.v-table tbody tr:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
}

/* Dialog styles */
:deep(.v-dialog) {
  background-color: rgb(var(--v-theme-surface));
}

:deep(.v-dialog .v-card-title) {
  color: rgb(var(--v-theme-on-surface));
}

:deep(.v-dialog .v-card-text) {
  color: rgb(var(--v-theme-on-surface));
}

/* Form styles */
:deep(.v-text-field .v-field__input) {
  color: rgb(var(--v-theme-on-surface));
}

:deep(.v-text-field .v-field__outline) {
  color: rgba(var(--v-border-color), 0.12);
}

:deep(.v-text-field .v-field--focused .v-field__outline) {
  color: rgb(var(--v-theme-primary));
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .manage-courses-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .search-card {
    padding: 16px;
  }
}
</style>
  