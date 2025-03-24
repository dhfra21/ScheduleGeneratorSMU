<!-- ScheduleDisplay.vue -->
<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  schedules: {
    type: Array,
    required: true
  },
  selectedCourses: {
    type: Array,
    required: true
  }
});

const currentScheduleIndex = ref(0);
const showDetails = ref(false);
const selectedCourse = ref(null);

// Define the days and hours for the table
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const hours = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

// Convert time to a comparable number (e.g., "08:00" to 480 minutes)
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Generate the schedule grid data
const scheduleGrid = computed(() => {
  const currentSchedule = props.schedules[currentScheduleIndex.value];
  if (!currentSchedule) return {};

  // Initialize the grid: { day: { hour: [events] } }
  const grid = {};
  days.forEach(day => {
    grid[day.toLowerCase()] = {};
    hours.forEach(hour => {
      grid[day.toLowerCase()][hour] = [];
    });
  });

  // Populate the grid with events
  currentSchedule.days.forEach((slot, index) => {
    const [day, timeRange] = slot.split(' ');
    const [startTime, endTime] = timeRange.split('-');
    const course = currentSchedule.courses[index % currentSchedule.courses.length];

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Find the hours that this event spans
    hours.forEach(hour => {
      const hourStartMinutes = timeToMinutes(hour);
      const hourEndMinutes = hourStartMinutes + 60; // Each hour slot is 60 minutes

      // Check if the event overlaps with this hour slot
      if (startMinutes < hourEndMinutes && endMinutes > hourStartMinutes) {
        grid[day.toLowerCase()][hour].push({
          course,
          startTime,
          endTime,
          timeRange: `${startTime}-${endTime}`
        });
      }
    });
  });

  return grid;
});

// Colors for different courses
const courseColors = {
  'CS101': '#FF6B6B',
  'CS102': '#4ECDC4',
  'MATH101': '#45B7D1',
  'PHYS101': '#96CEB4',
  'ENG101': '#FFEEAD',
};

// Generate a consistent color based on the major name
const majorColor = computed(() => {
  if (!selectedCourse.value) return '#757575';
  const colorMap = {
    'pre-engineering': '#8E24AA',
    'software engineering': '#1E88E5',
    'computer systems engineering': '#43A047',
    'renewable energy engineering': '#FB8C00',
  };
  const majorKey = selectedCourse.value.major.toLowerCase();
  return colorMap[majorKey] || '#757575';
});

// Generate a consistent icon based on the major
const majorIcon = computed(() => {
  if (!selectedCourse.value) return 'mdi-book-open-page-variant';
  const iconMap = {
    'general': 'mdi-book-open-page-variant',
    'software engineering': 'mdi-laptop-windows',
    'computer systems engineering': 'mdi-chip',
    'renewable energy engineering': 'mdi-flash',
    'pre-engineering': 'mdi-account-school'
  };
  const majorKey = selectedCourse.value.major.toLowerCase();
  return iconMap[majorKey] || 'mdi-book-open-page-variant';
});

// Get year-based styling
const yearInfo = computed(() => {
  if (!selectedCourse.value) return { color: '#757575', icon: 'mdi-calendar' };
  const yearMap = {
    'freshman': { color: '#42A5F5', icon: 'mdi-numeric-1-circle' },
    'sophomore': { color: '#66BB6A', icon: 'mdi-numeric-2-circle' },
    'junior': { color: '#FFA726', icon: 'mdi-numeric-3-circle' },
    'senior': { color: '#EF5350', icon: 'mdi-numeric-4-circle' }
  };
  const yearKey = selectedCourse.value.year.toLowerCase();
  return yearMap[yearKey] || { color: '#757575', icon: 'mdi-calendar' };
});

const nextSchedule = () => {
  if (currentScheduleIndex.value < props.schedules.length - 1) {
    currentScheduleIndex.value++;
  }
};

const prevSchedule = () => {
  if (currentScheduleIndex.value > 0) {
    currentScheduleIndex.value--;
  }
};

const currentScheduleDetails = computed(() => {
  if (!props.schedules[currentScheduleIndex.value]) return {};
  return {
    gaps: props.schedules[currentScheduleIndex.value].gaps || 0,
    daysOff: props.schedules[currentScheduleIndex.value].daysOff || 0
  };
});

// Handle clicking on a course to show details
const handleCourseClick = (courseCode) => {
  const course = props.selectedCourses.find(c => c.course_code === courseCode);
  if (course) {
    selectedCourse.value = course;
    showDetails.value = true;
  } else {
    console.warn(`Course ${courseCode} not found in selectedCourses`);
  }
};

// Close details modal when clicking outside
const closeDetailsOnOutsideClick = (event) => {
  if (event.target.classList.contains('details-overlay')) {
    showDetails.value = false;
  }
};
</script>

<template>
  <v-container>
    <v-card class="pa-4 elevation-4 schedule-card">
      <v-card-title class="text-h5 font-weight-bold primary--text">
        📅 Schedule {{ currentScheduleIndex + 1 }} of {{ schedules.length }}
      </v-card-title>
      <v-card-subtitle class="text-body-1 grey--text text--darken-1">
        Weekly Schedule View
      </v-card-subtitle>

      <v-row class="mt-2">
        <v-col>
          <v-btn
            :disabled="currentScheduleIndex === 0"
            @click="prevSchedule"
            variant="outlined"
            color="primary"
            class="mr-2"
            small
          >
            Previous
          </v-btn>
          <v-btn
            :disabled="currentScheduleIndex === schedules.length - 1"
            @click="nextSchedule"
            variant="outlined"
            color="primary"
            small
          >
            Next
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col>
          <v-card v-if="Object.keys(scheduleGrid).length > 0" class="mb-2" flat>
            <v-card-text class="pa-2">
              <v-chip class="mr-2" small>
                <v-icon start size="16">mdi-clock-outline</v-icon>
                Gaps: {{ currentScheduleDetails.gaps }}
              </v-chip>
              <v-chip small>
                <v-icon start size="16">mdi-calendar-blank-outline</v-icon>
                Days off: {{ currentScheduleDetails.daysOff }}
              </v-chip>
            </v-card-text>
          </v-card>

          <div v-if="!Object.keys(scheduleGrid).length" class="text-center">
            <v-alert type="info">
              No events to display for this schedule.
            </v-alert>
          </div>

          <div v-else class="schedule-table-container">
            <table class="schedule-table">
              <thead>
                <tr>
                  <th class="day-header">Day</th>
                  <th v-for="hour in hours" :key="hour" class="hour-header">
                    {{ hour }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="day in days" :key="day">
                  <td class="day-cell">{{ day }}</td>
                  <td v-for="hour in hours" :key="`${day}-${hour}`" class="event-cell">
                    <div
                      v-for="event in scheduleGrid[day.toLowerCase()][hour]"
                      :key="event.course"
                      class="event"
                      :style="{ backgroundColor: courseColors[event.course] || '#4ECDC4' }"
                      @click="handleCourseClick(event.course)"
                    >
                      <div class="event-title">{{ event.course }}</div>
                      <div class="event-time">{{ event.timeRange }}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Course Details Modal -->
    <div v-if="showDetails" class="details-overlay" @click="closeDetailsOnOutsideClick">
      <div class="details-modal">
        <div class="modal-header" :style="{ backgroundColor: majorColor }">
          <div class="course-title">
            <h2>{{ selectedCourse.course_code }}: {{ selectedCourse.course_name }}</h2>
          </div>
          <v-btn 
            icon 
            variant="text" 
            color="white" 
            size="small"
            @click="showDetails = false"
          >
            <v-icon icon="mdi-close"></v-icon>
          </v-btn>
        </div>

        <div class="modal-content">
          <div class="info-section">
            <h3>Course Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <v-icon :icon="majorIcon" :color="majorColor" class="mr-2"></v-icon>
                <span class="info-label">Major:</span> {{ selectedCourse.major }}
              </div>
              <div class="info-item">
                <v-icon :icon="yearInfo.icon" :color="yearInfo.color" class="mr-2"></v-icon>
                <span class="info-label">Year:</span> {{ selectedCourse.year }}
              </div>
              <div class="info-item">
                <v-icon icon="mdi-weight" color="primary" class="mr-2"></v-icon>
                <span class="info-label">Credits:</span> {{ selectedCourse.credits }}
              </div>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Groups Section -->
          <div v-if="selectedCourse.groups && selectedCourse.groups.length > 0" class="groups-section">
            <h3>Course Groups</h3>
            
            <v-expansion-panels variant="accordion">
              <v-expansion-panel
                v-for="group in selectedCourse.groups"
                :key="group.group_number"
                :title="`Group ${group.group_number}`"
                :text="`Professor: ${group.professor}`"
              >
                <template v-slot:text>
                  <div class="group-details">
                    <div class="group-info">
                      <v-icon icon="mdi-account-tie" color="primary" class="mr-2"></v-icon>
                      <span class="info-label">Professor:</span> {{ group.professor }}
                    </div>
                    <div class="group-info">
                      <v-icon icon="mdi-map-marker" color="primary" class="mr-2"></v-icon>
                      <span class="info-label">Location:</span> {{ group.classroom }}
                    </div>
                    <div class="group-schedule">
                      <div class="schedule-header">
                        <v-icon icon="mdi-clock-outline" color="primary" class="mr-2"></v-icon>
                        <span class="info-label">Schedule:</span>
                      </div>
                      <div class="time-slots">
                        <div v-for="(slot, index) in group.time_slots" :key="index" class="time-slot">
                          <v-icon icon="mdi-calendar-clock" size="small" class="mr-2"></v-icon>
                          {{ slot.day }} {{ slot.start_time }}-{{ slot.end_time }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          
          <v-divider class="my-4"></v-divider>
          
          <div class="actions">
            <v-btn 
              variant="tonal" 
              :color="majorColor !== '#757575' ? majorColor : 'primary'" 
              @click="showDetails = false"
              prepend-icon="mdi-arrow-left"
            >
              Close
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<style>
/* Styles for the custom schedule table */
.schedule-table-container {
  max-width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-family: inherit;
}

.day-header, .hour-header {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9em;
  color: #1e293b;
}

.day-cell {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 8px;
  text-align: left;
  font-weight: 500;
  width: 120px;
}

.event-cell {
  border: 1px solid #e2e8f0;
  padding: 4px;
  min-height: 60px;
  vertical-align: top;
}

.event {
  background-color: #4ECDC4;
  border-radius: 4px;
  padding: 4px;
  margin: 2px 0;
  color: white;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.event-title {
  font-weight: 600;
  font-size: 0.8em;
  margin-bottom: 1px;
}

.event-time {
  font-size: 0.65em;
  opacity: 0.9;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .schedule-table-container {
    max-width: 100%;
  }

  .day-header, .hour-header {
    font-size: 0.8em;
    padding: 4px;
  }

  .day-cell {
    width: 100px;
    font-size: 0.9em;
    padding: 4px;
  }

  .event-cell {
    min-height: 40px;
  }

  .event {
    padding: 2px;
  }

  .event-title {
    font-size: 0.7em;
  }

  .event-time {
    font-size: 0.55em;
  }
}

/* Modal styles (unchanged) */
.details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  animation: fadeIn 0.2s ease;
}

.details-modal {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

.modal-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.course-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
}

.info-section h3,
.groups-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.2rem;
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.info-item, .group-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.group-details {
  padding: 8px 0;
}

.group-schedule {
  margin-top: 12px;
}

.schedule-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.time-slots {
  padding-left: 28px;
}

.time-slot {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>