<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
const router = useRouter();

onMounted(() => {
  router.push('/UserMain'); 
  });
const goToSchedule = () => router.push('/schedule');
const goToCatalog = () => router.push('/courses');


</script>

<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height pa-0">
        <v-row no-gutters class="fill-height">
          <!-- Left: Schedule Display (8 columns) -->
          <v-col cols="8" class="d-flex justify-center align-center">
            <img class="SchedHolder" src="@/assets/SchedulePlaceHolder.png" alt="Schedule">
          </v-col>

          <!-- Right: Buttons Panel (4 columns) -->
          <v-col cols="4" class="d-flex flex-column justify-center align-end">
            <div class="button-container">

              <v-btn
          color="primary"
          variant="flat"
          size="large"
          block
          prepend-icon="mdi-calendar-edit"
          @click="goToSchedule"
          class="action-btn"
          aria-label="Navigate to Schedule Builder"
        >
          SCHEDULE BUILDER
        </v-btn>

              <v-btn color="primary" size="large" class="px-10 my-3" @click="goToFullView">Vue Schedule</v-btn>
              
              <v-btn
          color="success"
          variant="flat"
          size="large"
          block
          prepend-icon="mdi-book-multiple"
          @click="goToCatalog"
          class="action-btn"
          aria-label="Navigate to Course Catalog"
        >
          Browse Courses
        </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.fill-height {
  height: calc(100vh - 64px);
}

/* Image Styling */
.SchedHolder {
  max-width: 80%;
  height: auto;
  display: block;
  margin: auto;
}

/* Right-align buttons while keeping them vertically spaced */
.button-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end; 
  padding-right: 20px;
  gap: 16px; 
}




.animate-icon {
  transition: transform 0.3s ease;
}
.animate-icon:hover {
  transform: rotate(15deg) scale(1.1);
}

.action-btn {
  transition: all 0.3s ease;
}
.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>

