# 🚀 Personal AI Job Finder

A full-stack web application that matches your resumes against live job listings across India and internationally, scores compatibility, and surfaces actionable apply links.

![Dashboard](https://img.shields.io/badge/Status-MVP%20Complete-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Optional-47A248?logo=mongodb&logoColor=white)

---

## ✨ Features

### Core
- **Three resume profiles**: AI/ML/GenAI, Software/QA, General/Entry
- **Multi-source job search**: Fetches from Adzuna, Remotive, and Arbeitnow APIs
- **Intelligent matching**: Weighted 8-factor scoring (skills, experience, projects, role similarity, education, location, certifications, seniority)
- **Match explanations**: Skill-by-skill breakdown (✅ strong / 🟡 partial / ❌ missing)
- **Auto-SKIP rules**: Automatically filters out jobs requiring 5+ years for freshers, US citizenship, etc.

### Job Intelligence
- **Deduplication**: Same job from multiple sources → single card with "Found on N sources"
- **Company classification**: Detects MNCs, Startups, Mid-size companies
- **Remote eligibility**: Distinguishes Remote India / Remote Worldwide / US Only / EU Only
- **India eligibility badges**: 🟢 India eligible or 🔴 Not India eligible
- **Salary normalization**: Parses ₹5 LPA, $70K/yr, €50,000 formats
- **Experience parsing**: Extracts "0-2 years" requirements from descriptions

### User Features
- **Resume upload**: PDF and DOCX parsing with skill extraction
- **Advanced filters**: Location, company type, remote status, experience level, salary
- **Application tracker**: Save → Applied → Assessment → Interview → Offer pipeline
- **Duplicate application prevention**: Warns if you've already tracked a job
- **Profile comparison**: Shows which resume scores highest for each job

### UI/UX
- **Dark glassmorphism design** with vibrant purple-blue gradients
- **Animated skill bars** and circular match score indicators
- **Responsive** — works on desktop, tablet, and mobile
- **Skeleton loading** states
- **Staggered card animations**

---

## 🏗️ Architecture

```
Frontend (React + Vite)
        │
        ▼
Backend (Express.js)
        │
        ├── Job Source Adapters ─── Adzuna / Remotive / Arbeitnow
        │
        ├── Normalizer ─── Canonical job schema
        ├── Deduplicator ─── MD5 hash merging
        ├── Classifier ─── Company/Location/Remote/Experience
        │
        ├── Resume Parser ─── PDF/DOCX → Structured JSON
        │
        ├── Matching Engine ─── 8-factor weighted scoring
        │
        └── Storage ─── MongoDB Atlas or In-Memory
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, React Router 7, Vanilla CSS |
| **Backend** | Express.js, Node.js 20+ |
| **Database** | MongoDB Atlas (free M0) — optional, falls back to in-memory |
| **Resume Parsing** | pdf-parse, mammoth |
| **Job Sources** | Adzuna API, Remotive API, Arbeitnow API |
| **Security** | Helmet, express-rate-limit, CORS, Multer validation |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd something_personal
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

| Variable | Required | Source |
|----------|----------|--------|
| `ADZUNA_APP_ID` | Optional | [developer.adzuna.com](https://developer.adzuna.com) (free) |
| `ADZUNA_APP_KEY` | Optional | Same as above |
| `DATABASE_URL` | Optional | [MongoDB Atlas](https://cloud.mongodb.com) free M0 cluster |
| `LLM_API_KEY` | Optional | For AI features (cover letter, etc.) |

> **Note**: The app works without any API keys! Remotive and Arbeitnow require no authentication. Without Adzuna, you'll have 2 job sources. Without MongoDB, data is stored in-memory (lost on restart).

### 3. Run

```bash
npm run dev
```

This starts both servers concurrently:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

### 4. Use

1. Open http://localhost:5173
2. Select a profile (AI/ML, Software/QA, or General)
3. Set filters (location, company type, remote, experience)
4. Click **SEARCH JOBS**
5. Browse matched jobs with scores and skill breakdowns
6. Click **Apply** to go to the original application page
7. Click **Save** or **Applied** to track in the Tracker

---

## 📁 Project Structure

```
something_personal/
├── .env.example              # Environment variable template
├── .gitignore
├── package.json              # Workspace root
│
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js          # Express app entry point
│       ├── config/
│       │   ├── index.js       # Environment config
│       │   ├── database.js    # MongoDB connection
│       │   └── memoryStore.js # In-memory fallback
│       ├── models/
│       │   ├── ResumeProfile.js
│       │   ├── Job.js
│       │   ├── Application.js
│       │   └── SearchHistory.js
│       ├── adapters/
│       │   ├── index.js       # Adapter registry
│       │   ├── AdzunaAdapter.js
│       │   ├── RemotiveAdapter.js
│       │   └── ArbeitnowAdapter.js
│       ├── services/
│       │   ├── normalizer.js
│       │   ├── deduplicator.js
│       │   ├── classifier.js
│       │   ├── resumeParser.js
│       │   ├── matchingEngine.js
│       │   └── salaryNormalizer.js
│       ├── routes/
│       │   ├── profiles.js
│       │   ├── jobs.js
│       │   └── applications.js
│       └── data/
│           └── companyLists.js
│
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── index.css           # Design system
        ├── components/
        │   ├── ProfileSelector.jsx
        │   ├── FilterPanel.jsx
        │   ├── SearchSummary.jsx
        │   ├── JobCard.jsx
        │   ├── MatchCircle.jsx
        │   └── LoadingSkeleton.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── JobDetail.jsx
            ├── Tracker.jsx
            └── ProfilePage.jsx
```

---

## 🔌 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `NODE_ENV` | `development` | Environment mode |
| `SECRET_KEY` | — | Session/auth secret (for future use) |
| `DATABASE_URL` | — | MongoDB Atlas connection string |
| `ADZUNA_APP_ID` | — | Adzuna API application ID |
| `ADZUNA_APP_KEY` | — | Adzuna API application key |
| `LLM_API_KEY` | — | Optional LLM API key |
| `LLM_PROVIDER` | `gemini` | `gemini` or `openai` |

---

## 🔍 Matching Algorithm

Jobs are scored against your resume using 8 weighted factors:

| Factor | Weight | Method |
|--------|--------|--------|
| **Skills** | 30% | Jaccard similarity + related skill detection |
| **Experience** | 20% | Level band matching (fresher, 0-2, 1-3, 3-5, 5+) |
| **Projects** | 15% | Technology overlap between projects and job requirements |
| **Role Similarity** | 15% | Title matching against target roles + synonyms |
| **Education** | 5% | Degree relevance to job requirements |
| **Location** | 5% | Preferred location match + remote bonus |
| **Certifications** | 5% | Certification mention overlap |
| **Seniority** | 5% | Seniority level appropriateness |

### Match Categories

| Score | Category | Action |
|-------|----------|--------|
| 85-100% | 🔥 Excellent | APPLY NOW |
| 70-84% | 🟢 Good | APPLY |
| 50-69% | 🟡 Stretch | STRETCH |
| 0-49% | 🔴 Poor | SKIP |

---

## ⚠️ Job Source Limitations

| Source | Auth | Rate Limit | Coverage | Notes |
|--------|------|-----------|----------|-------|
| **Adzuna** | API key (free) | ~1000 calls/month | India, US, UK, EU | Best for India jobs + salary data |
| **Remotive** | None | 4 requests/day | Remote worldwide | Attribution required |
| **Arbeitnow** | None | Standard | EU, International | Has visa sponsorship data |

All sources are used within their terms of service. No scraping, CAPTCHA bypassing, or unauthorized access.

---

## 🚀 Deployment

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

Set `VITE_API_URL` environment variable to your backend URL.

### Backend (Render / Railway)
Deploy the `backend/` directory with:
- Start command: `node src/server.js`
- Environment variables from `.env.example`

### Database (MongoDB Atlas)
1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add your IP to Network Access
3. Set `DATABASE_URL` in your backend environment

---

## 🔮 Future Improvements

- [ ] Daily automatic job search with notifications
- [ ] AI-powered cover letter generation
- [ ] Recruiter message templates
- [ ] Resume improvement suggestions
- [ ] Email/push notifications for new high-match jobs
- [ ] Multi-user authentication
- [ ] More job source adapters (Greenhouse, Lever public boards)
- [ ] Search history with "new since last search"
- [ ] Job description comparison across sources

---

## 📝 License

MIT
