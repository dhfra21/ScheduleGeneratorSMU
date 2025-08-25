<script setup>
import { ref } from 'vue';

const props = defineProps({
  selectedCourses: Array,
});

const optimizationOptions = ref({
  minimizeGaps: true,
  maximizeSleep: false,
  maximizeDaysOff: false
  
});
</script>

<template>
  <v-container class="d-flex justify-center">
    <v-card
      class="pa-6 elevation-6"
      width="700"
      rounded="xl"
      style="background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0;"
    >
      <!-- Header -->
      <div class="text-center mb-6">
        <v-icon color="primary" size="40" class="mb-2 animate-icon">mdi-tune</v-icon>
        <v-card-title class="text-h5 font-weight-bold" style="color: #1e293b;">
          Optimization Preferences
        </v-card-title>
        <v-card-subtitle class="text-body-1" style="color: #64748b;">
          Tailor your schedule to fit your lifestyle
        </v-card-subtitle>
      </div>

      <!-- Options Grid -->
      <v-row class="px-4">
        <v-col
          v-for="(value, option) in optimizationOptions"
          :key="option"
          cols="12"
          sm="6"
          class="d-flex align-center pa-2"
        >
          <v-card
            class="flex-grow-1 pa-4"
            variant="outlined"
            rounded="lg"
            style="border: 1px solid #e5e7eb; transition: all 0.3s ease;"
            :class="{ 'active-card': optimizationOptions[option] }"
          >
            <div class="d-flex align-center justify-space-between">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <span v-bind="props" class="text-body-1 font-weight-medium" style="color: #334155;">
                    {{ option.replace(/([A-Z])/g, ' $1').trim() }}
                  </span>
                </template>
                <span>{{ getTooltipText(option) }}</span>
              </v-tooltip>
              <v-switch
                v-model="optimizationOptions[option]"
                color="primary"
                hide-details
                inset
                class="ml-3"
              ></v-switch>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
export default {
  methods: {
    getTooltipText(option) {
      const tooltips = {
        minimizeGaps: 'Reduce time gaps between classes',
        maximizeSleep: 'Prioritize later start times for more sleep',
        maximizeDaysOff: 'Increase the number of free days',
        
      };
      return tooltips[option] || 'No description available';
    },
  },
};
</script>

<style scoped>
.animate-icon {
  transition: transform 0.3s ease;
}
.animate-icon:hover {
  transform: rotate(15deg) scale(1.1);
}
.active-card {
  border-color: #3b82f6 !important;
  background: #eff6ff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}
</style>