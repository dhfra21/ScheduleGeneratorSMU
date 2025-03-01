<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps(['modelValue', 'text', 'color']);
const emit = defineEmits(['update:modelValue']);

const closeSnackbar = () => emit('update:modelValue', false);
</script>

<template>
  <v-snackbar v-model="props.modelValue" location="top" :timeout="2000" :color="props.color">
    {{ props.text }}
    <template v-slot:actions>
      <v-btn variant="text" @click="closeSnackbar">Close</v-btn>
    </template>
  </v-snackbar>
</template>
