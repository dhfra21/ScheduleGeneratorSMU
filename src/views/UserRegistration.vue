<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6 elevation-6" width="400" rounded="xl" style="background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);">
      <v-card-title class="text-h5 font-weight-bold mb-4" style="color: #1e293b;">
        <v-icon color="primary" size="40" class="mr-2">mdi-account-plus</v-icon>
        Create Account
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleRegistration">
          <v-text-field
            v-model="name"
            label="Full Name"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v || 'Name is required']"
            required
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model="email"
            label="Email"
            prepend-inner-icon="mdi-email"
            variant="outlined"
            density="comfortable"
            :rules="[
              v => !!v || 'Email is required',
              v => /.+@.+\..+/.test(v) || 'Email must be valid'
            ]"
            required
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v || 'Password is required', v => v.length >= 6 || 'Password must be at least 6 characters']"
            required
            type="password"
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model="confirmPassword"
            label="Confirm Password"
            prepend-inner-icon="mdi-lock-check"
            variant="outlined"
            density="comfortable"
            :rules="[
              v => !!v || 'Please confirm your password',
              v => v === password || 'Passwords do not match'
            ]"
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
            :loading="loading"
            type="submit"
            class="mt-2 action-btn"
          >
            Register
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center mt-4">
        <v-btn variant="text" color="secondary" @click="goToLogin">
          <v-icon left>mdi-arrow-left</v-icon> Back to Login
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstance from '@/plugins/axios';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

const handleRegistration = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    
    const response = await axiosInstance.post('/register', {
      name: name.value,
      email: email.value,
      password: password.value
    });
    
    // Registration successful
    console.log('Registration successful:', response.data);
    
    // Redirect to login page
    router.push('/user-login');
  } catch (err) {
    console.error('Registration error:', err);
    error.value = err.response?.data?.error || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  router.push('/user-login');
};
</script>

<style scoped>
.action-btn {
  transition: all 0.3s ease;
}
.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style> 