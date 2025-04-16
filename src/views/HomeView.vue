<!-- views/Home.vue -->
<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Navigation functions
const goToSchedule = () => router.push('/schedule');
const goToCatalog = () => router.push('/courses');
const goToAdminLogin = () => router.push('/login');
const goToUserLogin = () => router.push('/login');

// Initialize auth state when component mounts
onMounted(() => {
  authStore.initializeAuth();
});
</script> 

<template>
  <v-container class="fill-height d-flex align-center justify-center" style="padding: 16px;">
    <v-card
      class="pa-8 elevation-6"
      :max-width="800"
      rounded="xl"
      :style="{ background: `linear-gradient(145deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-background)) 100%)` }"
    >
      <!-- Header Section -->
      <v-row justify="center" class="text-center">
        <v-col cols="12">
          <v-icon color="primary" size="60" class="mb-4 animate-icon" aria-hidden="true">mdi-calendar-clock</v-icon>
          <h1 class="text-h3 font-weight-bold mb-2" style="color: rgb(var(--v-theme-on-surface)); word-break: break-word;" aria-label="Welcome to University Scheduler">
            Welcome to SMU Scheduler
          </h1>
          <p class="text-body-1" style="color: rgb(var(--v-theme-on-surface-variant)); word-break: break-word;" aria-label="Plan your perfect semester with ease. Build schedules, explore courses, and optimize your time.">
            Plan your perfect semester with ease. Build schedules, explore courses, and optimize your time.
          </p>
        </v-col>
      </v-row>

      <!-- Call-to-Action Buttons -->
      <v-row justify="center" class="mt-6">
        <v-col cols="12" sm="6" md="4">
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            block
            prepend-icon="mdi-calendar-edit"
            @click="goToSchedule"
            class="action-btn"
            aria-label="Navigate to Schedule Builder"
          >
            SCHEDULE BUILDER
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-btn
            color="success"
            variant="flat"
            size="large"
            block
            prepend-icon="mdi-book-multiple"
            @click="goToCatalog"
            class="action-btn"
            aria-label="Navigate to Course Catalog"
          >
            Browse Courses
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-btn
            v-if="!authStore.isAuthenticated"
            color="info"
            variant="flat"
            size="large"
            block
            prepend-icon="mdi-account"
            @click="goToUserLogin"
            class="action-btn"
            aria-label="Navigate to User Login"
          >
            User Login
          </v-btn>
          <v-btn
            v-else
            color="info"
            variant="flat"
            size="large"
            block
            prepend-icon="mdi-account-cog"
            :to="{ name: 'profile' }"
            class="action-btn"
            aria-label="Navigate to Profile Settings"
          >
            User Settings
          </v-btn>
        </v-col>
      </v-row>

      <!-- Footer Note -->
      <v-row justify="center" class="mt-8">
        <v-col cols="12" class="text-center">
          <p class="text-caption" style="color: rgb(var(--v-theme-on-surface-variant)); word-break: break-word;" aria-label="Built with love by Your Name, powered by Vue.js and Vuetify">
            Powered by Vue.js & Vuetify
          </p>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<style scoped>
.animate-icon {
  transition: transform 0.3s ease;
}
.animate-icon:hover {
  transform: rotate(15deg) scale(1.1);
}

.action-btn {
  transition: all 0.3s ease;
}
.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Ensure text doesn't overflow */
.text-h3, .text-body-1, .text-caption {
  overflow-wrap: break-word;
  word-wrap: break-word;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
  hyphens: auto;
}

/* Ensure buttons don't overflow on small screens */
.v-btn {
  white-space: normal !important;
  word-break: break-word;
}
</style>