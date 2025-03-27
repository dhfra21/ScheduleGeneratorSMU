<template>
  <v-container class="fill-height">
    <v-row>
      <v-col cols="12">
        <ApprovedSchedule
          v-if="approvedSchedule"
          :approved-schedule="approvedSchedule"
        />
        <Stepper v-else />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Stepper from '@/components/Stepper.vue';
import ApprovedSchedule from '@/components/ApprovedSchedule.vue';
import axios from 'axios';
import ScheduleDisplay from '@/components/ScheduleDisplay.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const approvedSchedule = ref(null);
const schedules = ref([]);
const selectedCourses = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchApprovedSchedule = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/approved-schedules/${authStore.user.id}`);
    console.log('Fetched approved schedule:', response.data);
    if (response.data && response.data.length > 0) {
      // Get the most recent approved schedule
      approvedSchedule.value = response.data[0];
    } else {
      approvedSchedule.value = null;
    }
  } catch (error) {
    console.error('Error fetching approved schedule:', error);
    approvedSchedule.value = null;
  }
};

const handleScheduleSubmitted = () => {
  // Reset the form
  selectedCourses.value = [];
  // Fetch the latest approved schedule
  fetchApprovedSchedule();
};

onMounted(() => {
  fetchApprovedSchedule();
});
</script>

<style scoped>
.scheduler-container {
  height: 100%;
  padding: 20px;
}

.scheduler-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scheduler-card :deep(.v-card-text) {
  flex: 1;
  overflow: hidden;
}

.scheduler-card :deep(.v-window) {
  height: 100%;
}

.scheduler-card :deep(.v-window__container) {
  height: 100%;
}

.scheduler-card :deep(.v-window-item) {
  height: 100%;
}

.scheduler-card :deep(.v-window-item__content) {
  height: 100%;
  overflow: hidden;
}

.scheduler-card :deep(.v-card) {
  height: 100%;
}

.scheduler-card :deep(.v-card__text) {
  height: 100%;
  overflow: hidden;
}
</style>
  