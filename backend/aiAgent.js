// Modified version for browser environment
class AIAgent {
  constructor() {
    this.context = new Map();
    this.baseUrl = 'http://localhost:11434/api';
    this.conversationState = new Map();
    this.useLocalFallback = false; // Flag to use local fallback if API is unavailable
    this.courseData = null; // Will store course data for local recommendations
  }

  async startConversation(studentId) {
    try {
      if (this.useLocalFallback) {
        return this.getLocalFallbackGreeting();
      }

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
      this.useLocalFallback = true; // Switch to fallback mode
      return this.getLocalFallbackGreeting();
    }
  }

  async handleUserResponse(studentId, userMessage) {
    try {
      if (this.useLocalFallback) {
        return this.getLocalFallbackResponse(studentId, userMessage);
      }

      const state = this.conversationState.get(studentId) || { stage: 'initial_greeting' };
      const userContext = this.context.get(studentId) || {};
      
      // Extract information from user message
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('junior') || lowerMessage.includes('sophomore') || 
          lowerMessage.includes('freshman') || lowerMessage.includes('senior')) {
        // Extract year
        const yearMatch = lowerMessage.match(/junior|sophomore|freshman|senior/);
        if (yearMatch) {
          userContext.year = yearMatch[0];
        }
      }

      if (lowerMessage.includes('software') || lowerMessage.includes('computer') || 
          lowerMessage.includes('engineering') || lowerMessage.includes('civil') ||
          lowerMessage.includes('electrical') || lowerMessage.includes('mechanical') ||
          lowerMessage.includes('business')) {
        // Extract major
        const majorMatch = lowerMessage.match(/software engineering|pre-engineering|computer science|electrical engineering|mechanical engineering|civil engineering|business administration/i);
        if (majorMatch) {
          userContext.major = majorMatch[0].toLowerCase();
        }
      }
      
      // Update context with extracted information
      this.updateUserContext(studentId, userContext);
      
      let prompt = '';
      switch (state.stage) {
        case 'initial_greeting':
          prompt = `You are talking to a student who has just responded to your greeting. 
          
          If they mentioned their major and year, acknowledge it and ask about their course preferences.
          If they haven't mentioned their major yet, ask for it politely.
          
          Student context:
          - Major: ${userContext.major || 'Not mentioned yet'}
          - Year: ${userContext.year || 'Not mentioned yet'}
          
          Student's message: "${userMessage}"
          
          IMPORTANT: Respond as if you are having a natural conversation with the student. Do not explain your reasoning or thought process. Do not mention what you're thinking or what you're going to do next.`;
          break;
        case 'collecting_preferences':
          prompt = `You are talking to a student who has shared their preferred courses. 
          
          Based on their major (${userContext.major}) and year (${userContext.year}), suggest relevant courses that would complement their interests.
          
          Student's message: "${userMessage}"
          
          IMPORTANT: Respond as if you are having a natural conversation with the student. Do not explain your reasoning or thought process. Do not mention what you're thinking or what you're going to do next.`;
          break;
        case 'suggesting_courses':
          prompt = `You are talking to a student who wants course suggestions.
          
          Their context:
          - Major: ${userContext.major || 'Not specified'}
          - Year: ${userContext.year || 'Not specified'}
          - Previous courses: ${userContext.previousCourses?.join(', ') || 'None'}
          - Preferred courses: ${userContext.preferredCourses?.join(', ') || 'None'}
          
          Student's message: "${userMessage}"
          
          IMPORTANT: Respond as if you are having a natural conversation with the student. Do not explain your reasoning or thought process. Do not mention what you're thinking or what you're going to do next.`;
          break;
        case 'optimization':
          prompt = `You are talking to a student who wants schedule optimization.
          
          Their preferences:
          - Preferred times: ${userContext.preferredTimes?.join(', ') || 'Not specified'}
          - Course load: ${userContext.courseLoad || 'Not specified'}
          
          Student's message: "${userMessage}"
          
          IMPORTANT: Respond as if you are having a natural conversation with the student. Do not explain your reasoning or thought process. Do not mention what you're thinking or what you're going to do next.`;
          break;
        default:
          prompt = `You are a friendly and helpful AI academic advisor. The student has said: "${userMessage}"
          
          Their context:
          - Major: ${userContext.major || 'Not specified'}
          - Year: ${userContext.year || 'Not specified'}
          
          IMPORTANT: Respond as if you are having a natural conversation with the student. Do not explain your reasoning or thought process. Do not mention what you're thinking or what you're going to do next.`;
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
      this.useLocalFallback = true; // Switch to fallback mode
      return this.getLocalFallbackResponse(studentId, userMessage);
    }
  }

  async setCoursesData(coursesData) {
    this.courseData = coursesData;
  }

  getLocalFallbackGreeting() {
    return "Hello! I'm your Course Advisor AI. I'll help you find the right courses for your academic journey. Could you tell me about your academic year and major?";
  }

  getLocalFallbackResponse(studentId, userMessage) {
    const userContext = this.context.get(studentId) || {};
    const lowerMessage = userMessage.toLowerCase();
    
    // Check if we have course data for recommendations
    if (this.courseData && this.courseData.courses) {
      // Check if message is asking for recommendations
      if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || 
          lowerMessage.includes('what course') || lowerMessage.includes('which course')) {
        
        // Filter courses by major and year if available
        let filteredCourses = this.courseData.courses;
        if (userContext.major) {
          filteredCourses = filteredCourses.filter(course => 
            course.major.toLowerCase() === userContext.major.toLowerCase());
        }
        
        if (userContext.year) {
          filteredCourses = filteredCourses.filter(course => 
            course.year.toLowerCase() === userContext.year.toLowerCase());
        }
        
        // Get up to 3 random courses
        const recommendedCourses = this.getRandomItems(filteredCourses, 3);
        
        if (recommendedCourses.length > 0) {
          let response = `Based on your profile as a ${userContext.year || 'student'} studying ${userContext.major || 'your major'}, here are some courses I would recommend:\n\n`;
          
          recommendedCourses.forEach(course => {
            response += `- ${course.course_code}: ${course.course_name} (${course.credits} credits)\n`;
          });
          
          return response;
        }
      }
      
      // Check if message is about professors
      if (lowerMessage.includes('professor') || lowerMessage.includes('instructor') || 
          lowerMessage.includes('teacher')) {
        
        // Get unique professors
        const professors = [...new Set(this.courseData.courses
          .flatMap(course => course.groups)
          .map(group => group.professor))];
        
        const randomProfessors = this.getRandomItems(professors, 5);
        
        return `Here are some professors teaching in our university:\n\n- ${randomProfessors.join('\n- ')}`;
      }
    }
    
    // Default fallback response
    return "I understand you're interested in planning your academic schedule. Could you tell me more about what specific courses or requirements you're looking for?";
  }

  getRandomItems(array, count) {
    if (!array || array.length === 0) return [];
    if (array.length <= count) return array;
    
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async getCourseRecommendations(studentId, preferences = {}) {
    try {
      if (this.useLocalFallback) {
        return this.getLocalCourseRecommendations(studentId, preferences);
      }
      
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
      this.useLocalFallback = true;
      return this.getLocalCourseRecommendations(studentId, preferences);
    }
  }

  getLocalCourseRecommendations(studentId, preferences = {}) {
    const userContext = this.context.get(studentId) || {};
    
    if (!this.courseData || !this.courseData.courses) {
      return {
        recommendations: "I'm sorry, but I don't have access to the course database at the moment. Please try again later.",
        context: userContext
      };
    }
    
    // Filter courses by major and year if available
    let filteredCourses = this.courseData.courses;
    if (userContext.major) {
      filteredCourses = filteredCourses.filter(course => 
        course.major.toLowerCase() === userContext.major.toLowerCase());
    }
    
    if (userContext.year) {
      filteredCourses = filteredCourses.filter(course => 
        course.year.toLowerCase() === userContext.year.toLowerCase());
    }
    
    // Get up to 5 random courses
    const recommendedCourses = this.getRandomItems(filteredCourses, 5);
    
    if (recommendedCourses.length > 0) {
      let response = `Based on your profile as a ${userContext.year || 'student'} studying ${userContext.major || 'your major'}, here are some courses I would recommend:\n\n`;
      
      recommendedCourses.forEach(course => {
        response += `- ${course.course_code}: ${course.course_name} (${course.credits} credits)\n`;
      });
      
      return {
        recommendations: response,
        context: userContext
      };
    } else {
      return {
        recommendations: "I couldn't find any courses matching your exact criteria. Try broadening your search or speak with your academic advisor for more personalized recommendations.",
        context: userContext
      };
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
      if (this.useLocalFallback) {
        return "I'm operating in offline mode currently. For personalized academic advice, please speak with your academic advisor or try again when the system is fully online.";
      }
      
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
      this.useLocalFallback = true;
      return "I'm operating in offline mode currently. For personalized academic advice, please speak with your academic advisor or try again when the system is fully online.";
    }
  }
}

export const aiAgent = new AIAgent();