<template>
  <v-app>
    <!-- Conditionally render NavBar based on isAdminLoggedIn -->
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, watchEffect, watch } from 'vue';
import NavBar from './components/NavBar.vue';

// Reactive variable to store the login state
const isAdminLoggedIn = ref(false);

// Function to check the login state from localStorage
const checkLoginState = () => {
  const loggedIn = localStorage.getItem('isAdminLoggedIn');
  console.log('Logged in from localStorage:', loggedIn); // Debugging
  isAdminLoggedIn.value = loggedIn === 'true'; // Convert string to boolean
};

// Check login state when the component is mounted
onMounted(() => {
  checkLoginState();
});

// Watch for changes in localStorage
watchEffect(() => {
  checkLoginState();
});

// Listen for storage events (e.g., when localStorage is updated from another tab)
window.addEventListener('storage', (event) => {
  if (event.key === 'isAdminLoggedIn') {
    checkLoginState();
  }
});

const loggedIn = ref(localStorage.getItem('isLoggedIn') === 'true');
console.log('Logged in from localStorage:', loggedIn); // Debugging

watch(() => localStorage.getItem('isLoggedIn'), (newValue) => {
  loggedIn.value = newValue === 'true';
});
</script>