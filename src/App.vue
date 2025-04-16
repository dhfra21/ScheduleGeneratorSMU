<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();

onMounted(() => {
  // Check if dark mode is enabled in localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    theme.global.name.value = 'dark';
  }
});
</script>

<style>
:root {
  color-scheme: light dark;
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background)) !important;
}

.v-application {
  background-color: rgb(var(--v-theme-background)) !important;
}

.v-application__wrap {
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background)) !important;
}

.v-main {
  background-color: rgb(var(--v-theme-background)) !important;
}
</style>