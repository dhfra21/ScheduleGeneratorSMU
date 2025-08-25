<template>
  <div class="enhanced-schedule">
    <!-- View Toggle -->
    <v-card class="mb-4">
      <v-card-text class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-calendar-check</v-icon>
          <h2 class="text-h5">My Schedule</h2>
        </div>
        <v-btn-group>
          <v-btn
            :color="viewMode === 'calendar' ? 'primary' : 'grey'"
            @click="viewMode = 'calendar'"
            prepend-icon="mdi-calendar"
          >
            Calendar
          </v-btn>
          <v-btn
            :color="viewMode === 'list' ? 'primary' : 'grey'"
            @click="viewMode = 'list'"
            prepend-icon="mdi-format-list-bulleted"
          >
            List
          </v-btn>
        </v-btn-group>
      </v-card-text>
    </v-card>

    <!-- Schedule Statistics -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="d-flex align-center">
            <v-icon color="primary" size="40" class="mr-4">mdi-book-multiple</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ schedule.courses.length }}</div>
              <div class="text-subtitle-2 text-grey">Total Courses</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="d-flex align-center">
            <v-icon color="success" size="40" class="mr-4">mdi-clock-outline</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ schedule.gaps }}</div>
              <div class="text-subtitle-2 text-grey">Gaps</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="d-flex align-center">
            <v-icon color="info" size="40" class="mr-4">mdi-calendar-blank-outline</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ schedule.daysOff }}</div>
              <div class="text-subtitle-2 text-grey">Days Off</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="d-flex align-center">
            <v-icon color="warning" size="40" class="mr-4">mdi-alarm</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ schedule.earliestStart }}</div>
              <div class="text-subtitle-2 text-grey">Earliest Start</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Calendar View -->
    <v-card v-if="viewMode === 'calendar'" class="mb-4">
      <v-card-text>
        <ScheduleDisplay
          :schedules="[schedule]"
          :selected-courses="schedule.courses"
          :hide-submit-button="true"
          :hide-navigation="true"
          :hide-title="true"
        />
      </v-card-text>
    </v-card>

    <!-- List View -->
    <v-card v-else class="mb-4">
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(day, index) in schedule.days"
            :key="index"
            class="schedule-item"
          >
            <template v-slot:prepend>
              <v-icon color="primary">mdi-calendar-clock</v-icon>
            </template>
            <v-list-item-title class="font-weight-bold">
              {{ formatDay(day) }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ formatTime(day) }}
            </v-list-item-subtitle>
            <template v-slot:append>
              <v-chip
                v-if="getCourseForDay(day)"
                :color="getCourseColor(getCourseForDay(day))"
                variant="tonal"
              >
                {{ getCourseForDay(day) }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Action Buttons -->
    <v-card>
      <v-card-actions class="d-flex justify-end">
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-printer"
          @click="printSchedule"
        >
          Print Schedule
        </v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-download"
          @click="exportSchedule"
        >
          Export Schedule
        </v-btn>
      </v-card-actions>
    </v-card>

    <ScheduleExporter
      v-model="showExporter"
      :schedule="schedule"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ScheduleDisplay from './ScheduleDisplay.vue';
import ScheduleExporter from './ScheduleExporter.vue';

const props = defineProps({
  schedule: {
    type: Object,
    required: true
  }
});

const viewMode = ref('calendar');
const courseColors = ref({});
const showExporter = ref(false);

// Generate random colors for courses
const pastelColors = [
  '#FFB5E8', // Soft pink
  '#B5DEFF', // Light blue
  '#BFFCC6', // Mint green
  '#FFC9DE', // Rose
  '#D5AAFF', // Lavender
  '#FFABAB', // Coral
  '#AFF8D8', // Seafoam
  '#FFDAC1', // Peach
  '#E2F0CB', // Sage
  '#B5B8FF', // Periwinkle
  '#FFD1DC', // Blush
  '#C1FBA4', // Lime
  '#FFB5B5', // Salmon
  '#B5E3FF', // Sky blue
  '#FFD5B5'  // Apricot
];

props.schedule.courses.forEach((course, index) => {
  courseColors.value[course] = pastelColors[index % pastelColors.length];
});

const formatDay = (day) => {
  const [dayName] = day.split(' ');
  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
};

const formatTime = (day) => {
  const [, time] = day.split(' ');
  return time;
};

const getCourseForDay = (day) => {
  const [dayName, time] = day.split(' ');
  const course = props.schedule.courses.find(course => {
    return props.schedule.days.some(d => {
      const [dDay, dTime] = d.split(' ');
      return dDay === dayName && dTime === time;
    });
  });
  return course;
};

const getCourseColor = (course) => {
  return courseColors.value[course] || '#4ECDC4';
};

const printSchedule = () => {
  window.print();
};

const exportSchedule = () => {
  showExporter.value = true;
};
</script>

<style scoped>
.enhanced-schedule {
  padding: 20px;
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.schedule-item {
  transition: background-color 0.2s;
}

.schedule-item:hover {
  background-color: #f5f5f5;
}

@media print {
  .enhanced-schedule {
    padding: 0;
  }
  
  .stat-card,
  .v-btn-group,
  .v-card-actions {
    display: none;
  }
}
</style> 