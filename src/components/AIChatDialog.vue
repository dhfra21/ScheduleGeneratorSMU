<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card class="chat-dialog">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-robot</v-icon>
          <span class="text-h6">AI Course Advisor</span>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-card-text class="chat-container pa-4">
        <div class="messages-container" ref="messagesContainer">
          <div v-for="(message, index) in messages" :key="index" 
               :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']">
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-text-field
          v-model="userInput"
          placeholder="Type your message..."
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
import { ref, watch, nextTick } from 'vue';
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

// Watch for changes in the modelValue prop
watch(() => props.modelValue, (newValue) => {
  dialog.value = newValue;
  if (newValue) {
    startConversation();
  }
});

// Watch for changes in the dialog value
watch(dialog, (newValue) => {
  emit('update:modelValue', newValue);
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
    const response = await axios.post('http://localhost:3000/api/ai/chat/start', {
      studentId: authStore.user.id
    });
    
    messages.value.push({
      type: 'ai',
      text: response.data.message,
      timestamp: new Date()
    });
    
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
    const response = await axios.post('http://localhost:3000/api/ai/chat/message', {
      studentId: authStore.user.id,
      message: userMessage
    });
    
    messages.value.push({
      type: 'ai',
      text: response.data.message,
      timestamp: new Date()
    });
    
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

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
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

/* Add hover effect for messages */
.message-content:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* Custom scrollbar for messages container */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style> 