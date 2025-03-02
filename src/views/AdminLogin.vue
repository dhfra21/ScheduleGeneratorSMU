<!-- views/Login.vue -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

// Mock admin credentials (replace with real authentication logic)
const ADMIN_CREDENTIALS = {
  email: 'admin@universityscheduler.com',
  password: 'admin123'
};

const login = () => {
  isLoading.value = true;
  error.value = '';

  if (email.value === ADMIN_CREDENTIALS.email && password.value === ADMIN_CREDENTIALS.password) {
    // Simulate successful login (store in localStorage or Vuex for persistence)
    localStorage.setItem('isAdminLoggedIn', 'true');
    router.push('/admin');
  } else {
    error.value = 'Invalid email or password. Please try again.';
  }

  isLoading.value = false;
};
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6 elevation-6" width="400" rounded="xl" style="background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);">
      <v-card-title class="text-h5 font-weight-bold mb-4" style="color: #1e293b;">
        <v-icon color="primary" size="40" class="mr-2">mdi-shield-account</v-icon>
        Admin Login
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="login">
          <v-text-field
            v-model="email"
            label="Email"
            prepend-inner-icon="mdi-email"
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v || 'Email is required']"
            required
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v || 'Password is required']"
            required
            type="password"
            class="mb-4"
          ></v-text-field>

          <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

          <v-btn
            color="primary"
            variant="flat"
            size="large"
            block
            :loading="isLoading"
            type="submit"
            class="mt-2 action-btn"
          >
            Login
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center mt-4">
        <p class="text-caption" style="color: #64748b;">
          Need help? Contact support at admin@universityscheduler.com
        </p>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.action-btn {
  transition: all 0.3s ease;
}
.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>