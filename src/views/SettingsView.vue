<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6 elevation-6" width="400" rounded="xl">
      <v-card-title class="text-h5 font-weight-bold mb-4">
        <v-icon color="primary" size="40" class="mr-2">mdi-cog</v-icon>
        Settings
      </v-card-title>

      <v-card-text>
        <v-list>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon icon="mdi-theme-light-dark" class="mr-2"></v-icon>
            </template>
            <v-list-item-title>Dark Mode</v-list-item-title>
            <template v-slot:append>
              <v-switch
                v-model="isDarkMode"
                color="primary"
                hide-details
                @change="toggleDarkMode"
              ></v-switch>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();
const isDarkMode = ref(false);

onMounted(() => {
  // Check if dark mode is enabled in localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDarkMode.value = true;
    theme.global.name.value = 'dark';
  }
});

const toggleDarkMode = () => {
  theme.global.name.value = isDarkMode.value ? 'dark' : 'light';
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
};
</script>

<style scoped>
.v-list-item {
  padding: 12px 0;
}
</style> 