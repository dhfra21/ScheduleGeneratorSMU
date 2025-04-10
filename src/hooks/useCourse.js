// composables/useCourse.js
import { ref } from 'vue';
import axios from 'axios';

export function useCourse() {
  const courses = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchCourses = async () => {
    loading.value = true;
    try {
      const response = await axios.get('http://localhost:3000/courses');
      courses.value = response.data || [];
    } catch (err) {
      error.value = 'Failed to load courses. Please try again.';
    } finally {
      loading.value = false;
    }
  };

  const addCourse = async (course) => {
    try {
      const response = await axios.post('http://localhost:3000/courses', course);
      courses.value.push(response.data);
      return true;
    } catch (err) {
      error.value = 'Failed to add course. Please try again.';
      return false;
    }
  };

  const updateCourse = async (course) => {
    try {
      await axios.put(`http://localhost:3000/courses/${course.id}`, course);
      const index = courses.value.findIndex(c => c.id === course.id);
      if (index !== -1) {
        courses.value[index] = course;
      }
      return true;
    } catch (err) {
      error.value = 'Failed to update course. Please try again.';
      return false;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await axios.delete(`http://localhost:3000/courses/${courseId}`);
      courses.value = courses.value.filter(course => course.id !== courseId);
      return true;
    } catch (err) {
      error.value = 'Failed to delete course. Please try again.';
      return false;
    }
  };

  return {
    courses,
    loading,
    error,
    fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse,
  };
}