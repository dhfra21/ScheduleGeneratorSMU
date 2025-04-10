<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['modelValue', 'course']);
const emit = defineEmits(['update:modelValue', 'save']);

const localCourse = ref({});

// Watch for changes in the course prop and update localCourse
watch(() => props.course, (newCourse) => {
  localCourse.value = JSON.parse(JSON.stringify(newCourse));
}, { immediate: true });

const closeDialog = () => emit('update:modelValue', false);

const saveChanges = () => {
  emit('save', localCourse.value);
  closeDialog();
};

// Add a new group
const addGroup = () => {
  localCourse.value.groups.push({
    group_number: localCourse.value.groups.length + 1,
    professor: '',
    classroom: '',
    time_slots: [{
      day: '',
      start_time: '',
      end_time: ''
    }]
  });
};

// Remove a group
const removeGroup = (index) => {
  if (localCourse.value.groups.length > 1) {
    localCourse.value.groups.splice(index, 1);
    localCourse.value.groups.forEach((group, idx) => {
      group.group_number = idx + 1; // Reassign group numbers
    });
  }
};

// Add a new time slot
const addTimeSlot = (groupIndex) => {
  localCourse.value.groups[groupIndex].time_slots.push({
    day: '',
    start_time: '',
    end_time: ''
  });
};

// Remove a time slot
const removeTimeSlot = (groupIndex, slotIndex) => {
  if (localCourse.value.groups[groupIndex].time_slots.length > 1) {
    localCourse.value.groups[groupIndex].time_slots.splice(slotIndex, 1);
  }
};
</script>

<template>
  <v-dialog
    v-model="props.modelValue"
    max-width="600px"
    persistent
    class="elevation-0"
    style="overflow: hidden;"
  >
    <v-card
      class="pa-4 rounded-xl"
      style="background: linear-gradient(145deg, #ffffff 0%, #f9fafb 100%); border: 1px solid #e5e7eb;"
    >
      <v-card-title class="text-h6 font-weight-medium mb-2" style="color: #1a202c;">
        <v-icon left color="primary" size="20">mdi-pencil</v-icon>
        Edit Course
      </v-card-title>
      <v-card-text class="pt-0">
        <v-row dense>
          <v-col cols="6">
            <v-text-field
              v-model="localCourse.course_code"
              label="Course Code"
              variant="outlined"
              density="compact"
              class="mb-2"
              hide-details
              style="color: #4a5568;"
            ></v-text-field>
            <v-text-field
              v-model="localCourse.course_name"
              label="Course Name"
              variant="outlined"
              density="compact"
              class="mb-2"
              hide-details
              style="color: #4a5568;"
            ></v-text-field>
            <v-select
              v-model="localCourse.major"
              label="Major"
              :items="[
                'Pre-engineering',
                'Software Engineering',
                'Computer Systems Engineering',
                'Renewable Energy Engineering'
              ]"
              variant="outlined"
              density="compact"
              class="mb-2"
              hide-details
              style="color: #4a5568;"
            ></v-select>
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="localCourse.year"
              label="Year"
              :items="['Freshman', 'Sophomore', 'Junior', 'Senior', 'Final']"
              variant="outlined"
              density="compact"
              class="mb-2"
              hide-details
              style="color: #4a5568;"
            ></v-select>
            <v-text-field
              v-model="localCourse.credits"
              label="Credits"
              variant="outlined"
              type="number"
              density="compact"
              hide-details
              style="color: #4a5568;"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Groups Section -->
        <v-card
          class="mt-4 pa-4 elevation-0 rounded-lg"
          style="border: 1px solid #e5e7eb; background: #f7fafc;"
        >
          <v-card-title class="text-body-2 font-weight-medium mb-2" style="color: #4a5568;">
            Course Groups
          </v-card-title>
          <v-row
            v-for="(group, groupIndex) in localCourse.groups"
            :key="group.group_number"
            class="mb-2"
            dense
          >
            <v-col cols="12">
              <v-card
                class="pa-3 elevation-0 rounded-lg"
                style="border: 1px solid #e5e7eb; background: #fff;"
              >
                <v-row dense>
                  <v-col cols="4">
                    <v-text-field
                      v-model="group.group_number"
                      label="Group Number"
                      variant="outlined"
                      density="compact"
                      readonly
                      hide-details
                      class="mb-2"
                      style="color: #718096;"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="group.professor"
                      label="Professor"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mb-2"
                      style="color: #718096;"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="group.classroom"
                      label="Classroom"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mb-2"
                      style="color: #718096;"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <!-- Time Slots -->
                <v-row
                  v-for="(slot, slotIndex) in group.time_slots"
                  :key="slotIndex"
                  dense
                  class="mt-1"
                >
                  <v-col cols="4">
                    <v-select
                      v-model="slot.day"
                      label="Day"
                      :items="['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      style="color: #718096;"
                    ></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="slot.start_time"
                      label="Start Time"
                      variant="outlined"
                      density="compact"
                      hide-details
                      placeholder="HH:MM"
                      style="color: #718096;"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="slot.end_time"
                      label="End Time"
                      variant="outlined"
                      density="compact"
                      hide-details
                      placeholder="HH:MM"
                      style="color: #718096;"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="d-flex align-center justify-space-between">
                    <v-btn
                      v-if="group.time_slots.length > 1"
                      color="error"
                      variant="text"
                      icon="mdi-minus"
                      @click="removeTimeSlot(groupIndex, slotIndex)"
                      class="action-btn"
                      size="small"
                    ></v-btn>
                    <v-btn
                      color="primary"
                      variant="text"
                      icon="mdi-plus"
                      @click="addTimeSlot(groupIndex)"
                      class="action-btn"
                      size="small"
                    ></v-btn>
                  </v-col>
                </v-row>

                <v-btn
                  v-if="localCourse.groups.length > 1"
                  color="error"
                  variant="text"
                  icon="mdi-trash-can"
                  @click="removeGroup(groupIndex)"
                  class="mt-2 action-btn"
                  size="small"
                >
                </v-btn>
              </v-card>
            </v-col>
          </v-row>

          <v-btn
            color="primary"
            variant="text"
            class="mt-2"
            @click="addGroup"
            size="small"
          >
            Add Group
          </v-btn>
        </v-card>
      </v-card-text>
      <v-card-actions class="justify-end pt-0">
        <v-btn
          variant="text"
          color="grey-darken-1"
          @click="closeDialog"
          size="small"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="saveChanges"
          size="small"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.glowing-btn {
  background: linear-gradient(45deg, #3b82f6, #2563eb);
  transition: all 0.3s ease;
}
.glowing-btn:hover {
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  transform: scale(1.1);
}
.action-btn {
  transition: transform 0.2s ease;
}
.action-btn:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 5px rgba(220, 53, 69, 0.3));
}
.v-card {
  overflow: hidden;
}
.v-dialog {
  overflow: hidden;
}
</style>