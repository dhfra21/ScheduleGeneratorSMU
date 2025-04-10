<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script setup>
// App.vue is now just a simple wrapper for the router view
// All layout logic is handled by the layout components
</script>

<style>
:root {
  --v-primary-base: #1976D2;
  --v-primary-darken-1: #1565C0;
}

.v-application {
  background-color: #f8fafc !important;
}
</style>