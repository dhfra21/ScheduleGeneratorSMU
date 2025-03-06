<template>
  <v-app-bar color="primary" density="compact">
    <v-container class="d-flex align-center">
      <!-- Left: Back Button -->
      <v-btn v-if="route.path != '/UserMain'" icon @click="goBack">
        <v-icon class="BackB">mdi-chevron-left-circle</v-icon>
      </v-btn>

      <!-- Page Title -->
      <span class="text-h6 text-white ml-2">{{ currentTitle }}</span>

      <v-spacer></v-spacer> <!-- Pushes user info to the right -->

      <!-- Right: User Info with Dropdown -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" class="user-menu">
            <span class="NavbarText mr-2">{{USER_CREDENTIALS?.value?.name || ' Mourad Koch' }}</span>
            <v-avatar size="40">
              <img src="" alt="Profile">
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="goToProfile">
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item>
            <v-list-item-title class="text-red">Log Out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { inject } from 'vue';
const route = useRoute();
const router = useRouter();
const currentTitle = ref('');
const USER_CREDENTIALS = inject('USER_CREDENTIALS')

// Watch for route changes and update title dynamically
watchEffect(() => {
  currentTitle.value = route.meta.title || 'Unknown Page';
});

// Functions to navigate
const goBack = () => {
  router.push('/UserMain');
};

const goToProfile = () => {
  router.push('/Profile');
};

</script>

<style scoped>
/* Navbar Text Styling */
.NavbarText {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
  color: white;
}

/* Back Button Styling */
.BackB {
  transition: all 0.3s ease;
}
.BackB:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Dropdown Menu Button */
.user-menu {
  display: flex;
  align-items: center;
  text-transform: none; /* Prevents capitalization */
}
</style>
