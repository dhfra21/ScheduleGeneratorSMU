<template>
  <v-app>
    <Navbar v-if="showNavbar" />
    <v-main :class="{ 'pt-0': !showNavbar }">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const showNavbar = computed(() => !['login', 'admin'].includes(route.name));
</script>

<style scoped>
.v-main {
  background-color: #f8fafc;
}
</style>
