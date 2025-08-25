<template>
  <v-container fluid class="schedule-requests-container">
    <!-- Title with Icon -->
    <div class="d-flex align-center mb-6">
      <v-icon icon="mdi-calendar-check" color="primary" size="32" class="mr-3"></v-icon>
      <h1 class="text-h4 font-weight-bold page-title">
        Schedule Requests
      </h1>
    </div>

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

    <!-- Requests Table -->
    <v-card v-if="!loading && !error" class="requests-table-card" elevation="0">
      <v-table hover>
        <thead>
          <tr>
            <th class="text-left">User</th>
            <th class="text-left">Schedule</th>
            <th class="text-left">Status</th>
            <th class="text-left">Requested At</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="request in requests" 
            :key="request.id" 
            class="request-row"
          >
            <td class="highlightable font-weight-medium">{{ request.userName }}</td>
            <td>
              <v-btn
                variant="text"
                color="primary"
                @click="viewSchedule(request.schedule)"
                class="view-btn"
                size="small"
              >
                <v-icon left>mdi-eye</v-icon>
                View Schedule
              </v-btn>
            </td>
            <td>
              <v-chip
                :color="getStatusColor(request.status)"
                variant="tonal"
                size="small"
                class="status-chip"
              >
                <v-icon left :icon="getStatusIcon(request.status)" size="16"></v-icon>
                {{ request.status }}
              </v-chip>
            </td>
            <td class="text-grey-darken-1">{{ formatDate(request.requestedAt) }}</td>
            <td class="text-right">
              <div class="action-buttons">
                <v-btn
                  v-if="request.status === 'pending'"
                  color="success"
                  variant="tonal"
                  size="small"
                  @click="approveRequest(request.id)"
                  class="action-btn"
                >
                  <v-icon left>mdi-check</v-icon>
                  Approve
                </v-btn>
                <v-btn
                  v-if="request.status === 'pending'"
                  color="error"
                  variant="tonal"
                  size="small"
                  @click="rejectRequest(request.id)"
                  class="action-btn"
                >
                  <v-icon left>mdi-close</v-icon>
                  Reject
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Schedule Preview Dialog -->
    <v-dialog v-model="showScheduleDialog" max-width="1200">
      <v-card class="schedule-preview-dialog">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-h5 font-weight-bold">Schedule Preview</span>
          <v-btn 
            icon="mdi-close" 
            variant="text" 
            @click="showScheduleDialog = false"
            class="close-btn"
          ></v-btn>
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
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ScheduleDisplay from './ScheduleDisplay.vue';

const requests = ref([]);
const showScheduleDialog = ref(false);
const selectedSchedule = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchRequests = async () => {
  try {
    loading.value = true;
    const response = await axios.get('http://localhost:3000/schedule-requests');
    requests.value = response.data;
  } catch (err) {
    error.value = 'Failed to load schedule requests. Please try again.';
    console.error('Error fetching schedule requests:', err);
  } finally {
    loading.value = false;
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
    loading.value = true;
    await axios.post(`http://localhost:3000/schedule-requests/${requestId}/approve`);
    await fetchRequests();
  } catch (err) {
    error.value = 'Failed to approve request. Please try again.';
    console.error('Error approving request:', err);
  } finally {
    loading.value = false;
  }
};

const rejectRequest = async (requestId) => {
  try {
    loading.value = true;
    await axios.post(`http://localhost:3000/schedule-requests/${requestId}/reject`);
    await fetchRequests();
  } catch (err) {
    error.value = 'Failed to reject request. Please try again.';
    console.error('Error rejecting request:', err);
  } finally {
    loading.value = false;
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

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return 'mdi-clock-outline';
    case 'approved':
      return 'mdi-check-circle';
    case 'rejected':
      return 'mdi-close-circle';
    default:
      return 'mdi-help-circle';
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
.schedule-requests-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  color: #1e293b;
  background: linear-gradient(45deg, #1e293b, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.requests-table-card {
  background: linear-gradient(145deg, #ffffff 0%, #f9fafb 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.request-row {
  transition: all 0.2s ease;
}

.request-row:hover {
  background-color: #f8fafc;
  transform: translateY(-1px);
}

.highlightable {
  transition: all 0.2s ease;
}

.highlightable:hover {
  color: #3b82f6;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  transition: all 0.2s ease;
  opacity: 0.8;
}

.action-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.view-btn {
  transition: all 0.2s ease;
}

.view-btn:hover {
  transform: translateX(2px);
}

.status-chip {
  transition: all 0.2s ease;
}

.status-chip:hover {
  transform: scale(1.05);
}

.schedule-preview-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.close-btn {
  transition: all 0.2s ease;
}

.close-btn:hover {
  transform: rotate(90deg);
}

/* Table styling */
:deep(.v-table) {
  background: transparent;
}

:deep(.v-table thead th) {
  background-color: #f8fafc;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

:deep(.v-table tbody td) {
  border-bottom: 1px solid #e5e7eb;
  padding: 16px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .schedule-requests-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .view-btn {
    width: 100%;
  }
}
</style> 