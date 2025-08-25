### SMU Schedule Generator

An end-to-end scheduling platform for students and admins. Students can search courses, build weekly schedules visually, and submit them for approval. Admins review, approve/reject, manage the course catalog, and export approved schedules. An integrated AI advisor assists students with course choices, constraints, and program planning.

### Why it matters
- **Student experience**: Interactive calendar, clash detection, and export-ready schedule PDFs.
- **Admin efficiency**: One-click approval flows, notifications, and JSON-backed persistence (no DB required to run).
- **AI assistance**: Natural-language chat for course info, recommendations, and schedule guidance via an OpenRouter-powered agent.

### Tech stack
- **Frontend**: Vue 3, Vite, Vue Router, Pinia, Vuetify, FullCalendar
- **Backend**: Node.js, Express, CORS, dotenv
- **AI**: Custom `aiAgent` with OpenRouter integration
- **Storage**: JSON files for users, courses, schedules, notifications

### Key features
- **Student**
  - Browse/search courses and add to a weekly timetable
  - Detect conflicts and iterate with an easy drag-and-drop UI
  - Submit schedule for admin approval and receive notifications
  - Chat with AI for recommendations and course insights
  - Export schedules to PDF
- **Admin**
  - Review and approve/reject submitted schedules
  - Manage course catalog (CRUD over `public/courses.json`)
  - View approved schedules per user
  - Clear user notifications

### Quick start
Requirements: Node 18+

1) Install dependencies
```bash
npm install
```

2) (Optional) Configure AI
- Create `.env` in the project root with:
```bash
OPENROUTER_API_KEY=your_key_here
PORT=3000
```

3) Run the backend (Express)
```bash
npm run dev:server
# or
npm run start
```
The API listens on `http://localhost:3000` by default.

4) Run the frontend (Vite)
```bash
npm run dev
```
Vite will print a local URL (typically `http://localhost:5173`).

### Demo credentials
Use these to explore both roles quickly:
- **Admin**: `admin@universityscheduler.com` / `admin123`
- **User**: `user@example.com` / `user123`

You can also self-register via the UI. Credentials are stored in `backend/users.json` for local development only.

### Notable endpoints (backend)
- Auth: `POST /login`, `POST /register`
- Courses: `GET /courses`, `GET /courses/:id`, `POST /courses`, `PUT /courses/:id`, `DELETE /courses/:id`
- Schedule requests: `GET /schedule-requests`, `POST /schedule-requests`, `POST /schedule-requests/:id/approve`, `POST /schedule-requests/:id/reject`
- Approved schedules: `GET /approved-schedules/:userId`
- Notifications: `GET /notifications/:userId`, `DELETE /notifications/:userId`
- AI: `POST /api/ai/recommendations`, `POST /api/ai/advice`, `POST /api/ai/context`, `POST /api/ai/chat/start`, `POST /api/ai/chat/message`, `POST /api/ai/set-model`, `POST /api/ai/extract-courses`, `POST /api/ai/course-info`, `POST /api/ai/reset`

### Project structure (high level)
- `src/components` — Student/Admin UI (schedule builder, dialogs, notifications, AI chat)
- `src/stores` — Pinia stores for auth and user
- `src/router` — Vue Router setup
- `backend/server.js` — Express API, JSON persistence, AI endpoints
- `backend/aiAgent.js` — AI advisor integration and helpers
- `public/courses.json` — Course catalog (editable)

### Scripts
- `npm run dev` — Start frontend (Vite)
- `npm run build` — Build frontend
- `npm run preview` — Preview built frontend
- `npm run dev:server` — Start backend with nodemon
- `npm start` — Start backend

### Notes for reviewers
- The app is intentionally DB-free for easy local runs; JSON files in `backend/` and `public/` act as storage.
- The AI features work best with a valid `OPENROUTER_API_KEY`. Without it, the app still runs with limited AI behavior.
- Security: credentials and data files are for demo/dev only and should be replaced with a real auth/db in production.

### License
MIT (or project-specific) — update as needed.
