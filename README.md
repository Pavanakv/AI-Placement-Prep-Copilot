# 🚀 AI Placement Prep Copilot

> An AI-powered platform that helps students prepare for placements with smart task tracking, voice mock interviews, personalized study plans, and real-time insights.

![Tech Stack](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎤 **Voice Mock Interviews** | AI interviewer asks questions, listens to your voice answers, scores each response in real-time |
| 📅 **AI Study Planner** | Generates a personalized day-wise prep plan based on your target role, days left, and weak topics |
| ⚡ **AI Insights Panel** | Analyzes your progress and gives smart recommendations on what to focus on |
| 📋 **Smart Task Tracker** | Track tasks by category, priority, and due date with progress analytics and streak tracking |
| 📄 **Resume Optimizer** | AI improves your project descriptions with strong action words and measurable impact |
| ❓ **Doubt Solver** | Get instant beginner-friendly explanations for any programming concept |
| 📊 **Interview History** | View all past mock interviews with per-question score breakdown and trend analysis |
| 🔐 **Authentication** | Secure JWT-based login and registration with bcrypt password hashing |

---

## 🛠 Tech Stack

### Frontend
- **React.js** — UI framework
- **Tailwind CSS** — Styling
- **React Router** — Client-side routing

### Backend
- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — Database
- **JWT + bcrypt** — Authentication

### AI & Voice
- **OpenRouter API (GPT-3.5-turbo)** — AI responses, interview scoring, resume improvement
- **AssemblyAI** — Speech-to-text for voice answers
- **Web Speech API** — Text-to-speech for AI interviewer voice

---

## 📸 Screenshots

> Coming soon — deployment in progress

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- OpenRouter API key → [openrouter.ai](https://openrouter.ai)
- AssemblyAI API key → [assemblyai.com](https://www.assemblyai.com)

### 1. Clone the repo
```bash
git clone https://github.com/Pavanakv/AI-Placement-Prep-Copilot.git
cd AI-Placement-Prep-Copilot
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file in `/backend`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

Start backend:
```bash
node server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`

---

## 📁 Project Structure

```
AI-Placement-Prep-Copilot/
├── backend/
│   ├── controllers/        # Request handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic + AI calls
│   ├── middleware/         # Auth, file upload
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, TaskCard, InsightsPanel, VoiceRecorder
│   │   └── pages/          # Tasks, Interview, Planner, Resume, Doubt, History
│   └── public/
```

---

## 🔮 Roadmap

- [ ] Deploy on Render + Vercel
- [ ] Resume PDF upload and analysis
- [ ] Adaptive planner that reschedules missed tasks
- [ ] Dashboard with performance analytics
- [ ] Company-specific interview preparation

---

## 👨‍💻 Author

**Pavana KV**
- GitHub: [@Pavanakv](https://github.com/Pavanakv)

---

