<script setup>
import { defineProps, defineEmits } from 'vue';
import EditCourseDialog from './EditCourseDialog.vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue', 'save']);

const defaultCourse = {
  course_code: '',
  course_name: '',
  major: '',
  year: '',
  credits: 0,
  groups: [{ group_number: 1, professor: '', classroom: '', time_slots: [''] }]
};
</script>

<template>
  <v-dialog v-model="props.modelValue" max-width="600px">
    <EditCourseDialog 
      :model-value="props.modelValue" 
      :course="defaultCourse" 
      @save="emit('save', $event)" 
      @update:modelValue="emit('update:modelValue', $event)" 
    />
  </v-dialog>
</template>