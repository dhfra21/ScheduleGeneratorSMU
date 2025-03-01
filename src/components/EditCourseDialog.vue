<script setup>
import { defineProps, defineEmits } from 'vue';


const props = defineProps(['modelValue', 'course']);
const emit = defineEmits(['update:modelValue', 'save']);

const closeDialog = () => emit('update:modelValue', false);
const saveChanges = () => emit('save');

// Add a new group
const addGroup = () => {
  props.course.groups.push({
    group_number: props.course.groups.length + 1,
    professor: '',
    classroom: '',
    time_slots: ['']
  });
};

// Remove a group
const removeGroup = (index) => {
  if (props.course.groups.length > 1) {
    props.course.groups.splice(index, 1);
    props.course.groups.forEach((group, idx) => {
      group.group_number = idx + 1; // Reassign group numbers
    });
  }
};

// Add a new time slot
const addTimeSlot = (groupIndex) => {
  props.course.groups[groupIndex].time_slots.push('');
};

// Remove a time slot
const removeTimeSlot = (groupIndex, slotIndex) => {
  if (props.course.groups[groupIndex].time_slots.length > 1) {
    props.course.groups[groupIndex].time_slots.splice(slotIndex, 1);
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
              v-model="props.course.course_code"
              label="Course Code"
              variant="outlined"
              density="compact"
              class="mb-2"
              hide-details
              style="color: #4a5568;"
            ></v-text-field>
            <v-text-field
              v-model="props.course.course_name"
              label="Course Name"
              variant="outlined"
              density="compact"
              class="mb-2"
              hide-details
              style="color: #4a5568;"
            ></v-text-field>
            <v-select
              v-model="props.course.major"
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
              v-model="props.course.year"
              label="Year"
              :items="['Freshman', 'Sophomore', 'Junior', 'Senior', 'Final']"
              variant="outlined"
              density="compact"
              class="mb-2"
              hide-details
              style="color: #4a5568;"
            ></v-select>
            <v-text-field
              v-model="props.course.credits"
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
            v-for="(group, groupIndex) in props.course.groups"
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
                  <v-col cols="8">
                    <v-text-field
                      v-model="group.time_slots[slotIndex]"
                      label="Time Slot"
                      variant="outlined"
                      density="compact"
                      hide-details
                      placeholder="e.g., Monday 10:00-12:00"
                      style="color: #718096;"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" class="d-flex align-center justify-space-between">
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
                  v-if="props.course.groups.length > 1"
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