<template>
  <div class="schedule-requests">
    <h2 class="text-h5 mb-4">Schedule Requests</h2>

    <v-table>
      <thead>
        <tr>
          <th>User</th>
          <th>Schedule</th>
          <th>Status</th>
          <th>Requested At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in requests" :key="request.id">
          <td>{{ request.userName }}</td>
          <td>
            <v-btn
              variant="text"
              color="primary"
              @click="viewSchedule(request.schedule)"
            >
              View Schedule
            </v-btn>
          </td>
          <td>
            <v-chip
              :color="getStatusColor(request.status)"
              size="small"
            >
              {{ request.status }}
            </v-chip>
          </td>
          <td>{{ formatDate(request.requestedAt) }}</td>
          <td>
            <v-btn
              v-if="request.status === 'pending'"
              color="success"
              variant="text"
              size="small"
              @click="approveRequest(request.id)"
            >
              Approve
            </v-btn>
            <v-btn
              v-if="request.status === 'pending'"
              color="error"
              variant="text"
              size="small"
              @click="rejectRequest(request.id)"
            >
              Reject
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Schedule Preview Dialog -->
    <v-dialog v-model="showScheduleDialog" max-width="1200">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Schedule Preview</span>
          <v-btn icon="mdi-close" variant="text" @click="showScheduleDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <ScheduleDisplay
            v-if="selectedSchedule"
            :schedules="[selectedSchedule]"
            :selected-courses="selectedSchedule.courses"
            :hide-submit-button="true"
            :hide-navigation="true"
            :hide-title="true"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ScheduleDisplay from './ScheduleDisplay.vue';

const requests = ref([]);
const showScheduleDialog = ref(false);
const selectedSchedule = ref(null);
const selectedCourses = ref([]);

const fetchRequests = async () => {
  try {
    const response = await axios.get('http://localhost:3000/schedule-requests');
    requests.value = response.data;
  } catch (error) {
    console.error('Error fetching schedule requests:', error);
  }
};

const viewSchedule = (schedule) => {
  selectedSchedule.value = {
    courses: schedule.courses,
    days: schedule.days,
    gaps: schedule.gaps,
    daysOff: schedule.daysOff
  };
  showScheduleDialog.value = true;
};

const approveRequest = async (requestId) => {
  try {
    await axios.post(`http://localhost:3000/schedule-requests/${requestId}/approve`);
    await fetchRequests();
  } catch (error) {
    console.error('Error approving request:', error);
  }
};

const rejectRequest = async (requestId) => {
  try {
    await axios.post(`http://localhost:3000/schedule-requests/${requestId}/reject`);
    await fetchRequests();
  } catch (error) {
    console.error('Error rejecting request:', error);
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'grey';
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

onMounted(() => {
  fetchRequests();
});
</script>

<style scoped>
.schedule-requests {
  padding: 20px;
}

:deep(.schedule-card) {
  box-shadow: none !important;
}

:deep(.schedule-table-container) {
  margin: 0;
}
</style> 