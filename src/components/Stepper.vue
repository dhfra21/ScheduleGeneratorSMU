<!-- Stepper.vue with AI Chat Integration -->
<script setup>
import { ref } from 'vue';
import CourseSelection from './CourseSelection.vue';
import ScheduleOptimization from './ScheduleOptimization.vue';
import ScheduleDisplay from './ScheduleDisplay.vue';
import AIChatDialog from './AIChatDialog.vue';

const steps = ['Courses', 'Options', 'Schedules'];
const currentStep = ref(0);
const selectedCourses = ref([]);
const optimizationOptions = ref({
  minimizeGaps: true,
  maximizeSleep: false,
  maximizeDaysOff: false,
  minimizeCourses: false,
  minimizeCertificationPeriods: false
});
const generatedSchedules = ref([]);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('warning');
const isLoading = ref(false);

// AI Chat dialog control
const showAIChat = ref(false);

// Utility function to convert time to minutes for easier comparison
const timeToMinutes = (time) => {
  if (!time || typeof time !== 'string') {
    console.error('Invalid time value:', time);
    return 0; // Default to 0 minutes; adjust as needed
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Check if two time slots conflict
const hasConflict = (slot1, slot2) => {
  if (slot1.day !== slot2.day) return false;
  
  const start1 = timeToMinutes(slot1.start_time);
  const end1 = timeToMinutes(slot1.end_time);
  const start2 = timeToMinutes(slot2.start_time);
  const end2 = timeToMinutes(slot2.end_time);
  
  return start1 < end2 && start2 < end1;
};

// Calculate gaps between time slots on the same day
const calculateDayGaps = (timeSlots) => {
  const days = {};
  timeSlots.forEach(slot => {
    if (!days[slot.day]) days[slot.day] = [];
    days[slot.day].push(slot);
  });

  let totalGaps = 0;
  for (const day in days) {
    const slots = days[day].sort((a, b) => 
      timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
    );
    
    for (let i = 1; i < slots.length; i++) {
      const gap = timeToMinutes(slots[i].start_time) - 
                 timeToMinutes(slots[i-1].end_time);
      if (gap > 0) totalGaps += gap;
    }
  }
  return totalGaps;
};

// Calculate number of days off
const calculateDaysOff = (timeSlots) => {
  const daysUsed = new Set(timeSlots.map(slot => slot.day.toLowerCase()));
  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  return allDays.length - daysUsed.size;
};

// Calculate earliest start time
const getEarliestStart = (timeSlots) => {
  return Math.min(...timeSlots.map(slot => timeToMinutes(slot.start_time)));
};

const handleConfirmCourses = (courses) => {
  selectedCourses.value = courses;
  currentStep.value = 1;
};

const handleContinue = () => {
  if (currentStep.value === 0 && selectedCourses.value.length === 0) {
    snackbarText.value = 'Please select at least one course to continue!';
    snackbarColor.value = 'warning';
    snackbar.value = true;
  } else if (currentStep.value < 2) {
    currentStep.value++;
  }
};

// Handle adding course from AI chat
const handleAddCourse = (course) => {
  // Check if course already exists in selectedCourses
  const exists = selectedCourses.value.some(c => c.id === course.id);
  
  if (!exists) {
    selectedCourses.value.push(course);
    
    // Show snackbar notification
    snackbarText.value = `${course.course_code} added to your course selection.`;
    snackbarColor.value = 'success';
    snackbar.value = true;
  }
};

// Toggle AI Assistant chat
const toggleAIAssistant = () => {
  showAIChat.value = !showAIChat.value;
};

const generateSchedules = async () => {
  if (!selectedCourses.value || selectedCourses.value.length === 0) {
    console.error('No courses selected');
    snackbarText.value = 'Please select at least one course!';
    snackbarColor.value = 'error';
    snackbar.value = true;
    return;
  }

  isLoading.value = true;
  currentStep.value = 2;

  try {
    // Add a minimum delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1000));

    const possibleSchedules = [];
    const allCombinations = [];

    // Generate all possible group combinations
    const coursesWithGroups = selectedCourses.value.map(course => {
      if (!course.groups || !Array.isArray(course.groups)) {
        console.error(`Invalid groups for course ${course.course_code}:`, course);
        return null;
      }
      
      const validGroups = course.groups.filter(group => {
        if (!group.time_slots || !Array.isArray(group.time_slots)) {
          console.error(`Invalid time slots for group in course ${course.course_code}:`, group);
          return false;
        }
        return true;
      });

      if (validGroups.length === 0) {
        console.error(`No valid groups found for course ${course.course_code}`);
        return null;
      }

      return {
        course_code: course.course_code,
        groups: validGroups
      };
    }).filter(Boolean);

    if (coursesWithGroups.length === 0) {
      console.error('No valid courses found');
      snackbarText.value = 'No valid courses found!';
      snackbarColor.value = 'error';
      snackbar.value = true;
      return;
    }

    // Recursive function to generate combinations
    const generateCombinations = (currentCombo = [], index = 0) => {
      if (index === coursesWithGroups.length) {
        allCombinations.push([...currentCombo]);
        return;
      }
      
      const currentCourse = coursesWithGroups[index];
      for (const group of currentCourse.groups) {
        currentCombo.push({
          course_code: currentCourse.course_code,
          group: group
        });
        generateCombinations(currentCombo, index + 1);
        currentCombo.pop();
      }
    };

    generateCombinations();

    // Check each combination for conflicts and score it
    for (const combo of allCombinations) {
      const allTimeSlots = [];
      let hasConflictFlag = false;

      // Collect and validate time slots
      for (const course of combo) {
        const validTimeSlots = course.group.time_slots.filter(slot => {
          const plainSlot = JSON.parse(JSON.stringify(slot));
          const isValid = plainSlot && 
            typeof plainSlot === 'object' &&
            typeof plainSlot.start_time === 'string' && 
            typeof plainSlot.end_time === 'string' &&
            typeof plainSlot.day === 'string' &&
            plainSlot.start_time.includes(':') &&
            plainSlot.end_time.includes(':');
          
          if (!isValid) {
            console.warn(`Invalid time slot for course ${course.course_code}:`, plainSlot);
          }
          return isValid;
        });
        
        if (validTimeSlots.length !== course.group.time_slots.length) {
          console.warn(`Invalid time slots filtered out for course ${course.course_code}. Valid: ${validTimeSlots.length}, Total: ${course.group.time_slots.length}`);
        }
        allTimeSlots.push(...validTimeSlots);
      }

      if (allTimeSlots.length === 0) continue; // Skip if no valid time slots

      // Check for conflicts using nested loops
      for (let i = 0; i < allTimeSlots.length - 1; i++) {
        for (let j = i + 1; j < allTimeSlots.length; j++) {
          if (hasConflict(allTimeSlots[i], allTimeSlots[j])) {
            hasConflictFlag = true;
            break;
          }
        }
        if (hasConflictFlag) break;
      }

      if (!hasConflictFlag) {
        const gaps = calculateDayGaps(allTimeSlots);
        const daysOff = calculateDaysOff(allTimeSlots);
        const earliestStart = getEarliestStart(allTimeSlots);

        let score = 0;
        if (optimizationOptions.value.minimizeGaps) score += (1440 - gaps) / 1440 * 100;
        if (optimizationOptions.value.maximizeSleep) score += earliestStart / 1440 * 100;
        if (optimizationOptions.value.maximizeDaysOff) score += daysOff / 5 * 100;

        possibleSchedules.push({
          courses: combo.map(c => c.course_code),
          timeSlots: allTimeSlots,
          gaps: gaps,
          daysOff: daysOff,
          earliestStart: earliestStart,
          score: score,
          groups: combo.map(course => {
            // Find the matching group from the original course object
            const originalCourse = selectedCourses.value.find(c => c.course_code === course.course_code);
            if (!originalCourse || !originalCourse.groups) {
              return {
                course_code: course.course_code,
                group_number: null,
                professor: null,
                classroom: null
              };
            }
            
            const matchingGroup = originalCourse.groups.find(group => 
              group.time_slots.some(slot => 
                allTimeSlots.some(timeSlot => 
                  timeSlot.day.toLowerCase() === slot.day.toLowerCase() &&
                  timeSlot.start_time === slot.start_time &&
                  timeSlot.end_time === slot.end_time
                )
              )
            );
            
            return {
              course_code: course.course_code,
              group_number: matchingGroup ? matchingGroup.group_number : null,
              professor: matchingGroup ? matchingGroup.professor : null,
              classroom: matchingGroup ? matchingGroup.classroom : null
            };
          })
        });
      }
    }

    // Sort schedules by score and take top 3
    generatedSchedules.value = possibleSchedules
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(schedule => ({
        courses: schedule.courses,
        days: schedule.timeSlots.map(slot => 
          `${slot.day.toLowerCase()} ${slot.start_time}-${slot.end_time}`
        ),
        gaps: Math.round(schedule.gaps / 60) + ' hours',
        daysOff: schedule.daysOff,
        earliestStart: schedule.timeSlots
          .find(slot => timeToMinutes(slot.start_time) === schedule.earliestStart)
          .start_time,
        groups: schedule.groups
      }));

    if (generatedSchedules.value.length === 0) {
      snackbarText.value = 'No valid schedules found with current selections!';
      snackbarColor.value = 'warning';
      snackbar.value = true;
    }
  } catch (error) {
    console.error('Error generating schedules:', error);
    snackbarText.value = 'An error occurred while generating schedules.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6 elevation-4" width="1000" rounded="lg">
      <!-- Floating AI Assistant Button -->
      <v-btn
        class="ai-assistant-btn"
        color="primary"
        icon="mdi-robot"
        size="large"
        @click="toggleAIAssistant"
        elevation="4"
        fixed
        bottom
        right
        style="margin: 16px; z-index: 5;"
        title="AI Course Advisor"
      ></v-btn>

      <v-stepper v-model="currentStep" alt-labels>
        <v-stepper-header>
          <v-stepper-item :complete="currentStep > 0" step="1">Courses</v-stepper-item>
          <v-divider></v-divider>
          <v-stepper-item :complete="currentStep > 1" step="2">Options</v-stepper-item>
          <v-divider></v-divider>
          <v-stepper-item step="3">Schedules</v-stepper-item>
        </v-stepper-header>

        <v-stepper-window>
          <v-stepper-window-item :value="0">
            <CourseSelection 
              :selectedCourses="selectedCourses" 
              @confirm-selection="handleConfirmCourses" 
              @update:selectedCourses="selectedCourses = $event" 
            />
          </v-stepper-window-item>

          <v-stepper-window-item :value="1">
            <ScheduleOptimization :selectedCourses="selectedCourses" />
          </v-stepper-window-item>

          <v-stepper-window-item :value="2">
            <v-overlay
              :model-value="isLoading"
              contained
              class="align-center justify-center"
              opacity="0.8"
              style="z-index: 10;"
            >
              <v-card class="pa-4 d-flex flex-column align-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                  class="mb-4"
                />
                <div class="text-h6 text-center">
                  Generating schedules...
                </div>
              </v-card>
            </v-overlay>
            <ScheduleDisplay
              v-if="!isLoading"
              :schedules="generatedSchedules"
              :selected-courses="selectedCourses"
            />
          </v-stepper-window-item>
        </v-stepper-window>
      </v-stepper>

      <v-card-actions class="d-flex justify-between mt-4">
        <v-btn v-if="currentStep > 0" @click="currentStep--" variant="tonal">Back</v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          v-if="currentStep === 1" 
          color="primary" 
          @click="generateSchedules"
          :disabled="isLoading"
        >
          Generate
        </v-btn>
        <v-btn 
          v-else-if="currentStep < 2" 
          color="primary" 
          @click="handleContinue" 
          :disabled="currentStep === 0 && selectedCourses.length === 0"
        >
          Continue
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- AI Chat Dialog -->
    <AIChatDialog 
      v-model="showAIChat"
      :selectedCoursesModel="selectedCourses"
      @update:selectedCoursesModel="selectedCourses = $event"
      @add-course="handleAddCourse"
    />

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

<style scoped>
.ai-assistant-btn {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.ai-assistant-btn:hover {
  transform: scale(1.1);
}
</style>