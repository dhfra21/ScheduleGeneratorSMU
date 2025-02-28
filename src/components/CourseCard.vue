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
      credits: 0
    })
  }
});

const isHovered = ref(false);

// Generate a consistent color based on the major name
const majorColor = computed(() => {
  const colorMap = {
    'general': '#8E24AA', // Purple
    'software engineering': '#1E88E5', // Blue
    'computer systems engineering': '#43A047', // Green
    'renewable energy engineering': '#FB8C00' // Orange
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
    'renewable energy engineering': 'mdi-flash'
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
        >
          View Details
        </v-btn>
      </v-scale-transition>
    </v-card-actions>
    
    <div class="year-marker" :style="{ backgroundColor: yearInfo.color }"></div>
  </v-card>
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
</style>