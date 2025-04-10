<template>
  <div class="approved-schedule">
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
        Approved Schedule
      </v-card-title>
      <v-card-text>
        <div class="text-subtitle-1 mb-2">Approved on: {{ formatDate(approvedSchedule.approvedAt) }}</div>
        <ScheduleDisplay
          :schedules="[approvedSchedule.schedule]"
          :selected-courses="approvedSchedule.schedule.courses"
          :hide-submit-button="true"
          :hide-navigation="true"
          :hide-title="true"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import ScheduleDisplay from './ScheduleDisplay.vue';

const props = defineProps({
  approvedSchedule: {
    type: Object,
    required: true
  }
});

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};
</script>

<style scoped>
.approved-schedule {
  padding: 20px;
}
</style> 