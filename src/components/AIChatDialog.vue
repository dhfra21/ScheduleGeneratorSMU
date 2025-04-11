<template>
  <v-dialog v-model="dialog" max-width="800">
    <v-card class="chat-dialog">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-robot</v-icon>
          <span class="text-h6">AI Course Advisor</span>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-card-text class="chat-container pa-4">
        <div class="d-flex flex-column h-100">
          <!-- Conversation Area (Fixed Height) -->
          <div class="conversation-area">
            <div class="messages-container" ref="messagesContainer">
              <div v-for="(message, index) in messages" :key="index" 
                  :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']">
                <div class="message-content">
                  <div class="message-text">{{ message.text }}</div>
                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
              </div>
            </div>
            
            <!-- Profile Selection Section -->
            <div v-if="showProfileSelection" class="profile-selection mt-4 pa-4 rounded bg-grey-lighten-4">
              <h3 class="text-subtitle-1 mb-3">Please select your academic profile:</h3>
              
              <v-select
                v-model="selectedYear"
                label="Academic Year"
                :items="academicYears"
                variant="outlined"
                density="comfortable"
                class="mb-2"
              ></v-select>
              
              <v-select
                v-model="selectedMajor"
                label="Major"
                :items="majors"
                variant="outlined"
                density="comfortable"
                class="mb-2"
              ></v-select>
              
              <v-btn
                color="primary"
                variant="tonal"
                :disabled="!canSubmitProfile"
                @click="submitProfile"
                class="mt-2"
              >
                Continue
              </v-btn>
            </div>
          </div>
          
          <!-- Course Information Area (Scrollable) -->
          <div v-if="showCourseList || selectedCourse" class="course-info-area">
            <!-- Course List Section -->
            <div v-if="showCourseList" class="course-list mb-4 pa-4 rounded bg-grey-lighten-4">
              <h3 class="text-subtitle-1 mb-3">Recommended Courses:</h3>
              
              <v-list lines="two" class="bg-transparent pa-0">
                <v-list-item
                  v-for="course in filteredCourses"
                  :key="course.id"
                  @click="showCourseDetails(course)"
                  :class="{'selected-course': selectedCourse?.id === course.id}"
                  rounded
                  class="mb-1"
                >
                  <v-list-item-title>
                    <strong>{{ course.course_code }}</strong>: {{ course.course_name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ course.credits }} credits • {{ course.year }} • {{ course.major }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              
              <div v-if="filteredCourses.length === 0" class="text-center py-4">
                <p>No courses match your criteria. Try selecting a different year or major.</p>
              </div>
            </div>
            
            <!-- Course Details Section -->
            <div v-if="selectedCourse" class="course-details pa-4 rounded bg-grey-lighten-4">
              <div class="d-flex justify-space-between align-center mb-3">
                <h3 class="text-subtitle-1 mb-0">
                  <strong>{{ selectedCourse.course_code }}</strong>: {{ selectedCourse.course_name }}
                </h3>
                <v-btn icon="mdi-close" variant="text" size="small" @click="selectedCourse = null"></v-btn>
              </div>
              
              <div class="mb-3">
                <div><strong>Credits:</strong> {{ selectedCourse.credits }}</div>
                <div><strong>Year:</strong> {{ selectedCourse.year }}</div>
                <div><strong>Major:</strong> {{ selectedCourse.major }}</div>
              </div>
              
              <v-divider class="mb-3"></v-divider>
              
              <h4 class="text-subtitle-2 mb-2">Available Groups:</h4>
              
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="group in selectedCourse.groups"
                  :key="group.group_number"
                >
                  <v-expansion-panel-title>
                    Group {{ group.group_number }} - {{ group.professor }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div>
                      <p><strong>Classroom:</strong> {{ group.classroom }}</p>
                      <p><strong>Schedule:</strong></p>
                      <ul>
                        <li v-for="(slot, i) in group.time_slots" :key="i">
                          {{ slot.day }}, {{ slot.start_time }} - {{ slot.end_time }}
                        </li>
                      </ul>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-text-field
          v-model="userInput"
          placeholder="Ask me about courses..."
          variant="outlined"
          density="comfortable"
          hide-details
          @keyup.enter="sendMessage"
          :disabled="loading"
        >
          <template v-slot:append>
            <v-btn
              icon="mdi-send"
              color="primary"
              variant="text"
              @click="sendMessage"
              :loading="loading"
              :disabled="!userInput.trim()"
            ></v-btn>
          </template>
        </v-text-field>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue']);

const dialog = ref(props.modelValue);
const messages = ref([]);
const userInput = ref('');
const loading = ref(false);
const messagesContainer = ref(null);
const authStore = useAuthStore();

// UI controls
const showProfileSelection = ref(false);
const showCourseList = ref(false);

// Academic profile
const selectedYear = ref('');
const selectedMajor = ref('');
const academicYears = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
const majors = ['Software Engineering', 'Pre-engineering', 'Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Business Administration'];

// Course data
const allCourses = ref([]);
const selectedCourse = ref(null);

// Computed properties
const canSubmitProfile = computed(() => selectedYear.value && selectedMajor.value);

const filteredCourses = computed(() => {
  if (!selectedYear.value || !selectedMajor.value) return [];
  
  return allCourses.value.filter(course => {
    return (
      (course.major === selectedMajor.value || course.major === 'Pre-engineering') &&
      (course.year === selectedYear.value)
    );
  }).sort((a, b) => a.course_code.localeCompare(b.course_code));
});

// Watch for changes in the modelValue prop
watch(() => props.modelValue, (newValue) => {
  dialog.value = newValue;
  if (newValue) {
    startConversation();
    fetchCourses();
  }
});

// Watch for changes in the dialog value
watch(dialog, (newValue) => {
  emit('update:modelValue', newValue);
});

// Initialize
onMounted(() => {
  fetchCourses();
});

const closeDialog = () => {
  dialog.value = false;
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const startConversation = async () => {
  try {
    loading.value = true;
    messages.value = []; // Clear existing messages
    selectedCourse.value = null; // Reset selected course
    showProfileSelection.value = false;
    showCourseList.value = false;
    
    const response = await axios.post('http://localhost:3000/api/ai/chat/start', {
      studentId: authStore.user.id
    });
    
    messages.value.push({
      type: 'ai',
      text: response.data.message,
      timestamp: new Date()
    });
    
    showProfileSelection.value = true;
    
    await scrollToBottom();
  } catch (error) {
    console.error('Error starting conversation:', error);
    messages.value.push({
      type: 'ai',
      text: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date()
    });
  } finally {
    loading.value = false;
  }
};

const fetchCourses = async () => {
  try {
    const response = await axios.get('http://localhost:3000/courses');
    allCourses.value = response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};

const submitProfile = async () => {
  try {
    loading.value = true;
    
    // Create a message to show what the user selected
    const profileMessage = `I am a ${selectedYear.value.toLowerCase()} ${selectedMajor.value.toLowerCase()} student.`;
    
    messages.value.push({
      type: 'user',
      text: profileMessage,
      timestamp: new Date()
    });
    
    await scrollToBottom();
    
    // Update the AI agent's context with the selected profile
    await axios.post('http://localhost:3000/api/ai/context', {
      studentId: authStore.user.id,
      context: {
        year: selectedYear.value,
        major: selectedMajor.value
      }
    });
    
    // Send the profile message to the AI
    const response = await axios.post('http://localhost:3000/api/ai/chat/message', {
      studentId: authStore.user.id,
      message: profileMessage
    });
    
    messages.value.push({
      type: 'ai',
      text: response.data.message,
      timestamp: new Date()
    });
    
    // Show the course list
    showProfileSelection.value = false;
    showCourseList.value = true;
    
    await scrollToBottom();
  } catch (error) {
    console.error('Error submitting profile:', error);
    messages.value.push({
      type: 'ai',
      text: 'Sorry, I encountered an error processing your profile. Please try again.',
      timestamp: new Date()
    });
  } finally {
    loading.value = false;
  }
};

const showCourseDetails = async (course) => {
  selectedCourse.value = course;
  
  try {
    // Add an AI message about the selected course
    messages.value.push({
      type: 'ai',
      text: `${course.course_code}: ${course.course_name} is a ${course.credits}-credit course for ${course.year} students.`,
      timestamp: new Date()
    });
    
    await scrollToBottom();
  } catch (error) {
    console.error('Error showing course details:', error);
  }
};

const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return;

  const userMessage = userInput.value.trim();
  userInput.value = '';
  
  messages.value.push({
    type: 'user',
    text: userMessage,
    timestamp: new Date()
  });
  
  await scrollToBottom();
  
  try {
    loading.value = true;
    
    // Handle specific command keywords to trigger interface actions
    if (userMessage.toLowerCase().includes('show courses') || 
        userMessage.toLowerCase().includes('see courses') ||
        userMessage.toLowerCase().includes('list courses')) {
      showCourseList.value = true;
      selectedCourse.value = null;
      
      messages.value.push({
        type: 'ai',
        text: `Here are the recommended courses for ${selectedYear.value} ${selectedMajor.value} students.`,
        timestamp: new Date()
      });
    } 
    else {
      // Send to AI for general questions
      const response = await axios.post('http://localhost:3000/api/ai/chat/message', {
        studentId: authStore.user.id,
        message: userMessage
      });
      
      messages.value.push({
        type: 'ai',
        text: response.data.message,
        timestamp: new Date()
      });
      
      // Check message for course-related queries
      checkMessageForCourseRelatedContent(userMessage);
    }
    
    await scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);
    messages.value.push({
      type: 'ai',
      text: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date()
    });
  } finally {
    loading.value = false;
  }
};

// Check message for course-related content
const checkMessageForCourseRelatedContent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Look for specific course codes in the message
  for (const course of allCourses.value) {
    const courseCodeNoSpace = course.course_code.replace(/\s+/g, '');
    
    if (lowerMessage.includes(course.course_code.toLowerCase()) || 
        lowerMessage.includes(courseCodeNoSpace.toLowerCase())) {
      selectedCourse.value = course;
      return;
    }
  }
  
  // Look for course topics or names
  for (const course of filteredCourses.value) {
    const nameParts = course.course_name.toLowerCase().split(' ');
    // Check if at least two words from the course name are in the message
    // (to avoid false positives with common words)
    const matchCount = nameParts.filter(part => 
      part.length > 3 && lowerMessage.includes(part)
    ).length;
    
    if (matchCount >= 2) {
      selectedCourse.value = course;
      return;
    }
  }
};
</script>

<style scoped>
.chat-dialog {
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.chat-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

/* Split layout with fixed conversation area and scrollable course info */
.conversation-area {
  flex: 0 0 auto;  /* Don't shrink or grow */
  max-height: 40vh; /* Fixed height */
  overflow-y: auto;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.course-info-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  max-width: 80%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.user-message {
  align-self: flex-end;
}

.ai-message {
  align-self: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-message .message-content {
  background-color: #1976d2;
  color: white;
  border-bottom-right-radius: 4px;
  margin-left: 20%;
}

.ai-message .message-content {
  background-color: white;
  color: #1a1a1a;
  border-bottom-left-radius: 4px;
  margin-right: 20%;
  border: 1px solid #e0e0e0;
}

.message-text {
  font-size: 0.95rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 4px;
  text-align: right;
}

.user-message .message-time {
  color: rgba(255, 255, 255, 0.9);
}

.ai-message .message-time {
  color: #666;
}

/* Custom scrollbar */
.conversation-area::-webkit-scrollbar,
.course-info-area::-webkit-scrollbar {
  width: 6px;
}

.conversation-area::-webkit-scrollbar-track,
.course-info-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.conversation-area::-webkit-scrollbar-thumb,
.course-info-area::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.conversation-area::-webkit-scrollbar-thumb:hover,
.course-info-area::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Course list and details */
.selected-course {
  background-color: rgba(25, 118, 210, 0.1);
}

.v-list-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.v-list-item:hover {
  background-color: rgba(25, 118, 210, 0.05);
}

.course-list, .course-details {
  background-color: #ffffff;
}
</style>