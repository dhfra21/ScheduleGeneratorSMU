import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables first
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('OpenRouter Key:', process.env.OPENROUTER_API_KEY);

// Import AIAgent after environment variables are loaded
import { aiAgent } from './aiAgent.js';



const app = express();
const PORT = process.env.PORT || 3000;
console.log("OpenRouter Key:", process.env.OPENROUTER_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Check for OpenRouter API key
if (!process.env.OPENROUTER_API_KEY) {
  console.warn('\x1b[33m%s\x1b[0m', 'WARNING: OpenRouter API key not set. Using default key from code.');
  console.warn('\x1b[33m%s\x1b[0m', 'For production, set OPENROUTER_API_KEY in your .env file.');
}

// Read users from JSON file
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'))).users;

// Read courses from JSON file
let courses;
try {
  const coursesPath = path.join(__dirname, '../public/courses.json');
  const coursesData = JSON.parse(fs.readFileSync(coursesPath));
  courses = coursesData.courses;
  
  // Initialize AI agent with course database
  aiAgent.setCourseDatabase(courses);
} catch (error) {
  console.error('Error loading courses:', error);
  courses = [];
}

// Read schedule requests from JSON file
let scheduleRequests;
try {
  const requestsPath = path.join(__dirname, 'schedule-requests.json');
  const requestsData = JSON.parse(fs.readFileSync(requestsPath));
  scheduleRequests = requestsData.requests;
} catch (error) {
  console.error('Error loading schedule requests:', error);
  scheduleRequests = [];
}

// Read approved schedules from JSON file
let approvedSchedules;
try {
  const approvedSchedulesPath = path.join(__dirname, 'approved-schedules.json');
  const approvedSchedulesData = JSON.parse(fs.readFileSync(approvedSchedulesPath));
  approvedSchedules = approvedSchedulesData.schedules;
} catch (error) {
  console.error('Error loading approved schedules:', error);
  approvedSchedules = [];
}

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', email);
  
  // Reload users from file on each login attempt
  const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json')));
  const currentUsers = usersData.users;
  
  const user = currentUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
  } else {
    console.log('Login failed for:', email);
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Helper function to load schedule requests
const loadScheduleRequests = () => {
  try {
    const requestsPath = path.join(__dirname, 'schedule-requests.json');
    const requestsData = JSON.parse(fs.readFileSync(requestsPath));
    return requestsData;
  } catch (error) {
    console.error('Error loading schedule requests:', error);
    return { requests: [] };
  }
};

// Helper function to save schedule requests
const saveScheduleRequests = (requests) => {
  try {
    const requestsPath = path.join(__dirname, 'schedule-requests.json');
    fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2));
    console.log('Schedule requests saved successfully');
  } catch (error) {
    console.error('Error saving schedule requests:', error);
  }
};

// Helper function to load approved schedules
const loadApprovedSchedules = () => {
  try {
    const approvedSchedulesPath = path.join(__dirname, 'approved-schedules.json');
    const approvedSchedulesData = JSON.parse(fs.readFileSync(approvedSchedulesPath));
    return approvedSchedulesData;
  } catch (error) {
    console.error('Error loading approved schedules:', error);
    return { schedules: [] };
  }
};

// Helper function to save approved schedules
const saveApprovedSchedules = (schedules) => {
  try {
    const approvedSchedulesPath = path.join(__dirname, 'approved-schedules.json');
    fs.writeFileSync(approvedSchedulesPath, JSON.stringify(schedules, null, 2));
    console.log('Approved schedules saved successfully');
  } catch (error) {
    console.error('Error saving approved schedules:', error);
  }
};

// Helper function to save notifications
const saveNotifications = (notifications) => {
  try {
    const notificationsPath = path.join(__dirname, 'notifications.json');
    fs.writeFileSync(notificationsPath, JSON.stringify(notifications, null, 2));
    console.log('Notifications saved successfully');
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
};

// Helper function to load notifications
const loadNotifications = () => {
  try {
    const notificationsPath = path.join(__dirname, 'notifications.json');
    if (!fs.existsSync(notificationsPath)) {
      console.log('Creating new notifications.json file');
      const initialNotifications = { notifications: {} };
      fs.writeFileSync(notificationsPath, JSON.stringify(initialNotifications, null, 2));
      return initialNotifications;
    }
    const data = fs.readFileSync(notificationsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading notifications:', error);
    return { notifications: {} };
  }
};

// Schedule Requests endpoints
app.get('/schedule-requests', (req, res) => {
  try {
    const requests = loadScheduleRequests();
    res.json(requests.requests);
  } catch (error) {
    console.error('Error fetching schedule requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/schedule-requests', (req, res) => {
  try {
    const requests = loadScheduleRequests();
    const notifications = loadNotifications();
    const { userId, userName, schedule } = req.body;

    const newRequest = {
      id: Date.now().toString(),
      userId,
      userName,
      schedule,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    requests.requests.push(newRequest);

    // Create notification for the user
    if (!notifications.notifications[userId]) {
      notifications.notifications[userId] = [];
    }
    notifications.notifications[userId].push({
      id: Date.now().toString(),
      type: 'info',
      title: 'Schedule Submitted',
      message: 'Your schedule has been submitted for approval.',
      createdAt: new Date().toISOString()
    });

    saveScheduleRequests(requests);
    saveNotifications(notifications);

    console.log('Schedule request created:', newRequest);
    console.log('Notification created for user:', userId);

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating schedule request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/schedule-requests/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const requests = loadScheduleRequests();
    const approvedSchedules = loadApprovedSchedules();
    const notifications = loadNotifications();

    const request = requests.requests.find(r => r.id === id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = 'approved';
    request.approvedAt = new Date().toISOString();

    // Add to approved schedules
    const newApprovedSchedule = {
      userId: request.userId,
      userName: request.userName,
      schedule: request.schedule,
      approvedAt: request.approvedAt
    };

    // Remove any existing approved schedule for this user
    approvedSchedules.schedules = approvedSchedules.schedules.filter(
      schedule => schedule.userId !== request.userId
    );

    // Add the new approved schedule
    approvedSchedules.schedules.push(newApprovedSchedule);

    // Create notification for the user
    if (!notifications.notifications[request.userId]) {
      notifications.notifications[request.userId] = [];
    }
    notifications.notifications[request.userId].push({
      id: Date.now().toString(),
      type: 'success',
      title: 'Schedule Approved',
      message: 'Your schedule request has been approved by the administrator.',
      createdAt: new Date().toISOString()
    });

    saveScheduleRequests(requests);
    saveApprovedSchedules(approvedSchedules);
    saveNotifications(notifications);

    console.log('Schedule request approved:', request);
    console.log('Notification created for user:', request.userId);
    console.log('Approved schedule saved:', newApprovedSchedule);

    res.json({ message: 'Schedule request approved successfully' });
  } catch (error) {
    console.error('Error approving schedule request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/schedule-requests/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const requests = loadScheduleRequests();
    const notifications = loadNotifications();

    const request = requests.requests.find(r => r.id === id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = 'rejected';
    request.rejectedAt = new Date().toISOString();

    // Create notification for the user
    if (!notifications.notifications[request.userId]) {
      notifications.notifications[request.userId] = [];
    }
    notifications.notifications[request.userId].push({
      id: Date.now().toString(),
      type: 'error',
      title: 'Schedule Rejected',
      message: 'Your schedule request has been rejected by the administrator.',
      createdAt: new Date().toISOString()
    });

    saveScheduleRequests(requests);
    saveNotifications(notifications);

    console.log('Schedule request rejected:', request);
    console.log('Notification created for user:', request.userId);

    res.json({ message: 'Schedule request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting schedule request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approved schedules for a user
app.get('/approved-schedules/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const approvedSchedules = loadApprovedSchedules();
    const userSchedules = approvedSchedules.schedules.filter(schedule => schedule.userId === userId);
    res.json(userSchedules);
  } catch (error) {
    console.error('Error fetching user approved schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to load courses
const loadCourses = () => {
  try {
    const coursesPath = path.join(__dirname, '../public/courses.json');
    const coursesData = JSON.parse(fs.readFileSync(coursesPath));
    return coursesData;
  } catch (error) {
    console.error('Error loading courses:', error);
    return { courses: [] };
  }
};

// Helper function to save courses
const saveCourses = (courses) => {
  try {
    const coursesPath = path.join(__dirname, '../public/courses.json');
    fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 2));
    console.log('Courses saved successfully');
  } catch (error) {
    console.error('Error saving courses:', error);
  }
};

// Courses endpoints
app.get('/courses', (req, res) => {
  try {
    const coursesData = loadCourses();
    res.json(coursesData.courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/courses/:id', (req, res) => {
  console.log('Single course endpoint hit for ID:', req.params.id);
  const course = courses.find(c => c.id === req.params.id);
  if (!course) {
    console.log('Course not found for ID:', req.params.id);
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json(course);
});

app.put('/courses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedCourse = req.body;
    const coursesData = loadCourses();
    
    const courseIndex = coursesData.courses.findIndex(course => course.id === id);
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    coursesData.courses[courseIndex] = updatedCourse;
    saveCourses(coursesData);

    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/courses', (req, res) => {
  try {
    const newCourse = req.body;
    const coursesData = loadCourses();
    
    // Generate a unique ID for the new course
    newCourse.id = Math.random().toString(36).substr(2, 4);
    
    coursesData.courses.push(newCourse);
    saveCourses(coursesData);

    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/courses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const coursesData = loadCourses();
    
    const courseIndex = coursesData.courses.findIndex(course => course.id === id);
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    coursesData.courses.splice(courseIndex, 1);
    saveCourses(coursesData);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add notification endpoint
app.get('/notifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching notifications for user:', userId);
    const notifications = loadNotifications();
    const userNotifications = notifications.notifications[userId] || [];
    console.log('Found notifications for user:', userNotifications);
    res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear notifications endpoint
app.delete('/notifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Clearing notifications for user:', userId);
    const notifications = loadNotifications();
    notifications.notifications[userId] = [];
    saveNotifications(notifications);
    console.log('Notifications cleared for user:', userId);
    res.json({ message: 'Notifications cleared successfully' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to load users
const loadUsers = () => {
  try {
    const usersPath = path.join(__dirname, 'users.json');
    const usersData = JSON.parse(fs.readFileSync(usersPath));
    return usersData;
  } catch (error) {
    console.error('Error loading users:', error);
    return { users: [] };
  }
};

// Helper function to save users
const saveUsers = (usersData) => {
  try {
    const usersPath = path.join(__dirname, 'users.json');
    fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
    console.log('Users saved successfully');
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// User registration endpoint
app.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    // Check if user already exists
    const usersData = loadUsers();
    const existingUser = usersData.users.find(u => u.email === email);
    
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Create new user
    const newUser = {
      id: (usersData.users.length + 1).toString(),
      email,
      password,
      role: 'user',
      name
    };
    
    // Add user to the list
    usersData.users.push(newUser);
    saveUsers(usersData);
    
    console.log('New user registered:', { email, name });
    
    // Return user data without password
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Agent endpoints
app.post('/api/ai/recommendations', async (req, res) => {
  try {
    const { studentId, preferences } = req.body;
    const recommendations = await aiAgent.getCourseRecommendations(studentId, preferences);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    res.status(500).json({ error: 'Failed to get course recommendations' });
  }
});

app.post('/api/ai/advice', async (req, res) => {
  try {
    const { studentId, question } = req.body;
    const advice = await aiAgent.getPersonalizedAdvice(studentId, question);
    res.json({ advice });
  } catch (error) {
    console.error('Error getting AI advice:', error);
    res.status(500).json({ error: 'Failed to get personalized advice' });
  }
});

app.post('/api/ai/context', (req, res) => {
  try {
    const { studentId, context } = req.body;
    aiAgent.updateUserContext(studentId, context);
    res.json({ message: 'Context updated successfully' });
  } catch (error) {
    console.error('Error updating AI context:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

// AI Chat endpoints
app.post('/api/ai/chat/start', async (req, res) => {
  try {
    const { studentId } = req.body;
    const response = await aiAgent.startConversation(studentId);
    res.json({ message: response });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ error: 'Failed to start chat' });
  }
});

app.post('/api/ai/chat/message', async (req, res) => {
  try {
    const { studentId, message } = req.body;
    const response = await aiAgent.handleUserResponse(studentId, message);
    res.json({ message: response });
  } catch (error) {
    console.error('Error handling chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// New OpenRouter specific endpoints
app.post('/api/ai/set-model', async (req, res) => {
  try {
    const { modelName } = req.body;
    
    if (!modelName) {
      return res.status(400).json({ error: 'Model name is required' });
    }
    
    const result = aiAgent.setModel(modelName);
    console.log(`AI model changed to: ${modelName}`);
    res.json(result);
  } catch (error) {
    console.error('Error setting AI model:', error);
    res.status(500).json({ error: 'Failed to set AI model' });
  }
});

app.post('/api/ai/extract-courses', async (req, res) => {
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

app.post('/api/ai/course-info', async (req, res) => {
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

app.post('/api/ai/reset', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Check OpenRouter API key status
  if (process.env.OPENROUTER_API_KEY) {
    console.log('\x1b[32m%s\x1b[0m', 'OpenRouter API key detected ✓');
  } else {
    console.log('\x1b[33m%s\x1b[0m', 'Using default OpenRouter API key from code. For production, set OPENROUTER_API_KEY in your .env file.');
  }
});