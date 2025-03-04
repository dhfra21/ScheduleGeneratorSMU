<template>
  <v-app>
    <Navbar v-if="showNavbar" />
    <v-main>
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
