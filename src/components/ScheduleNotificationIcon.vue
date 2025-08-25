<template>
  <v-badge
    :content="notificationCount"
    :model-value="hasNotifications"
    color="error"
    class="notification-badge"
    :dot="notificationCount > 99"
  >
    <v-btn
      icon
      variant="text"
      @click="showNotifications"
      :color="hasNotifications ? 'primary' : 'grey-darken-1'"
      class="notification-btn"
      size="large"
      :class="{ 'pulse': hasNotifications }"
    >
      <v-icon size="24">mdi-bell</v-icon>
    </v-btn>
  </v-badge>

  <!-- Notifications Dialog -->
  <v-dialog v-model="showDialog" max-width="500" transition="dialog-bottom-transition">
    <v-card class="notification-dialog">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-bell</v-icon>
          <span class="text-h6">Schedule Notifications</span>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="showDialog = false"></v-btn>
      </v-card-title>
      <v-card-text class="pa-4">
        <v-list v-if="notifications.length > 0" class="notification-list">
          <v-list-item
            v-for="notification in notifications"
            :key="notification.id"
            :title="notification.title"
            :subtitle="notification.message"
            :color="getNotificationColor(notification.type)"
            class="mb-2 notification-item"
            :class="getNotificationClass(notification.type)"
          >
            <template v-slot:prepend>
              <v-icon :color="getNotificationColor(notification.type)" size="24">
                {{ getNotificationIcon(notification.type) }}
              </v-icon>
            </template>
            <template v-slot:append>
              <span class="text-caption text-grey">{{ formatTimestamp(notification.timestamp) }}</span>
            </template>
          </v-list-item>
        </v-list>
        <v-alert v-else type="info" class="mt-4" variant="tonal">
          <v-icon left>mdi-information</v-icon>
          No notifications
        </v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const notifications = ref([]);
const showDialog = ref(false);
let pollInterval;

const hasNotifications = computed(() => notifications.value.length > 0);
const notificationCount = computed(() => notifications.value.length);

const getNotificationColor = (type) => {
  switch (type) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'primary';
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle';
    case 'error':
      return 'mdi-alert-circle';
    case 'warning':
      return 'mdi-alert';
    default:
      return 'mdi-information';
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const getNotificationClass = (type) => {
  switch (type) {
    case 'success':
      return 'notification-success';
    case 'error':
      return 'notification-error';
    case 'warning':
      return 'notification-warning';
    default:
      return 'notification-info';
  }
};

const fetchNotifications = async () => {
  try {
    if (!authStore.user?.id) {
      console.log('No user ID available yet');
      return;
    }
    console.log('Fetching notifications for user:', authStore.user.id);
    const response = await axios.get(`http://localhost:3000/notifications/${authStore.user.id}`);
    console.log('Received notifications:', response.data);
    notifications.value = response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
};

const startPolling = () => {
  console.log('Starting notification polling');
  if (authStore.user?.id) {
    // Fetch immediately if we have a user ID
    fetchNotifications();
  }
  // Then poll every 3 seconds
  pollInterval = setInterval(fetchNotifications, 3000);
};

const stopPolling = () => {
  console.log('Stopping notification polling');
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

const showNotifications = () => {
  console.log('Showing notifications dialog');
  showDialog.value = true;
  // Fetch immediately when opening dialog
  fetchNotifications();
  // Clear notifications when user opens the dialog
  clearNotifications();
};

const clearNotifications = async () => {
  try {
    if (!authStore.user?.id) return;
    await axios.delete(`http://localhost:3000/notifications/${authStore.user.id}`);
    notifications.value = [];
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

// Watch for auth state changes
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    console.log('User changed, restarting polling');
    stopPolling();
    startPolling();
  }
});

onMounted(() => {
  startPolling();
});

// Clean up polling when component is unmounted
onUnmounted(() => {
  stopPolling();
});

// Watch for dialog state to optimize polling
watch(showDialog, (newValue) => {
  if (newValue) {
    fetchNotifications();
  }
});
</script>

<style scoped>
.notification-badge {
  margin-right: 8px;
  position: relative;
  display: inline-flex;
}

.notification-badge :deep(.v-badge__badge) {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  right: -6px;
  top: -2px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  z-index: 2;
}

.notification-btn {
  margin: 0 8px;
  background-color: transparent;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white !important;
}

.notification-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.notification-btn.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.notification-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.notification-item {
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.notification-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-success {
  background-color: rgba(var(--v-theme-success), 0.05);
  border-left: 4px solid rgb(var(--v-theme-success));
}

.notification-error {
  background-color: rgba(var(--v-theme-error), 0.05);
  border-left: 4px solid rgb(var(--v-theme-error));
}

.notification-warning {
  background-color: rgba(var(--v-theme-warning), 0.05);
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.notification-info {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.notification-item :deep(.v-list-item__append) {
  margin-top: auto;
  margin-bottom: auto;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}
</style> 