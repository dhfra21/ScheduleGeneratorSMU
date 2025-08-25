<template>
  <v-container fluid class="admin-dashboard">
    <!-- Statistics Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2" rounded="lg">
          <v-card-text class="d-flex align-center">
            <v-icon color="primary" size="40" class="mr-4">mdi-calendar-check</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ pendingRequests }}</div>
              <div class="text-subtitle-2 text-grey">Pending Requests</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2" rounded="lg">
          <v-card-text class="d-flex align-center">
            <v-icon color="success" size="40" class="mr-4">mdi-check-circle</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ approvedSchedules }}</div>
              <div class="text-subtitle-2 text-grey">Approved Schedules</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2" rounded="lg">
          <v-card-text class="d-flex align-center">
            <v-icon color="info" size="40" class="mr-4">mdi-book-multiple</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ totalCourses }}</div>
              <div class="text-subtitle-2 text-grey">Total Courses</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2" rounded="lg">
          <v-card-text class="d-flex align-center">
            <v-icon color="warning" size="40" class="mr-4">mdi-account-group</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ totalUsers }}</div>
              <div class="text-subtitle-2 text-grey">Total Users</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity and Quick Actions -->
    <v-row class="mt-4">
      <!-- Recent Activity -->
      <v-col cols="12" md="8">
        <v-card class="activity-card" elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-clock-outline</v-icon>
            Recent Activity
          </v-card-title>
          <v-card-text>
            <v-timeline density="compact" align="start">
              <v-timeline-item
                v-for="(activity, index) in recentActivities"
                :key="index"
                :dot-color="activity.color"
                size="small"
              >
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-subtitle-2 font-weight-bold">{{ activity.title }}</div>
                    <div class="text-caption">{{ activity.description }}</div>
                  </div>
                  <div class="text-caption text-grey">{{ activity.time }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Quick Actions -->
      <v-col cols="12" md="4">
        <v-card class="quick-actions-card" elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-lightning-bolt</v-icon>
            Quick Actions
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(action, index) in quickActions"
                :key="index"
                :to="action.route"
                class="quick-action-item"
              >
                <template v-slot:prepend>
                  <v-icon :color="action.color">{{ action.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ action.title }}</v-list-item-title>
                <template v-slot:append>
                  <v-icon>mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

// Statistics
const pendingRequests = ref(0);
const approvedSchedules = ref(0);
const totalCourses = ref(0);
const totalUsers = ref(0);

// Recent Activities
const recentActivities = ref([
  {
    title: 'New Schedule Request',
    description: 'John Doe submitted a new schedule',
    time: '2 minutes ago',
    color: 'primary'
  },
  {
    title: 'Course Updated',
    description: 'CS101 course information was modified',
    time: '15 minutes ago',
    color: 'info'
  },
  {
    title: 'Schedule Approved',
    description: 'Jane Smith\'s schedule was approved',
    time: '1 hour ago',
    color: 'success'
  }
]);

// Quick Actions
const quickActions = ref([
  {
    title: 'Manage Courses',
    icon: 'mdi-book',
    color: 'primary',
    route: '/admin/courses'
  },
  {
    title: 'Review Requests',
    icon: 'mdi-calendar-check',
    color: 'warning',
    route: '/admin/schedule-requests'
  }
]);

// Fetch statistics
const fetchStatistics = async () => {
  try {
    // Get schedule requests
    const requestsRes = await axios.get('http://localhost:3000/schedule-requests');
    console.log('Schedule requests response:', requestsRes.data);
    
    // Process schedule requests data
    const requests = Array.isArray(requestsRes.data) ? requestsRes.data : [];
    pendingRequests.value = requests.filter(r => r.status === 'pending').length;
    approvedSchedules.value = requests.filter(r => r.status === 'approved').length;

    // Get courses
    const coursesRes = await axios.get('http://localhost:3000/courses');
    console.log('Courses response:', coursesRes.data);
    totalCourses.value = Array.isArray(coursesRes.data) ? coursesRes.data.length : 0;

    // For users, we'll use a default value since we don't have a users endpoint
    totalUsers.value = 3; // Default number of users (admin, regular, new student)

    // Update recent activities with real data from schedule requests
    const recentRequests = requests
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    recentActivities.value = recentRequests.map(request => {
      const timeAgo = getTimeAgo(new Date(request.createdAt));
      return {
        title: request.status === 'pending' ? 'New Schedule Request' : 
               request.status === 'approved' ? 'Schedule Approved' : 'Schedule Rejected',
        description: `${request.studentName || 'Student'} ${request.status === 'pending' ? 'submitted a new schedule' : 
                     request.status === 'approved' ? 'schedule was approved' : 'schedule was rejected'}`,
        time: timeAgo,
        color: request.status === 'pending' ? 'primary' : 
               request.status === 'approved' ? 'success' : 'error'
      };
    });

    // If we have fewer than 3 activities, add some default ones
    while (recentActivities.value.length < 3) {
      recentActivities.value.push({
        title: 'System Update',
        description: 'Welcome to the Schedule Management System',
        time: 'Just now',
        color: 'info'
      });
    }
  } catch (error) {
    console.error('Error fetching statistics:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    // Set default values if there's an error
    pendingRequests.value = 0;
    approvedSchedules.value = 0;
    totalCourses.value = 0;
    totalUsers.value = 3; // Default number of users
  }
};

// Helper function to get time ago
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
};

// Add polling to keep statistics updated
let pollingInterval;

onMounted(() => {
  fetchStatistics();
  // Poll every 5 seconds
  pollingInterval = setInterval(fetchStatistics, 5000);
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});
</script>

<style scoped>
.admin-dashboard {
  padding: 24px;
}

.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.activity-card, .quick-actions-card {
  height: 100%;
}

.quick-action-item {
  transition: background-color 0.3s ease;
  border-radius: 8px;
  margin: 4px 0;
}

.quick-action-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-timeline-item {
  min-height: 60px;
}
</style> 