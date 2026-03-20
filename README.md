# AI Flow — MERN Stack Interview Assignment

A minimal, production-quality MERN stack application that uses React Flow to create a visual AI prompt-response workflow.

---

## 📸 Demo

**Prompt:** "What is 2+2?"  
**Response:** "2+2 equals 4."

The user types a prompt in the Input Node, clicks **Run Flow**, and the AI response appears in the Result Node — all connected visually with React Flow.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **UI Library** | React Flow (`@xyflow/react`) |
| **HTTP Client** | Axios |
| **Backend** | Node.js + Express |
| **Database** | MongoDB (Mongoose ODM) |
| **AI API** | OpenRouter (`google/gemma-3-12b-it:free`) |

---

## 📁 Project Structure

```
ai-flow/
├── backend/
│   ├── server.js              # Express server with API routes
│   ├── models/
│   │   └── Flow.js            # Mongoose schema
│   ├── .env                   # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app — React Flow canvas + logic
│   │   ├── App.css            # Styles (dark theme)
│   │   ├── main.jsx           # React entry point
│   │   └── nodes/
│   │       ├── InputNode.jsx  # Custom node — textarea for prompt
│   │       └── ResultNode.jsx # Custom node — displays AI response
│   ├── index.html
│   ├── vite.config.js         # Dev proxy config
│   └── package.json
└── README.md
```

---

## ✨ Features

### React Flow UI
- **Input Node** — Contains a `<textarea>` where users type their prompt
- **Result Node** — Displays the AI-generated response
- **Animated Edge** — Visual connection between Input → Result
- **"Run Flow" Button** — Triggers the entire pipeline

### Application Flow
```
User types prompt → Clicks "Run Flow"
        ↓
Frontend sends POST /api/ask-ai { prompt }
        ↓
Backend calls OpenAI API (gpt-3.5-turbo)
        ↓
Response returned to frontend → displayed in Result Node
        ↓
Frontend sends POST /api/save { prompt, response }
        ↓
Saved to MongoDB
```

### Error Handling & UX
- **Loading state** — Button shows "Generating..." and is disabled while waiting
- **Input validation** — Empty prompts are rejected (400 error)
- **Error display** — API failures shown as red text in the toolbar
- **Timeout** — 30-second timeout on AI requests to prevent hanging

---

## 🗄 Database Schema

**Collection:** `flows`

```javascript
{
  prompt:    { type: String, required: true },   // User's input prompt
  response:  { type: String, required: true },   // AI-generated response
  createdAt: { type: Date, default: Date.now }   // Auto-generated timestamp
}
```

---

## 🔌 API Endpoints

### `POST /api/ask-ai`

Sends the user's prompt to OpenAI and returns the AI response.

**Request:**
```json
{ "prompt": "What is 2+2?" }
```

**Response (200):**
```json
{ "response": "2+2 equals 4." }
```

**Error (400):**
```json
{ "error": "Prompt is required" }
```

**Error (500):**
```json
{ "error": "Failed to get AI response" }
```

---

### `POST /api/save`

Saves the prompt and response to MongoDB.

**Request:**
```json
{
  "prompt": "What is 2+2?",
  "response": "2+2 equals 4."
}
```

**Response (201):**
```json
{
  "_id": "...",
  "prompt": "What is 2+2?",
  "response": "2+2 equals 4.",
  "createdAt": "2026-03-20T10:30:00.000Z"
}
```

---

## 🔐 Security

- **API key is server-side only** — OpenAI is never called from the frontend
- **Environment variables** — All secrets stored in `.env` (not committed to git)
- **Input validation** — Both endpoints validate required fields
- **CORS enabled** — Configured via `cors` middleware

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create/edit `backend/.env`:

```env
PORT=5000
OPENAI_API_KEY=sk-proj-your-key-here
MONGODB_URI=mongodb://localhost:27017/ai-flow
```

### 3. Start Development Servers

```bash
# Terminal 1 — Backend (auto-restarts on changes)
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### 4. Open the App

Navigate to **http://localhost:5173**

---

## 📦 Deployment

### Backend (Render / Railway)
1. Push `backend/` to a Git repo
2. Set environment variables: `PORT`, `OPENAI_API_KEY`, `MONGODB_URI`
3. Start command: `npm start`

### Frontend (Vercel / Netlify)
1. Push `frontend/` to a Git repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set API base URL as environment variable

### Database (MongoDB Atlas)
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get the connection string and set as `MONGODB_URI`

---

## 📝 Key Design Decisions

1. **Vite dev proxy** — `/api` requests are proxied to `localhost:5000` during development, avoiding CORS issues without complex configuration
2. **Custom React Flow nodes** — `InputNode` and `ResultNode` are registered as custom node types for clean separation
3. **Sequential save** — After getting the AI response, the app automatically saves prompt + response to MongoDB
4. **Minimal dependencies** — Only essential packages: `express`, `cors`, `axios`, `dotenv`, `mongoose`, `@xyflow/react`
5. **node --watch** — Used instead of `nodemon` to avoid an extra dependency (built into Node 18+)
