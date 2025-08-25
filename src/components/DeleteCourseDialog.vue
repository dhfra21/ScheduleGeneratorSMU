<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps(['modelValue', 'courseId']);
const emit = defineEmits(['update:modelValue', 'confirm']);

const closeDialog = () => emit('update:modelValue', false);

const confirmDelete = () => {
  if (props.courseId) {
    emit('confirm');
  }
  closeDialog();
};
</script>

<template>
  <v-dialog v-model="props.modelValue" max-width="400px">
    <v-card class="pa-4 rounded-lg">
      <v-card-title>Confirm Deletion</v-card-title>
      <v-card-text>Are you sure you want to delete this course? This action cannot be undone.</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn color="error" variant="flat" @click="confirmDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>