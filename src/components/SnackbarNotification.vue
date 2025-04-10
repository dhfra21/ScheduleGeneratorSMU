<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps(['modelValue', 'text', 'color']);
const emit = defineEmits(['update:modelValue']);

const closeSnackbar = () => emit('update:modelValue', false);

const getIcon = computed(() => {
  switch (props.color) {
    case 'success':
      return 'mdi-check-circle';
    case 'error':
      return 'mdi-alert-circle';
    case 'warning':
      return 'mdi-alert';
    case 'info':
      return 'mdi-information';
    default:
      return 'mdi-information';
  }
});
</script>

<template>
  <v-snackbar
    v-model="props.modelValue"
    location="top"
    :timeout="3000"
    :color="props.color"
    class="custom-snackbar"
    elevation="4"
    rounded="lg"
    transition="scroll-y-transition"
  >
    <div class="d-flex align-center">
      <v-icon
        :icon="getIcon"
        :color="props.color"
        class="mr-3"
        size="24"
      ></v-icon>
      <span class="text-body-1">{{ props.text }}</span>
    </div>
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="closeSnackbar"
        :color="props.color"
        class="close-btn"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.custom-snackbar {
  min-width: 300px;
  max-width: 600px;
}

.custom-snackbar :deep(.v-snackbar__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.close-btn {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
}

.close-btn:hover {
  opacity: 0.8;
}
</style>
