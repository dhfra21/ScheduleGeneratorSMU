<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();

onMounted(() => {
  router.push('/schedule'); // Redirect to Course Selection page
});
</script>

<template>
  <v-container>
    <h1>Redirecting to Course Selection...</h1>
  </v-container>
</template>
