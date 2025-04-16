<template>
  <v-container class="profile-settings">
    <v-row>
      <v-col cols="12" md="8" offset-md="2">
        <v-card class="profile-card" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-account-cog" color="primary" class="mr-2"></v-icon>
            <span class="text-h5">Profile Settings</span>
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="updateProfile" ref="form">
              <v-text-field
                v-model="formData.name"
                label="Full Name"
                variant="outlined"
                :rules="[v => !!v || 'Name is required']"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="formData.email"
                label="Email"
                variant="outlined"
                :rules="[
                  v => !!v || 'Email is required',
                  v => /.+@.+\..+/.test(v) || 'Email must be valid'
                ]"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="formData.currentPassword"
                label="Current Password"
                type="password"
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="formData.newPassword"
                label="New Password"
                type="password"
                variant="outlined"
                :rules="[
                  v => !v || v.length >= 6 || 'Password must be at least 6 characters'
                ]"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="formData.confirmPassword"
                label="Confirm New Password"
                type="password"
                variant="outlined"
                :rules="[
                  v => !v || v === formData.newPassword || 'Passwords must match'
                ]"
                class="mb-4"
              ></v-text-field>

              <div class="d-flex justify-end">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                  :disabled="loading"
                >
                  Save Changes
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top"
      :timeout="3000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const authStore = useAuthStore();
const form = ref(null);
const loading = ref(false);

const formData = ref({
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

// Initialize form with current user data
onMounted(() => {
  if (authStore.user) {
    formData.value.name = authStore.user.name;
    formData.value.email = authStore.user.email;
  }
});

const updateProfile = async () => {
  const { valid } = await form.value.validate();
  
  if (!valid) return;

  loading.value = true;
  try {
    const updateData = {
      name: formData.value.name,
      email: formData.value.email
    };

    // Only include password fields if they are filled
    if (formData.value.currentPassword && formData.value.newPassword) {
      updateData.currentPassword = formData.value.currentPassword;
      updateData.newPassword = formData.value.newPassword;
    }

    const response = await axios.put(
      `http://localhost:3000/users/${authStore.user.id}`,
      updateData
    );

    // Update local user data
    authStore.user = response.data;
    localStorage.setItem('auth_user', JSON.stringify(response.data));

    // Show success message
    snackbar.value = {
      show: true,
      text: 'Profile updated successfully',
      color: 'success'
    };

    // Clear password fields
    formData.value.currentPassword = '';
    formData.value.newPassword = '';
    formData.value.confirmPassword = '';
  } catch (error) {
    console.error('Error updating profile:', error);
    snackbar.value = {
      show: true,
      text: error.response?.data?.message || 'Failed to update profile',
      color: 'error'
    };
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.profile-settings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-card {
  border-radius: 12px;
  overflow: hidden;
}

.v-card-title {
  padding: 1.5rem;
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
}

.v-card-text {
  padding: 2rem;
}

@media (max-width: 600px) {
  .profile-settings {
    padding: 1rem;
  }
  
  .v-card-text {
    padding: 1rem;
  }
}
</style> 