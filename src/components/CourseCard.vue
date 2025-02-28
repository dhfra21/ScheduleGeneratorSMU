<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  course: {
    type: Object,
    required: true,
    default: () => ({
      course_code: '',
      course_name: '',
      major: 'General',
      year: 'N/A',
      credits: 0,
      groups: []
    })
  }
});

const isHovered = ref(false);
const showDetails = ref(false);

// Generate a consistent color based on the major name
const majorColor = computed(() => {
  const colorMap = {
    'pre-engineering': '#8E24AA', // Purple
    'software engineering': '#1E88E5', // Blue
    'computer systems engineering': '#43A047', // Green
    'renewable energy engineering': '#FB8C00', // Orange
    'pre-engineering': '#757575' // Gray
  };
  
  const majorKey = props.course.major.toLowerCase();
  return colorMap[majorKey] || '#757575'; // Default gray for any unmapped majors
});

// Generate a consistent icon based on the major
const majorIcon = computed(() => {
  const iconMap = {
    'general': 'mdi-book-open-page-variant',
    'software engineering': 'mdi-laptop-windows',
    'computer systems engineering': 'mdi-chip',
    'renewable energy engineering': 'mdi-flash',
    'pre-engineering': 'mdi-account-school'
  };
  
  const majorKey = props.course.major.toLowerCase();
  return iconMap[majorKey] || 'mdi-book-open-page-variant';
});

// Get year-based styling
const yearInfo = computed(() => {
  const yearMap = {
    'freshman': { color: '#42A5F5', icon: 'mdi-numeric-1-circle' },
    'sophomore': { color: '#66BB6A', icon: 'mdi-numeric-2-circle' },
    'junior': { color: '#FFA726', icon: 'mdi-numeric-3-circle' },
    'senior': { color: '#EF5350', icon: 'mdi-numeric-4-circle' }
  };
  
  const yearKey = props.course.year.toLowerCase();
  return yearMap[yearKey] || { color: '#757575', icon: 'mdi-calendar' };
});

// Close details modal when clicking outside
function closeDetailsOnOutsideClick(event) {
  // Only close if clicking directly on the overlay background (not on its children)
  if (event.target.classList.contains('details-overlay')) {
    showDetails.value = false;
  }
}
</script>

<template>
  <v-card
    class="course-card h-100 transition-swing"
    variant="outlined"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :elevation="isHovered ? 8 : 1"
    :class="{ 'on-hover': isHovered }"
  >
    <div class="card-color-tag" :style="{ backgroundColor: majorColor }"></div>
    
    <v-card-title class="text-h6 font-weight-medium pt-6 px-4">
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <span v-bind="props">{{ course.course_code }}</span>
        </template>
        <span>Course Code</span>
      </v-tooltip>
    </v-card-title>
    
    <v-card-subtitle class="text-body-1 mb-2 px-4">
      <span class="course-name">{{ course.course_name }}</span>
    </v-card-subtitle>
    
    <v-divider class="mx-4"></v-divider>
    
    <v-list density="compact" class="bg-transparent px-2">
      <v-list-item>
        <template v-slot:prepend>
          <v-icon :icon="majorIcon" :color="isHovered ? majorColor : ''"></v-icon>
        </template>
        <v-list-item-title class="course-info-item">
          <span class="info-label">Major:</span> {{ course.major }}
        </v-list-item-title>
      </v-list-item>
      
      <v-list-item>
        <template v-slot:prepend>
          <v-icon :icon="yearInfo.icon" :color="isHovered ? yearInfo.color : ''"></v-icon>
        </template>
        <v-list-item-title class="course-info-item">
          <span class="info-label">Year:</span> {{ course.year }}
        </v-list-item-title>
      </v-list-item>
      
      <v-list-item>
        <template v-slot:prepend>
          <v-icon icon="mdi-weight" :color="isHovered ? 'primary' : ''"></v-icon>
        </template>
        <v-list-item-title class="course-info-item">
          <span class="info-label">Credits:</span> {{ course.credits }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
    
    <v-card-actions class="pa-4 pt-0">
      <v-scale-transition>
        <v-btn 
          v-if="isHovered" 
          variant="tonal" 
          :color="majorColor !== '#757575' ? majorColor : 'primary'" 
          size="small" 
          block
          prepend-icon="mdi-information-outline"
          @click="showDetails = true"
        >
          View Details
        </v-btn>
      </v-scale-transition>
    </v-card-actions>
    
    <div class="year-marker" :style="{ backgroundColor: yearInfo.color }"></div>
  </v-card>

  <!-- Course Details Modal -->
  <div v-if="showDetails" class="details-overlay" @click="closeDetailsOnOutsideClick">
    <div class="details-modal" :class="`border-${yearInfo.color}`">
      <div class="modal-header" :style="{ backgroundColor: majorColor }">
        <div class="course-title">
          <h2>{{ course.course_code }}: {{ course.course_name }}</h2>
        </div>
        <v-btn 
          icon 
          variant="text" 
          color="white" 
          size="small"
          @click="showDetails = false"
        >
          <v-icon icon="mdi-close"></v-icon>
        </v-btn>
      </div>

      <div class="modal-content">
        <div class="info-section">
          <h3>Course Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <v-icon :icon="majorIcon" :color="majorColor" class="mr-2"></v-icon>
              <span class="info-label">Major:</span> {{ course.major }}
            </div>
            <div class="info-item">
              <v-icon :icon="yearInfo.icon" :color="yearInfo.color" class="mr-2"></v-icon>
              <span class="info-label">Year:</span> {{ course.year }}
            </div>
            <div class="info-item">
              <v-icon icon="mdi-weight" color="primary" class="mr-2"></v-icon>
              <span class="info-label">Credits:</span> {{ course.credits }}
            </div>
          </div>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Groups Section -->
        <div v-if="course.groups && course.groups.length > 0" class="groups-section">
          <h3>Course Groups</h3>
          
          <v-expansion-panels variant="accordion">
            <v-expansion-panel
              v-for="group in course.groups"
              :key="group.group_number"
              :title="`Group ${group.group_number}`"
              :text="`Professor: ${group.professor}`"
            >
              <template v-slot:text>
                <div class="group-details">
                  <div class="group-info">
                    <v-icon icon="mdi-account-tie" color="primary" class="mr-2"></v-icon>
                    <span class="info-label">Professor:</span> {{ group.professor }}
                  </div>
                  <div class="group-info">
                    <v-icon icon="mdi-map-marker" color="primary" class="mr-2"></v-icon>
                    <span class="info-label">Location:</span> {{ group.classroom }}
                  </div>
                  <div class="group-schedule">
                    <div class="schedule-header">
                      <v-icon icon="mdi-clock-outline" color="primary" class="mr-2"></v-icon>
                      <span class="info-label">Schedule:</span>
                    </div>
                    <div class="time-slots">
                      <div v-for="(slot, index) in group.time_slots" :key="index" class="time-slot">
                        <v-icon icon="mdi-calendar-clock" size="small" class="mr-2"></v-icon>
                        {{ slot }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
        
        <v-divider class="my-4"></v-divider>
        
        <div class="actions">
          <v-btn 
            variant="tonal" 
            :color="majorColor !== '#757575' ? majorColor : 'primary'" 
            @click="showDetails = false"
            prepend-icon="mdi-arrow-left"
          >
            Back to Catalog
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.h-100 {
  height: 100%;
}

.course-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.on-hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-color-tag {
  position: absolute;
  top: 0;
  left: 0;
  height: 5px;
  width: 100%;
}

.year-marker {
  position: absolute;
  bottom: 0;
  right: 0;
  height: 10px;
  width: 10px;
  border-radius: 50%;
  margin: 8px;
}

.course-name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-info-item {
  transition: color 0.2s ease;
}

.on-hover .course-info-item {
  color: var(--v-theme-primary);
}

.info-label {
  font-weight: 500;
  opacity: 0.8;
}

/* Animation for list items */
.v-list-item {
  transition: transform 0.2s ease;
}

.on-hover .v-list-item:hover {
  transform: translateX(5px);
}

/* Details Modal Styling */
.details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  animation: fadeIn 0.2s ease;
}

.details-modal {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

.modal-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.course-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
}

.info-section h3,
.groups-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.2rem;
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.info-item, .group-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.group-details {
  padding: 8px 0;
}

.group-schedule {
  margin-top: 12px;
}

.schedule-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.time-slots {
  padding-left: 28px;
}

.time-slot {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>