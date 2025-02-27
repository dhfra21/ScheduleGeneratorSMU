<script setup>
  defineProps({
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
  </script>
<template>
    <v-card class="pa-4 h-100" variant="outlined">
      <v-card-title class="text-h6 font-weight-medium">
        {{ course.course_code }}
      </v-card-title>
      
      <v-card-subtitle class="text-body-1 mb-2">
        {{ course.course_name }}
      </v-card-subtitle>
  
      <v-list density="compact" class="bg-transparent">
        <v-list-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-book-open-page-variant"></v-icon>
          </template>
          <v-list-item-title>Major: {{ course.major }}</v-list-item-title>
        </v-list-item>
  
        <v-list-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-calendar"></v-icon>
          </template>
          <v-list-item-title>Year: {{ course.year }}</v-list-item-title>
        </v-list-item>
  
        <v-list-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-weight"></v-icon>
          </template>
          <v-list-item-title>Credits: {{ course.credits }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </template>
  
  
  
  <style scoped>
  .h-100 {
    height: 100%;
  }
  </style>