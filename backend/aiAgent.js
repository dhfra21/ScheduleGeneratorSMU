import fetch from 'node-fetch';

/**
 * A simplified AI Agent that focuses on course suggestion and
 * information retrieval with minimal responses
 */
class AIAgent {
  constructor() {
    // Store user context
    this.context = new Map();
    // API endpoint for AI model
    this.baseUrl = 'http://localhost:11434/api';
    // Track current state for each user
    this.conversationState = new Map();
  }

  /**
   * Starts a new conversation with a fixed, concise greeting
   */
  async startConversation(studentId) {
    try {
      // Set initial state
      this.conversationState.set(studentId, { 
        stage: 'initial_greeting'
      });
      
      // Return fixed greeting - no AI generation
      return "Hi! Select your year and major to get started.";
    } catch (error) {
      console.error('Error starting conversation:', error);
      return "Welcome! Select your academic details to begin.";
    }
  }

  /**
   * Processes user responses using pattern matching and state tracking
   */
  async handleUserResponse(studentId, userMessage) {
    try {
      // Get or initialize state and context
      const state = this.conversationState.get(studentId) || { stage: 'initial_greeting' };
      const userContext = this.context.get(studentId) || {};
      
      // Extract user info from message
      this.extractAndUpdateContext(studentId, userMessage);
      
      // Get updated context after extraction
      const updatedContext = this.context.get(studentId) || {};
      
      // Determine next state based on current state and context
      const nextState = this.determineNextState(state.stage, updatedContext);
      
      // Get appropriate response for the current situation
      let response = this.getResponseForState(nextState, updatedContext);
      
      // Update conversation state
      this.conversationState.set(studentId, { 
        stage: nextState
      });
      
      return response;
    } catch (error) {
      console.error('Error handling user response:', error);
      return "I understand. How can I help with your courses?";
    }
  }

  /**
   * Extracts information from user messages using pattern matching
   */
  extractAndUpdateContext(studentId, message) {
    const context = this.context.get(studentId) || {};
    const updatedContext = {...context};
    
    // Extract academic year
    const yearPatterns = {
      freshman: /freshman|first.year|1st.year/i,
      sophomore: /sophomore|second.year|2nd.year/i,
      junior: /junior|third.year|3rd.year/i,
      senior: /senior|fourth.year|4th.year/i
    };
    
    Object.entries(yearPatterns).forEach(([year, pattern]) => {
      if (pattern.test(message)) {
        updatedContext.year = year;
      }
    });
    
    // Extract major
    const majorPatterns = {
      'software engineering': /software|software engineering/i,
      'computer science': /computer science|cs/i,
      'electrical engineering': /electrical|electrical engineering|ee/i,
      'mechanical engineering': /mechanical|mechanical engineering/i,
      'civil engineering': /civil|civil engineering/i,
      'business administration': /business|business administration/i
    };
    
    Object.entries(majorPatterns).forEach(([major, pattern]) => {
      if (pattern.test(message)) {
        updatedContext.major = major;
      }
    });
    
    // Update context
    this.context.set(studentId, updatedContext);
  }

  /**
   * Determines next conversation state based on current state and available context
   */
  determineNextState(currentState, context) {
    switch (currentState) {
      case 'initial_greeting':
        // If we have both year and major, move to suggesting courses
        if (context.year && context.major) {
          return 'suggesting_courses';
        }
        return 'initial_greeting';
      
      case 'suggesting_courses':
        // Stay in this state once we reach it
        return 'suggesting_courses';
      
      default:
        return currentState;
    }
  }

  /**
   * Gets appropriate response based on conversation state
   */
  getResponseForState(state, context) {
    switch (state) {
      case 'initial_greeting':
        if (!context.year && !context.major) {
          return "Please select your academic year and major to get started.";
        } else if (context.year && !context.major) {
          return `Thanks for sharing that you're a ${context.year}. What's your major?`;
        } else if (!context.year && context.major) {
          return `So you're studying ${context.major}. What year are you in?`;
        }
        break;
      
      case 'suggesting_courses':
        return `Here are some recommended courses for ${context.year} ${context.major} students. Click any course for more details.`;
      
      default:
        return "How else can I help with your course selection?";
    }
  }

  /**
   * Gets course recommendations based on student profile
   */
  async getCourseRecommendations(studentId, preferences = {}) {
    try {
      // Get current context
      const userContext = this.context.get(studentId) || {};
      
      // Update context with new preferences
      const mergedContext = { ...userContext, ...preferences };
      this.context.set(studentId, mergedContext);
      
      return {
        recommendations: `Here are some recommended courses for ${mergedContext.year} ${mergedContext.major} students:`,
        context: mergedContext
      };
    } catch (error) {
      console.error('Error getting course recommendations:', error);
      return {
        recommendations: "Here are some courses you might be interested in:",
        context: {}
      };
    }
  }

  /**
   * Gets information about a specific course
   */
  async getCourseInfo(studentId, courseId) {
    try {
      return `This course is suitable for ${this.context.get(studentId)?.year || 'your'} level students.`;
    } catch (error) {
      console.error('Error getting course info:', error);
      return "Information about this course is available in the details panel.";
    }
  }

  /**
   * Provides personalized advice based on the question type
   */
  async getPersonalizedAdvice(studentId, question) {
    try {
      // Categorize the question
      const category = this.categorizeQuestion(question);
      
      // Get appropriate response based on question category
      switch (category) {
        case 'schedule':
          return "Consider spreading your courses throughout the week.";
        
        case 'professors':
          return "Check the professor ratings in the course details.";
        
        case 'workload':
          return "Most courses require about 3 hours of work per credit hour.";
        
        case 'prerequisites':
          return "Prerequisites are listed in each course's details.";
        
        default:
          return "Check the course details for more information.";
      }
    } catch (error) {
      console.error('Error getting personalized advice:', error);
      return "I suggest checking the course catalog for details.";
    }
  }

  /**
   * Categorizes questions using simple keyword matching
   */
  categorizeQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (/schedule|timetable|time|conflict|clash/i.test(lowerQuestion)) {
      return 'schedule';
    }
    
    if (/professor|instructor|teacher|faculty/i.test(lowerQuestion)) {
      return 'professors';
    }
    
    if (/workload|difficult|hard|challenging|easy/i.test(lowerQuestion)) {
      return 'workload';
    }
    
    if (/prerequisite|require|needed|before/i.test(lowerQuestion)) {
      return 'prerequisites';
    }
    
    return 'general';
  }

  /**
   * Updates user context with new information
   */
  updateUserContext(studentId, newContext) {
    const existingContext = this.context.get(studentId) || {};
    this.context.set(studentId, { ...existingContext, ...newContext });
    return this.context.get(studentId);
  }

  /**
   * Resets student data
   */
  resetStudentData(studentId) {
    this.context.delete(studentId);
    this.conversationState.delete(studentId);
    return { success: true, message: 'Student data reset successfully' };
  }
}

export const aiAgent = new AIAgent();