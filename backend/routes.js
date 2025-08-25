
import express from 'express';
import { aiAgent } from '../aiAgent.js';

const router = express.Router();

// Initialize the agent with course database
// This should be done when your app starts
export const initAiAgent = (courseDb) => {
  aiAgent.setCourseDatabase(courseDb);
};

// Start a conversation with the AI
router.post('/chat/start', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    
    const message = await aiAgent.startConversation(studentId);
    
    res.json({ message });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Send a message to the AI
router.post('/chat/message', async (req, res) => {
  try {
    const { studentId, message } = req.body;
    
    if (!studentId || !message) {
      return res.status(400).json({ error: 'Student ID and message are required' });
    }
    
    const response = await aiAgent.handleUserResponse(studentId, message);
    
    res.json({ message: response });
  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Update user context
router.post('/context', async (req, res) => {
  try {
    const { studentId, context } = req.body;
    
    if (!studentId || !context) {
      return res.status(400).json({ error: 'Student ID and context are required' });
    }
    
    const updatedContext = aiAgent.updateUserContext(studentId, context);
    
    res.json({ context: updatedContext });
  } catch (error) {
    console.error('Error updating context:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

// Get course recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { studentId, preferences } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    
    const recommendations = await aiAgent.getCourseRecommendations(studentId, preferences || {});
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get course information
router.post('/course-info', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    
    if (!studentId || !courseId) {
      return res.status(400).json({ error: 'Student ID and course ID are required' });
    }
    
    const courseInfo = await aiAgent.getCourseInfo(studentId, courseId);
    
    res.json(courseInfo);
  } catch (error) {
    console.error('Error getting course info:', error);
    res.status(500).json({ error: 'Failed to get course information' });
  }
});

// Extract course codes from message
router.post('/extract-courses', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const courseCodes = aiAgent.extractCourseCodes(message);
    const courses = aiAgent.findCoursesByCodes(courseCodes);
    
    res.json({ courseCodes, courses });
  } catch (error) {
    console.error('Error extracting course codes:', error);
    res.status(500).json({ error: 'Failed to extract course codes' });
  }
});

// Get personalized advice
router.post('/advice', async (req, res) => {
  try {
    const { studentId, question } = req.body;
    
    if (!studentId || !question) {
      return res.status(400).json({ error: 'Student ID and question are required' });
    }
    
    const advice = await aiAgent.getPersonalizedAdvice(studentId, question);
    
    res.json({ advice });
  } catch (error) {
    console.error('Error getting advice:', error);
    res.status(500).json({ error: 'Failed to get advice' });
  }
});

// Reset student data
router.post('/reset', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    
    const result = aiAgent.resetStudentData(studentId);
    
    res.json(result);
  } catch (error) {
    console.error('Error resetting student data:', error);
    res.status(500).json({ error: 'Failed to reset student data' });
  }
});

// Set AI model
router.post('/set-model', async (req, res) => {
  try {
    const { modelName } = req.body;
    
    if (!modelName) {
      return res.status(400).json({ error: 'Model name is required' });
    }
    
    const result = aiAgent.setModel(modelName);
    
    res.json(result);
  } catch (error) {
    console.error('Error setting model:', error);
    res.status(500).json({ error: 'Failed to set model' });
  }
});

export default router;