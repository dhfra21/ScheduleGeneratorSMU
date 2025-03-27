import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Read users from JSON file
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'))).users;
console.log('Loaded users:', users.map(u => ({ email: u.email, role: u.role })));

// Read courses from JSON file
let courses;
try {
  const coursesPath = path.join(__dirname, '../public/courses.json');
  console.log('Attempting to read courses from:', coursesPath);
  const coursesData = JSON.parse(fs.readFileSync(coursesPath));
  courses = coursesData.courses;
  console.log('Successfully loaded courses. Total courses:', courses.length);
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
  console.log('Successfully loaded schedule requests. Total requests:', scheduleRequests.length);
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
  console.log('Successfully loaded approved schedules. Total schedules:', approvedSchedules.length);
} catch (error) {
  console.error('Error loading approved schedules:', error);
  approvedSchedules = [];
}

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', email);
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    console.log('Login successful for:', email);
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

// Courses endpoints
app.get('/courses', (req, res) => {
  console.log('Courses endpoint hit');
  if (!courses || courses.length === 0) {
    console.error('No courses available');
    return res.status(404).json({ message: 'No courses available' });
  }
  res.json(courses);
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 