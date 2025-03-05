<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps(['value', 'courseId']);
const emit = defineEmits(['update:modelValue', 'confirm']);

const closeDialog = () => emit('update:modelValue', false);

const confirmDelete = () => {
  if (props.courseId) {
    console.log('Emitting confirm with courseId:', props.courseId); // Debug log
    emit('confirm', props.courseId);
  }
  closeDialog();
};
</script>

<template>
  <v-dialog :value="props.value" @update:modelValue="emit('update:modelValue', $event)" max-width="400px">
    <v-card class="pa-4 rounded-lg">
      <v-card-title>Confirm Deletion</v-card-title>
      <v-card-text>Are you sure you want to delete this course?</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn color="error" variant="flat" @click="confirmDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>