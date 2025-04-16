<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6 elevation-6" width="400" rounded="xl" :style="{ background: `linear-gradient(145deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-background)) 100%)` }">
      <v-card-title class="text-h5 font-weight-bold mb-4" :style="{ color: 'rgb(var(--v-theme-on-surface))' }">
        <v-icon color="primary" size="40" class="mr-2">mdi-account</v-icon>
        Login
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleLogin">
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

          <v-alert v-if="authStore.error" type="error" class="mb-4">{{ authStore.error }}</v-alert>

          <v-btn
            color="primary"
            variant="flat"
            size="large"
            block
            :loading="authStore.loading"
            type="submit"
            class="mt-2 action-btn"
          >
            Login
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center mt-4">
        <v-btn variant="text" color="secondary" @click="goHome">
          <v-icon left>mdi-home</v-icon> Go to Home
        </v-btn>
      </v-card-actions>
      
      <v-divider class="my-4"></v-divider>
      
      <v-card-text class="text-center">
        <p class="text-body-2 mb-2">Don't have an account?</p>
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          @click="goToRegister"
          class="mt-1"
        >
          Create Account
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const email = ref('');
const password = ref('');

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value);
  
  if (success) {
    // Clear any previous errors
    authStore.clearError();
    // Redirect based on role
    if (authStore.isAdmin) {
      router.push('/admin');
    } else {
      router.push('/schedule');
    }
  }
};

const goHome = () => {
  router.push('/');
};

const goToRegister = () => {
  router.push('/register');
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