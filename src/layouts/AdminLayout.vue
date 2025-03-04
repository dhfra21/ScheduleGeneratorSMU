<template>
  <v-app class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar @navigate="(view) => currentView = view" />

    <!-- Main Content -->
    <v-main class="admin-main">
      <AdminView :current-view="currentView" />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import AdminSidebar from "@/components/AdminSidebar.vue";
import AdminView from "@/components/AdminView.vue"; // Adjust the import path as needed

const currentView = ref("dashboard"); // Default view
</script>

<style scoped>
/* Ensure layout uses flexbox and prevents overlap */
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Main content should start after the sidebar */
.admin-main {
  flex-grow: 1;
  margin-left: 250px; /* Match the sidebar width from AdminSidebar */
  overflow-y: auto; /* Allow scrolling if content exceeds viewport */
  min-height: 100vh;
  padding: 16px;
}
</style>