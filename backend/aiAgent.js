import fetch from 'node-fetch';

class AIAgent {
  constructor() {
    this.context = new Map();
    this.baseUrl = 'http://localhost:11434/api';
    this.conversationState = new Map();
  }

  async startConversation(studentId) {
    try {
      const prompt = `You are a friendly and helpful AI academic advisor. Greet the student warmly and ask them about their academic year and major. Keep your response concise and friendly. IMPORTANT: Respond as if you are having a natural conversation with the student. Do not explain your reasoning or thought process. Do not mention what you're thinking or what you're going to do next.`;
      
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: prompt,
          stream: false
        })
      });

      const data = await response.json();
      this.conversationState.set(studentId, { stage: 'initial_greeting' });
      return data.response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }

  async handleUserResponse(studentId, userMessage) {
    try {
      const state = this.conversationState.get(studentId) || { stage: 'initial_greeting' };
      const userContext = this.context.get(studentId) || {};
      
      // Extract information from user message
      if (userMessage.toLowerCase().includes('junior') && userMessage.toLowerCase().includes('software')) {
        this.updateUserContext(studentId, {
          year: 'junior',
          major: 'software engineering'
        });
      }
      
      let prompt = '';
      switch (state.stage) {
        case 'initial_greeting':
          prompt = `You are talking to a student who has just responded to your greeting. 
          
          If they mentioned their major and year, acknowledge it and ask about their course preferences.
          If they haven't mentioned their major yet, ask for it politely.
          
          IMPORTANT: Respond as if you are having a natural conversation with the student. Do not explain your reasoning or thought process. Do not mention what you're thinking or what you're going to do next.`;
          break;
        case 'collecting_preferences':
          prompt = `You are talking to a student who has shared their preferred courses. 
          
          Based on their major (${userContext.major}) and year (${userContext.year}), suggest relevant courses that would complement their interests.
          
          IMPORTANT: Respond as if you are having a natural conversation with the student. Do not explain your reasoning or thought process. Do not mention what you're thinking or what you're going to do next.`;
          break;
        case 'suggesting_courses':
          prompt = `You are talking to a student who wants course suggestions.
          
          Their context:
          - Major: ${userContext.major}
          - Year: ${userContext.year}
          - Previous courses: ${userContext.previousCourses?.join(', ') || 'None'}
          - Preferred courses: ${userContext.preferredCourses?.join(', ') || 'None'}
          
          IMPORTANT: Respond as if you are having a natural conversation with the student. Do not explain your reasoning or thought process. Do not mention what you're thinking or what you're going to do next.`;
          break;
        case 'optimization':
          prompt = `You are talking to a student who wants schedule optimization.
          
          Their preferences:
          - Preferred times: ${userContext.preferredTimes?.join(', ') || 'Not specified'}
          - Course load: ${userContext.courseLoad || 'Not specified'}
          
          IMPORTANT: Respond as if you are having a natural conversation with the student. Do not explain your reasoning or thought process. Do not mention what you're thinking or what you're going to do next.`;
          break;
      }

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: prompt,
          stream: false
        })
      });

      const data = await response.json();
      
      // Update conversation state based on the response
      if (data.response.toLowerCase().includes('preferred courses')) {
        this.conversationState.set(studentId, { stage: 'collecting_preferences' });
      } else if (data.response.toLowerCase().includes('optimized schedule')) {
        this.conversationState.set(studentId, { stage: 'optimization' });
      } else if (data.response.toLowerCase().includes('suggest')) {
        this.conversationState.set(studentId, { stage: 'suggesting_courses' });
      }

      return data.response;
    } catch (error) {
      console.error('Error handling user response:', error);
      throw error;
    }
  }

  async getCourseRecommendations(studentId, preferences = {}) {
    try {
      const userContext = this.context.get(studentId) || {};
      const prompt = this.buildRecommendationPrompt(userContext, preferences);
      
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: `You are an AI academic advisor helping students choose their courses. Consider their academic history, interests, and requirements.\n\n${prompt}`,
          stream: false
        })
      });

      const data = await response.json();
      return {
        recommendations: data.response,
        context: userContext
      };
    } catch (error) {
      console.error('Error getting course recommendations:', error);
      throw error;
    }
  }

  buildRecommendationPrompt(userContext, preferences) {
    return `As an AI advisor, please help recommend courses for ${userContext.name || 'the student'}.
    Consider the following context:
    - Previous courses: ${userContext.previousCourses?.join(', ') || 'None'}
    - Major: ${userContext.major || 'Not specified'}
    - Year: ${userContext.year || 'Not specified'}
    - Preferences: ${JSON.stringify(preferences)}
    
    Please provide personalized course recommendations based on this information.`;
  }

  updateUserContext(studentId, newContext) {
    const existingContext = this.context.get(studentId) || {};
    this.context.set(studentId, { ...existingContext, ...newContext });
  }

  async getPersonalizedAdvice(studentId, question) {
    try {
      const userContext = this.context.get(studentId) || {};
      const prompt = `As an AI advisor for ${userContext.name || 'the student'}, please provide advice on: ${question}
      Consider their context:
      - Major: ${userContext.major || 'Not specified'}
      - Year: ${userContext.year || 'Not specified'}
      - Previous courses: ${userContext.previousCourses?.join(', ') || 'None'}`;

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: `You are a helpful AI academic advisor providing personalized guidance to students.\n\n${prompt}`,
          stream: false
        })
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error getting personalized advice:', error);
      throw error;
    }
  }
}

export const aiAgent = new AIAgent(); 