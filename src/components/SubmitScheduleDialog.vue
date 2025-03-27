<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-card-title>Submit Schedule for Approval</v-card-title>
      <v-card-text>
        <p class="mb-4">Are you sure you want to submit this schedule for approval?</p>
        
        <div v-if="schedule" class="schedule-preview">
          <h3 class="text-h6 mb-4">Schedule Preview</h3>
          <v-list>
            <v-list-item v-for="(course, index) in schedule.courses" :key="index">
              <v-list-item-title class="font-weight-bold">{{ course }}</v-list-item-title>
            </v-list-item>
          </v-list>
          
          <v-divider class="my-4"></v-divider>
          
          <div class="text-subtitle-1 mb-2">Time Slots:</div>
          <v-list>
            <v-list-item v-for="(day, index) in schedule.days" :key="index">
              <v-list-item-title>{{ formatTimeSlot(day) }}</v-list-item-title>
            </v-list-item>
          </v-list>
          
          <v-divider class="my-4"></v-divider>
          
          <div class="d-flex flex-wrap gap-4">
            <v-chip color="primary" variant="outlined">
              <v-icon start>mdi-clock-outline</v-icon>
              Gaps: {{ schedule.gaps }}
            </v-chip>
            <v-chip color="primary" variant="outlined">
              <v-icon start>mdi-calendar-blank-outline</v-icon>
              Days Off: {{ schedule.daysOff }}
            </v-chip>
            <v-chip color="primary" variant="outlined">
              <v-icon start>mdi-alarm</v-icon>
              Earliest Start: {{ schedule.earliestStart }}
            </v-chip>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="dialog = false">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="loading"
          @click="submitSchedule"
        >
          Submit for Approval
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const props = defineProps({
  modelValue: Boolean,
  schedule: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'submitted']);

const dialog = ref(props.modelValue);
const loading = ref(false);
const authStore = useAuthStore();

// Watch for changes in the modelValue prop
watch(() => props.modelValue, (newValue) => {
  dialog.value = newValue;
});

// Watch for changes in the dialog value
watch(dialog, (newValue) => {
  emit('update:modelValue', newValue);
});

const formatTimeSlot = (slot) => {
  const [day, time] = slot.split(' ');
  return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${time}`;
};

const submitSchedule = async () => {
  try {
    loading.value = true;
    await axios.post('http://localhost:3000/schedule-requests', {
      userId: authStore.user.id,
      userName: authStore.user.name,
      schedule: props.schedule
    });
    
    dialog.value = false;
    emit('submitted');
  } catch (error) {
    console.error('Error submitting schedule:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.schedule-preview {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.gap-4 {
  gap: 16px;
}
</style> 