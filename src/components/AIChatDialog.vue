<template>
  <v-dialog v-model="dialog" max-width="900" persistent scrollable>
    <v-card class="chat-dialog">
      <!-- Header - Improved contrast and spacing -->
      <v-card-title class="d-flex justify-space-between align-center pa-4 bg-primary">
        <div class="d-flex align-center">
          <v-icon color="white" class="mr-2">mdi-robot</v-icon>
          <span class="text-h6 font-weight-medium text-white">Course Advisor AI</span>
        </div>
        <div class="d-flex align-center">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-tune"
                variant="text"
                size="small"
                class="mr-2"
                color="white"
                title="AI Model Settings"
              ></v-btn>
            </template>
            <v-list density="compact">
              <v-list-subheader class="font-weight-bold">AI MODEL</v-list-subheader>
              <v-list-item
                v-for="model in aiModels"
                :key="model.id"
                :value="model.id"
                @click="changeAiModel(model.id)"
                :title="model.name"
                density="comfortable"
              >
                <template v-slot:prepend>
                  <v-icon :color="currentModel === model.id ? 'primary' : undefined">
                    {{ currentModel === model.id ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                  </v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn 
            icon="mdi-close" 
            variant="text" 
            color="white" 
            @click="closeDialog"
            class="ml-2"
          ></v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Main content area - Improved layout structure -->
      <v-card-text class="chat-container pa-0 d-flex" style="height: 65vh;">
        <!-- Conversation area - Better scrolling behavior -->
        <div class="conversation-area flex-grow-1 d-flex flex-column" style="overflow: hidden;">
          <div 
            class="messages-container pa-4 flex-grow-1" 
            ref="messagesContainer"
            :style="{ 'padding-bottom': showProfileSelection ? '180px' : '16px' }"
          >
            <!-- Empty state - Improved visual design -->
            <div v-if="messages.length === 0" class="empty-state d-flex flex-column align-center justify-center h-100">
              <v-icon size="72" color="grey-lighten-2" class="mb-4">mdi-robot-happy-outline</v-icon>
              <div class="text-subtitle-1 text-grey-darken-1 font-weight-medium text-center">
                Start a conversation with your<br>AI Course Advisor
              </div>
              <v-btn 
                color="primary" 
                variant="tonal" 
                size="small" 
                class="mt-4"
                @click="startConversation"
              >
                Begin Chat
              </v-btn>
            </div>

            <!-- Messages - Improved bubble styling -->
            <div 
              v-for="(message, index) in messages" 
              :key="index" 
              :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']"
            >
              <div class="message-content">
                <div class="message-text" v-if="!message.isThinking">{{ message.text }}</div>
                <div v-else class="message-thinking d-flex align-center">
                  <v-progress-circular indeterminate size="20" width="2" color="primary" class="mr-2"></v-progress-circular>
                  <span class="text-caption">Thinking...</span>
                </div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                
                <!-- Course chips - Better spacing and interaction -->
                <div 
                  v-if="message.type === 'ai' && !message.isThinking && detectCourseCodes(message.text).length > 0" 
                  class="mt-2"
                >
                  <v-chip
                    v-for="(code, i) in detectCourseCodes(message.text)"
                    :key="i"
                    color="primary"
                    size="small"
                    class="mr-1 mb-1"
                    @click="findAndShowCourse(code)"
                    variant="elevated"
                    :prepend-icon="code.match(/[A-Z]{2,4}/)?.[0] === selectedMajor.value?.substring(0,3) ? 'mdi-star' : undefined"
                  >
                    {{ code }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Profile selection - Better positioning and styling -->
          <v-slide-y-transition>
            <div 
              v-if="showProfileSelection" 
              class="profile-selection bg-grey-lighten-3 pa-4"
              style="position: absolute; bottom: 0; left: 0; right: 0;"
            >
              <h3 class="text-subtitle-1 mb-3 font-weight-medium">Select your academic profile</h3>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedYear"
                    label="Academic Year"
                    :items="academicYears"
                    variant="outlined"
                    density="comfortable"
                    bg-color="white"
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedMajor"
                    label="Major"
                    :items="majors"
                    variant="outlined"
                    density="comfortable"
                    bg-color="white"
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" class="mt-2">
                  <v-btn
                    color="primary"
                    variant="flat"
                    :disabled="!canSubmitProfile"
                    @click="submitProfile"
                    block
                    size="large"
                  >
                    Continue
                    <v-icon right>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </v-slide-y-transition>
        </div>

        <!-- Course info area - Better separation and scrolling -->
        <v-navigation-drawer
          v-model="showCourseList"
          location="right"
          width="380"
          temporary
          floating
          class="course-info-area"
          :style="{ 'border-left': '1px solid rgba(0,0,0,0.12)' }"
        >
          <v-card flat class="h-100 d-flex flex-column">
            <!-- Course list header -->
            <v-card-title class="d-flex align-center bg-grey-lighten-4">
              <v-icon class="mr-2">mdi-book-education</v-icon>
              <span class="text-subtitle-1 font-weight-medium">Recommended Courses</span>
              <v-spacer></v-spacer>
              <v-badge 
                :content="filteredCourses.length" 
                color="primary"
                inline
              ></v-badge>
            </v-card-title>

            <v-divider></v-divider>

            <!-- Course list content -->
            <v-card-text class="flex-grow-1 pa-0" style="overflow-y: auto;">
              <v-list lines="two" class="pa-0">
                <v-list-item
                  v-for="course in filteredCourses"
                  :key="course.id"
                  @click="showCourseDetails(course)"
                  :class="{ 'bg-grey-lighten-4': selectedCourse?.id === course.id }"
                  class="px-4"
                >
                  <template v-slot:prepend>
                    <v-avatar color="primary-lighten-5" size="40">
                      <span class="text-caption font-weight-bold">{{ course.course_code.split(' ')[0] }}</span>
                    </v-avatar>
                  </template>
                  
                  <v-list-item-title class="font-weight-medium">
                    {{ course.course_code }}: {{ course.course_name }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    <v-chip size="x-small" class="mr-1">{{ course.credits }} credits</v-chip>
                    <v-chip size="x-small" class="mr-1">{{ course.year }}</v-chip>
                    <v-chip size="x-small">{{ course.major }}</v-chip>
                  </v-list-item-subtitle>
                  
                  <template v-slot:append>
                    <v-btn
                      icon="mdi-plus"
                      variant="text"
                      color="primary"
                      size="small"
                      @click.stop="addCourseToSchedule(course)"
                      title="Add to Schedule"
                    ></v-btn>
                  </template>
                </v-list-item>
                
                <v-list-item v-if="filteredCourses.length === 0">
                  <v-list-item-title class="text-center text-grey py-4">
                    No courses match your criteria
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-navigation-drawer>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Input area - Improved layout and accessibility -->
      <v-card-actions class="pa-3 bg-grey-lighten-4">
        <v-text-field
          v-model="userInput"
          placeholder="Ask about courses, schedules, or requirements..."
          variant="outlined"
          density="comfortable"
          hide-details
          single-line
          @keyup.enter="sendMessage"
          :disabled="loading"
          bg-color="white"
          prepend-inner-icon="mdi-message-text-outline"
          class="flex-grow-1 mr-2"
          clearable
          @click:clear="userInput = ''"
        >
          <template v-slot:append>
            <v-btn
              icon="mdi-send"
              color="primary"
              variant="flat"
              @click="sendMessage"
              :loading="loading"
              :disabled="!userInput.trim()"
              size="large"
            ></v-btn>
          </template>
        </v-text-field>
      </v-card-actions>
    </v-card>
    
    <!-- Snackbar - Improved positioning and styling -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
      elevation="24"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">
          {{ snackbarColor === 'success' ? 'mdi-check-circle' : 
             snackbarColor === 'error' ? 'mdi-alert-circle' : 'mdi-information' }}
        </v-icon>
        {{ snackbarText }}
      </div>
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
          :color="snackbarColor === 'info' ? 'primary' : 'white'"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script setup>
// ... (keep your existing script section exactly as is) ...
</script>

<style scoped>
.chat-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.chat-container {
  position: relative;
}

/* Message bubbles - Improved styling */
.message {
  max-width: 85%;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.user-message .message-content {
  background-color: var(--v-primary-base);
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message .message-content {
  background-color: white;
  color: var(--v-on-background-base);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom-left-radius: 4px;
}

.message-text {
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.8;
  margin-top: 4px;
  text-align: right;
}

.user-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.ai-message .message-time {
  color: rgba(0, 0, 0, 0.6);
}

/* Empty state - More prominent */
.empty-state {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.empty-state:hover {
  opacity: 1;
}

/* Course info area - Better separation */
.course-info-area {
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  background: #fafafa;
}

/* Profile selection - Smoother transition */
.profile-selection {
  transition: all 0.3s ease;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .message {
    max-width: 90%;
  }
  
  .v-navigation-drawer {
    width: 100% !important;
    max-width: 100%;
    height: 40vh;
    position: absolute;
    bottom: 0;
    top: auto !important;
  }
  
  .chat-container {
    height: 60vh !important;
  }
}

/* Custom scrollbars */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

/* Animation for new messages */
.message {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>