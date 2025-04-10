<template>
  <v-container class="fill-height">
    <v-row>
      <v-col cols="12">
        <EnhancedScheduleView
          v-if="approvedSchedule"
          :schedule="approvedSchedule.schedule"
        />
        <Stepper v-else />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Stepper from '@/components/Stepper.vue';
import EnhancedScheduleView from '@/components/EnhancedScheduleView.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const approvedSchedule = ref(null);
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
</style>
  