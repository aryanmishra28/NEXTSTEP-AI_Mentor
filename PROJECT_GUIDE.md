# 🎯 AI Career Coach - Complete Project Guide

## **Table of Contents**

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Technology Stack](#technology-stack)
4. [Complete Data Flow](#complete-data-flow)
5. [Core Features Explained](#core-features-explained)
6. [API Integration](#api-integration)
7. [Database Schema](#database-schema)
8. [Frontend-Backend Communication](#frontend-backend-communication)

---

## 📌 **Project Overview**

### **Kya Hai Yeh Project? (What is this project?)**

**AI Career Coach** ek AI-powered platform hai jo students aur professionals ko career advancement mein help karta hai.

**Simplify mein:**

```
User → Profile → AI ke through → Resume Analysis → Interview Prep → Skill Growth
```

### **Objectives:**

1. **Resume Analysis** - Resume dekho aur ATS score nikalo (0-100%)
2. **Interview Preparation** - MCQ-based quizzes generate karo
3. **Skill Gap Analysis** - Market se compare karo aur missing skills batao
4. **Cover Letter Generation** - Job ke liye personalized cover letter banao
5. **Industry Insights** - Salary ranges, demand, trends batao
6. **Hot Topics Study** - Important concepts pad lo difficulty levels ke saath

---

## 📁 **Complete Folder Structure**

```
ai-career-coach/
│
├── 📂 app/                          # Next.js App Router (Frontend Pages & Routes)
│   ├── 📂 (auth)/                   # Authentication Pages (Sign-up, Sign-in)
│   │   ├── sign-in/
│   │   └── sign-up/
│   │
│   ├── 📂 (main)/                   # Main Application Routes (Protected)
│   │   ├── 📂 dashboard/            # Dashboard Page - Analytics & Resume Snapshot
│   │   │   ├── page.jsx             # Main dashboard page
│   │   │   └── _component/
│   │   │       └── dashboard-view.jsx  # All dashboard widgets
│   │   │
│   │   ├── 📂 resume/               # Resume Builder
│   │   │   ├── page.jsx             # Resume page
│   │   │   └── _components/
│   │   │       └── resume-builder.jsx
│   │   │
│   │   ├── 📂 resume-analysis/      # NEW: Resume Analysis Feature
│   │   │   ├── page.jsx             # Main analysis page
│   │   │   └── _components/
│   │   │       ├── resume-importer.jsx    # PDF upload + text paste
│   │   │       └── resume-insights.jsx    # Analysis results display
│   │   │
│   │   ├── 📂 interview/            # Interview Prep Section
│   │   │   ├── page.jsx             # Interview page
│   │   │   └── _components/
│   │   │       ├── quiz.jsx         # Quiz component (MCQ interface)
│   │   │       ├── quiz-list.jsx    # Historical quizzes list
│   │   │       ├── hot-topics-section.jsx  # NEW: Hot topics with Q&A
│   │   │       ├── performace-chart.jsx    # Performance graphs
│   │   │       └── stats-cards.jsx  # Score stats
│   │   │
│   │   ├── 📂 ai-cover-letter/      # Cover Letter Generator
│   │   │   ├── page.jsx
│   │   │   └── _components/
│   │   │
│   │   ├── 📂 ai-chat/              # AI Chat Interface
│   │   │   ├── page.jsx
│   │   │   └── _components/
│   │   │
│   │   └── 📂 onboarding/           # Onboarding Flow
│   │       ├── page.jsx             # Industry selection page
│   │       └── _components/
│   │
│   ├── 📂 api/                      # API Routes (Backend Logic)
│   │   ├── 📂 ai-chat/
│   │   │   └── route.js             # Chat API endpoint
│   │   ├── 📂 inngest/
│   │   │   └── route.js             # Async job handler
│   │   └── ...other routes
│   │
│   ├── layout.js                    # Root layout (ThemeProvider, Header, etc.)
│   ├── globals.css                  # Global styles
│   └── page.js                      # Home page
│
├── 📂 actions/                      # Server Actions (Backend Business Logic)
│   ├── user.js                      # updateUser, onboarding logic
│   ├── dashboard.js                 # getIndustryInsights, generateAIInsights
│   ├── resume.js                    # saveResume, analyzeResume, extractPDF
│   ├── interview.js                 # generateQuiz, generateHotTopicQA
│   └── cover-letter.js              # Cover letter generation logic
│
├── 📂 components/                   # Reusable React Components
│   ├── header.jsx                   # Navigation header
│   ├── hero.jsx                     # Landing page hero
│   ├── theme-provider.jsx           # Dark/Light theme
│   └── 📂 ui/                       # shadcn/ui Components
│       ├── accordion.jsx            # Expandable sections
│       ├── card.jsx                 # Card wrapper
│       ├── button.jsx               # Buttons
│       ├── input.jsx                # Text inputs
│       ├── select.jsx               # Dropdowns
│       ├── tabs.jsx                 # Tab navigation
│       └── ...more UI components
│
├── 📂 hooks/                        # Custom React Hooks
│   └── use-fetch.js                 # Custom hook for async server actions
│
├── 📂 lib/                          # Utility Functions & Services
│   ├── prisma.js                    # Prisma client instance
│   ├── checkUser.js                 # User existence check
│   ├── utils.js                     # Helper functions
│   └── 📂 inngest/                  # Job queue setup
│       ├── client.js
│       └── function.js
│
├── 📂 prisma/                       # Database Schema & Migrations
│   ├── schema.prisma                # Schema definition (5 models)
│   └── 📂 migrations/               # Database changes history
│
├── 📂 data/                         # Static Data
│   ├── faqs.js
│   ├── features.js
│   ├── industries.js
│   └── testimonial.js
│
├── 📂 public/                       # Static Files (Images, Icons)
│   └── ...images and assets
│
├── middleware.js                    # Route protection (Clerk Auth)
├── package.json                     # Dependencies
├── next.config.mjs                  # Next.js config
├── tailwind.config.mjs              # Tailwind CSS config
├── postcss.config.mjs               # PostCSS config
└── .env                             # Environment variables
```

---

## 🛠️ **Technology Stack**

### **Frontend:**

- **Next.js 15.1.4** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **shadcn/ui** - Pre-built UI components
- **Lucide Icons** - Beautiful icons
- **date-fns** - Date formatting
- **recharts** - Charts & graphs
- **Sonner** - Toast notifications

### **Backend:**

- **Next.js Server Actions** - Backend logic (no API routes needed)
- **Clerk** - Authentication & user management
- **Google Generative AI (Gemini)** - AI model for analysis & quiz generation

### **Database:**

- **PostgreSQL** - Primary database
- **Prisma ORM** - Database abstraction layer

### **Other Tools:**

- **Inngest** - Async job queue
- **pdf-parse** - PDF text extraction

---

## 🔄 **Complete Data Flow**

### **Flow 1: User Signup & Onboarding**

```
┌─────────────────────────────────────────────────────────────┐
│ USER SIGNUP & ONBOARDING FLOW                               │
└─────────────────────────────────────────────────────────────┘

1. User arrives at home page
   ↓
2. Clicks "Sign Up" → Clerk handles authentication
   ↓
3. User creates account with Clerk (managed by Clerk UI)
   ↓
4. After signin, automatically redirected to /onboarding
   ↓
5. User selects Industry (e.g., "Software Development")
   ↓
6. FRONTEND calls: updateUser() server action
   │
   └─→ BACKEND (Server Action):
       ├─ Extract userId from Clerk token
       ├─ Find/Create User in DB with Prisma
       ├─ Check if IndustryInsight exists for this industry
       │  └─ If NOT exists → Call generateAIInsights()
       │     └─ Call Gemini API to get salary, skills, trends
       │     └─ Save results in IndustryInsight model
       ├─ Update User model with industry, skills, experience
       └─ Return updated user data
   ↓
7. Data saved to PostgreSQL Database
   ↓
8. revalidatePath("/") → Next.js cache updated
   ↓
9. Redirected to /dashboard
```

### **Detailed: Gemini API Call (generateAIInsights)**

```javascript
// Step 1: Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// Step 2: Create Prompt
const prompt = `
  Analyze the current state of the Software Development industry...
  Return JSON: { salaryRanges, growthRate, topSkills, keyTrends... }
`;

// Step 3: Call Gemini API
const result = await model.generateContent(prompt);
const text = result.response.text();

// Step 4: Parse JSON Response
const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
const insights = JSON.parse(cleanedText);

// Step 5: Save to Database
await db.industryInsight.create({
  data: {
    industry: "Software Development",
    salaryRanges: insights.salaryRanges,
    topSkills: insights.topSkills,
    keyTrends: insights.keyTrends,
    // ... more fields
  }
});
```

---

### **Flow 2: Resume Analysis (AI + Deterministic)**

```
┌─────────────────────────────────────────────────────────────┐
│ RESUME ANALYSIS FLOW                                        │
└─────────────────────────────────────────────────────────────┘

User on /resume page
  ↓
1. First, user SAVES resume content
   └─ Frontend calls: saveResume(content) server action
      └─ BACKEND: 
         ├─ Auth check (Clerk)
         ├─ Find user in DB
         ├─ UPSERT Resume model (update existing or create new)
         ├─ Save content to PostgreSQL
         └─ revalidatePath("/resume", "/resume-analysis")
   ↓
2. User navigates to /resume-analysis
   ↓
3. User clicks "Run AI Analysis" OR "Run Our Algorithm"
   ↓

┌──────────────────────────────────── AI PATH ─────────────────────────────────────┐
│                                                                                  │
│ Frontend calls: analyzeResume()                                                  │
│                                                                                  │
│ BACKEND (Server Action):                                                         │
│  1. Auth check                                                                   │
│  2. Fetch user & resume content from DB                                          │
│  3. Fetch industryInsight (if exists)                                            │
│  4. Build Gemini Prompt including:                                               │
│     ├─ Resume content                                                            │
│     ├─ User industry & skills                                                    │
│     └─ Market skills from IndustryInsight                                        │
│  5. Call Gemini API → Get JSON with:                                             │
│     ├─ ATS Score (0-100)                                                         │
│     ├─ Resume diagnostic (readability, impact, keyword alignment)                │
│     ├─ Skill gaps (missing critical skills)                                      │
│     └─ Learning priorities                                                       │
│  6. Normalize response → Ensure consistent schema                                │
│  7. Save to Resume.feedback (JSON field)                                         │
│  8. Build history envelope (keep max 10 runs)                                    │
│  9. Return { latest, history }                                                   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
        ↓
        
┌──────────────────────── DETERMINISTIC PATH ──────────────────────┐
│  Frontend calls: analyzeResumeDeterministic()                     │
│                                                                   │
│  BACKEND (Rules-based analysis - NO Gemini call):                │
│   1. Auth check                                                   │
│   2. Fetch resume from DB                                         │
│   3. Analyze using RULES (no AI):                                 │
│       ├─ Count bullet points (ATS readability)                    │
│       ├─ Count action verbs (impact score)                        │
│       ├─ Extract numbers/metrics                                  │
│       ├─ Check section headings (structure)                       │
│       ├─ Calculate keyword overlap with market skills             │
│       └─ Generate scores programmatically                         │
│   4. Create deterministic feedback                                │
│   5. Save same format as AI (for UI consistency)                  │
│   6. Return { latest, history }                                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
        ↓
   Frontend updates UI with analysis
         ↓
   Dashboard /resume-analysis page shows:
   - 3 KPI cards (ATS Score, Alignment, Gaps)
   - 4 diagnostic bars (readability, impact, keywords, structure)
   - Strengths & risks
   - Missing keywords
   - Learning priorities
   - History timeline
```

### **Flow 3: Interview Quiz Generation**

```
┌─────────────────────────────────────────────────────────────┐
│ INTERVIEW QUIZ GENERATION FLOW                              │
└─────────────────────────────────────────────────────────────┘

User on /interview page
  ↓
Sees 2 options:
  ├─ [Standard Quiz] → General industry questions
  └─ [Practice Weak Areas] → Questions on topics they got wrong
  ↓
User clicks "Start Standard Quiz"
  ↓
Frontend calls: generateQuiz({ mode: "standard" })
  ↓
BACKEND (Server Action):
  1. Auth check (extract userId from Clerk)
  2. Fetch user record (industry, skills)
  3. Build Prompt for Gemini:
     ```
     "Generate 10 technical interview questions for a 
     Software Development professional with skills in React, Node.js..."
     ```
  4. Call Gemini API
     └─ Response: JSON with 10 MCQs + explanations
  5. Parse & validate response
  6. Return { mode, title, questions: [...] }
  ↓
Frontend renders Quiz UI:
  ├─ Display question
  ├─ 4 option buttons
  ├─ Explanation after selected
  └─ Next/Previous navigation
  ↓
User selects answers & completes quiz
  ↓
Frontend calls: saveQuizResult(questions, answers, score, metadata)
  ↓
BACKEND:
  1. Calculate score: (correct/total) * 100
  2. Track which questions user got wrong
  3. Save Assessment record with:
     ├─ userId
     ├─ quizScore
     ├─ questions (with user answers)
     ├─ category ("Technical" or "Technical - Weak Areas")
     └─ timestamps
  4. Generate AI improvement tip using Gemini
  5. Save to PostgreSQL Assessment table
  ↓
Data saved to DB
  ↓
Dashboard shows updated stats

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next time user clicks "Practice Weak Areas":
  1. Fetch last 5 assessments from DB
  2. Filter questions where isCorrect = false
  3. Build special prompt:
     ```
     "User got these questions wrong:
     Q1: [question], Correct answer: [ans]
     Q2: [question], Correct answer: [ans]
     ...
     Generate 10 questions focusing on these weak areas"
     ```
  4. Call Gemini → Get targeted quiz
  5. Same flow as standard quiz
```

### **Flow 4: Hot Topics Study Section**

```
┌─────────────────────────────────────────────────────────────┐
│ HOT TOPICS DYNAMIC Q&A GENERATION                           │
└─────────────────────────────────────────────────────────────┘

User on /interview page
  ↓
Scrolls to "Study Hot Topics" section
  ↓
Sees 6 tabs: Gen AI, Next.js, React, JavaScript, OS, DBMS
  (Each has static Q&A by default)
  ↓
User selects:
  ├─ Topic: "React"
  ├─ Difficulty: "Hard"
  └─ Count: "8 Questions"
  ↓
Clicks "Generate Random Q&A" button
  ↓
Frontend calls: generateHotTopicQA({ topic, difficulty, count })
  ↓
BACKEND (Server Action):
  1. Validate inputs
  2. Build Gemini prompt:
     ```
     "Generate 8 HARD interview Q&A pairs for React.
     User context: industry=SoftwareDev, skills=React,Node.js
     Requirements:
     - Practical interview-focused
     - Concise but clear (3-6 line answers)
     - Technically accurate"
     ```
  3. Call Gemini API
  4. Parse response JSON
  5. Return { topic, difficulty, count, qa: [{q, ans}, ...] }
  ↓
Frontend:
  ├─ Shows dynamic Q&A in accordion (above static)
  ├─ Each Q&A expandable
  └─ Can regenerate anytime
  ↓
Static Q&A remains as fallback below
```

---

## 📊 **Core Features Explained in Detail**

### **1. Resume Analysis (Dual Mode)**

#### **AI Mode:**

```javascript
// File: actions/resume.js → analyzeResume()

// Gemini analyze karega:
{
  "resumeAnalysis": {
    "score": 78,                    // ATS readiness (0-100)
    "overallVerdict": "Strong resume with...",
    "sectionScores": {
      "atsReadability": 85,         // Formatting
      "impact": 72,                 // Quantified achievements
      "keywordAlignment": 88,       // Relevant skills
      "structure": 65,              // Sections present
    },
    "strengths": ["Uses metrics", "Clear formatting"],
    "risks": ["Missing summary", "Generic achievements"],
    "keywordGaps": ["Docker", "Kubernetes"],
    "recommendedRoles": ["Junior Developer", "Frontend Dev"]
  },
  "skillGapAnalysis": {
    "alignmentScore": 75,
    "currentSkills": ["React", "Node.js", "JavaScript"],
    "missingCriticalSkills": ["Docker", "GraphQL", "TypeScript"],
    "learningPriorities": [
      { skill: "GraphQL", reason: "High market demand", effort: "Medium" }
    ],
    "nextSteps": ["Add GraphQL project to resume", "Learn Docker basics"]
  }
}
```

#### **Deterministic Mode (Our Algorithm):**

```javascript
// File: actions/resume.js → analyzeResumeDeterministic()

// Rule-based scoring (NO AI):

// ATS Readability Score = Calculation
//   ├─ Base: 40
//   ├─ Bullet points: >= 6? +20
//   ├─ Line length: 6-20 words? +20
//   └─ Headings found: 4 × count
// Result: 0-100

// Impact Score = Calculation
//   ├─ Base: 30
//   ├─ Numbers found × 4
//   ├─ Action verbs × 3
//   └─ "result"/"impact" keyword? +10
// Result: 0-100

// Keyword Alignment = Formula
//   = (currentSkills / marketSkills) × 100
//   Example: 5 current / 10 market = 50%

// Structure Score = Calculation
//   ├─ Has required sections × 10
//   ├─ Total lines > 20? +15
//   └─ Maximum: 100
```

---

### **2. Interview Quiz System**

#### **MCQ Structure:**

```javascript
{
  "questions": [
    {
      "question": "What is the primary purpose of React hooks?",
      "options": [
        "To add state to functional components",
        "To replace classes entirely",
        "To manage global state only",
        "To improve CSS performance"
      ],
      "correctAnswer": "To add state to functional components",
      "explanation": "Hooks allow functional components to use state..."
    }
  ]
}
```

#### **Weak Areas Detection:**

```
Last 5 Quizzes → Extract wrong answers
├─ Q: "What is useState?"
├─ User answered: "B" (wrong)
│ Correct: "A"
│
Next Quiz Prompt:
"User got 'useState' question wrong.
Generate questions focusing on React hooks basics..."
```

---

### **3. Database Relationships**

```
┌─────────────────┐
│     USER        │
├─────────────────┤
│ id (PK)         │
│ clerkUserId     │ (Unique - from Clerk)
│ email           │
│ name            │
│ industry        │ (FK → IndustryInsight)
│ experience      │
│ skills []       │ (Array of strings)
└─────────────────┘
         │
         ├─→ ONE Resume
         │   ├─ content (markdown)
         │   ├─ atsScore
         │   └─ feedback (JSON array of analyses)
         │
         ├─→ MANY Assessments (Quizzes)
         │   ├─ quizScore
         │   ├─ questions (with answers)
         │   ├─ category ("Technical" / "Weak Areas")
         │   └─ timestamps
         │
         ├─→ MANY CoverLetters
         │   ├─ content
         │   ├─ companyName
         │   ├─ jobTitle
         │   └─ status
         │
         └─→ ONE IndustryInsight
             ├─ salaryRanges
             ├─ topSkills
             ├─ keyTrends
             └─ marketOutlook

```

---

## 🔌 **API Integration & Authentication Flow**

### **Clerk Authentication:**

```
Browser
  ↓
Clerk SignIn Widget
  ↓
User enters email/password
  ↓
Clerk validates & creates session
  ↓
Clerk Auth Token stored in cookies
  ↓
Next.js Middleware intercepts all requests
  ↓
For protected routes (/dashboard, /resume-analysis):
  ├─ Extract token from cookies
  ├─ Validate token with Clerk
  ├─ If valid → Continue
  └─ If invalid → Redirect to /sign-in
  ↓
Server Action runs:
  ├─ const { userId } = await auth()
  │   (Extract userId from Clerk token)
  ├─ Find User in DB with this clerkUserId
  └─ Proceed with operation
```

### **Gemini API Integration:**

**Initialize:**

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
```

**API Call:**

```javascript
const result = await model.generateContent(prompt);
const text = result.response.text();
const jsonData = JSON.parse(text.replace(/```json\n?/g, "").trim());
```

**Error Handling:**

```javascript
try {
  const result = await model.generateContent(prompt);
  return result.response.text();
} catch (error) {
  if (error.code === 429) {
    // Rate limited
    throw new Error("Too many requests. Try again later");
  }
  throw new Error("Failed to generate content");
}
```

---

## 💾 **Database Schema**

### **User Model:**

```prisma
model User {
  id            String      @id @default(uuid())
  clerkUserId   String      @unique        // From Clerk signin
  email         String      @unique
  name          String?
  industry      String?
  experience    Int?        // Years
  skills        String[]    // ["React", "Node.js", "TypeScript"]
  bio           String?
  
  // Relations
  assessments   Assessment[]
  resume        Resume?
  coverLetters  CoverLetter[]
  industryInsight IndustryInsight? @relation(fields: [industry], references: [industry])
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

### **Resume Model:**

```prisma
model Resume {
  id        String    @id @default(cuid())
  userId    String    @unique
  user      User      @relation(fields: [userId], references: [id])
  
  content   String    @db.Text            // Markdown content
  atsScore  Float?                        // 0-100 score
  feedback  String?   @db.Text            // JSON array of analyses
  
  // feedback structure:
  // {
  //   "latest": { resumeAnalysis, skillGapAnalysis, generatedAt, algorithm },
  //   "history": [ ... max 10 runs ]
  // }
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

### **Assessment Model:**

```prisma
model Assessment {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  
  quizScore     Float          // Percentage
  questions     Json[]         // Array of {q, opts, correct, userAns, isCorrect}
  category      String         // "Technical" | "Technical - Weak Areas"
  improvementTip String?       // AI-generated advice
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([userId])
}
```

---

## 🔄 **Frontend-Backend Communication Explained**

### **Architecture Diagram:**

```
┌──────────────────────────────────────────────────────────────────┐
│                         BROWSER (FRONTEND)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  React Component (Client-side)                                    │
│  ├─ useState, useEffect                                           │
│  └─ useFetch custom hook                                          │
│       │                                                            │
│       ├─ Calls: const { data, loading, fn } = useFetch(actionFn) │
│       │                                                            │
│       └─ On button click:                                         │
│          await fn(params) → Makes async call                      │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
              │
              │ (Network Request)
              │ (Encrypted with Clerk token)
              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (BACKEND)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Server Action (marked with "use server")                         │
│  ├─ Receives parameters from client                               │
│  ├─ Auth check: const { userId } = await auth()                  │
│  ├─ Access Prisma DB: await db.model.query(...)                  │
│  ├─ Call Gemini API if needed                                     │
│  ├─ Validate & process data                                       │
│  ├─ Return JSON response                                          │
│  └─ Optionally: revalidatePath() → Update Next.js cache          │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
              │
              │ (Return JSON)
              │
              ↓
┌──────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL DATABASE                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Prisma ORM translates queries                                    │
│  ├─ await db.user.findUnique(...)                                 │
│  ├─ await db.resume.update(...)                                   │
│  └─ await db.assessment.create(...)                               │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### **Example: Resume Analysis Flow**

```javascript
// ===== FRONTEND (React Component) =====
// File: app/(main)/resume-analysis/_components/resume-insights.jsx

import useFetch from "@/hooks/use-fetch";
import { analyzeResume } from "@/actions/resume";

export default function ResumeInsights() {
  // Custom hook - manages loading, error, data
  const { data, loading, error, fn: analyzeResumeFn } = useFetch(analyzeResume);
  
  const handleAnalyze = async () => {
    // Call server action
    await analyzeResumeFn();
    // analyzeResumeFn internally calls analyzeResume()
  };
  
  return (
    <button onClick={handleAnalyze} disabled={loading}>
      {loading ? "Analyzing..." : "Run AI Analysis"}
    </button>
  );
}

// ===== BACKEND (Server Action) =====
// File: actions/resume.js

"use server";

export async function analyzeResume() {
  // Step 1: Authenticate
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  // Step 2: Get data from DB
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true, industryInsight: true }
  });
  
  // Step 3: Build prompt for Gemini
  const prompt = `Analyze resume...`;
  
  // Step 4: Call Gemini API
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent(prompt);
  const analysis = JSON.parse(result.response.text());
  
  // Step 5: Save to Database
  await db.resume.update({
    where: { userId: user.id },
    data: {
      atsScore: analysis.score,
      feedback: JSON.stringify({ latest: analysis, history: [...] })
    }
  });
  
  // Step 6: Return to frontend
  return {
    latest: analysis,
    history: [...]
  };
}

// ===== EXECUTION FLOW =====
/*
1. User clicks button
2. Frontend calls analyzeResumeFn()
3. analyzeResumeFn sends request to "analyzeResume" server action
4. Server receives request with userId (from Clerk token)
5. Server queries PostgreSQL via Prisma
6. Server calls Gemini API
7. Gemini returns analysis
8. Server saves to DB
9. Server returns JSON to frontend
10. Frontend receives data in "data" state
11. React re-renders with new data
12. UI shows analysis results
*/
```

---

## 🚀 **How Data Flows Through the System**

### **Complete Journey:**

```
USER SIGNUP
     ↓
Clerk Authentication
     ↓
User Record Created (clerkUserId stored)
     ↓
User completes Onboarding
     ↓
Industry selected → Gemini generates insights → Saved in DB
     ↓
User saves Resume
     ↓
Resume content → PostgreSQL
     ↓
User clicks "Run AI Analysis"
     ↓
Resume text → Gemini API prompt
     ↓
Gemini analyzes against market insights
     ↓
JSON response → Normalized → Saved in Resume.feedback
     ↓
Frontend shows analysis results
     ↓
User takes Interview Quiz
     ↓
Quiz questions → Stored in Assessment model
     ↓
User answers saved → Score calculated
     ↓
Wrong answers → Weak areas identified → For next quiz seeds
     ↓
Dashboard shows all stats aggregated
```

---

## 🎯 **Real-World Example**

### **Scenario: Vipul Career Development**

```
Vipul, a new graduate:

1️⃣ Signs up
   → Clerk creates account
   → DB User record created (clerkUserId: "user_xyz")

2️⃣ Onboarding - Selects "Software Development"
   → updateUser() called
   → Gemini API hit (no previous IndustryInsight exists)
   → Response: 
     {
       salaryRanges: [
         { role: "Junior Dev", min: 4L, max: 8L },
         { role: "Senior Dev", min: 12L, max: 25L }
       ],
       topSkills: ["React", "Node.js", "TypeScript", "Docker"],
       keyTrends: ["Microservices", "AI/ML"], 
       marketOutlook: "Positive"
     }
   → Saved in IndustryInsight table
   → User can now see dashboard with salary info

3️⃣ Uploads Resume PDF
   → extractResumeTextFromPdf() server action
   → pdf-parse library converts PDF → text
   → Cleaned & normalized
   → Saved in Resume.content field

4️⃣ Clicks "Run AI Analysis"
   → analyzeResume() called
   → Gemini receives:
     - Resume content
     - Market skills (from IndustryInsight)
     - His current skills
   → Gemini analyzes & returns:
     {
       resumeAnalysis: {
         score: 62,          // Low - needs work
         keywordGaps: ["Docker", "TypeScript"]
       },
       skillGapAnalysis: {
         missingCriticalSkills: ["Docker", "AWS"]
       }
     }
   → Saved with analysis history

5️⃣ Takes Standard Quiz
   → generateQuiz({ mode: "standard" }) called
   → Gemini generates 10 MCQs for Software Development
   → Vipul answers all questions
   → saveQuizResult() saves responses
   → Score 65% calculated
   → Questions he got wrong flagged

6️⃣ Practices Weak Areas
   → generateQuiz({ mode: "weak-areas" }) called
   → Gemini sees his wrong answers (Docker, Async concepts)
   → Generates 10 focused questions on these topics
   → Practice round = 80% score
   → Shows progress on dashboard

7️⃣ Studies Hot Topics
   → Clicks "Generate Random Q&A" for Docker (Hard)
   → generateHotTopicQA({ topic: "docker", difficulty: "hard", count: 8 })
   → Gemini generates 8 hard Docker Q&A pairs
   → Displayed in accordion
   → Can regenerate anytime

Result: Vipul's dashboard shows:
├─ Resume ATS: 62% → Must improve
├─ Latest Quiz: 65% → Average
├─ Weak Areas Practice: 80% → Improving!
├─ Market Demand: Docker + TypeScript needed
└─ Next Steps: Build Docker project
```

---

## 🔐 **Authentication & Security Flow**

```
┌─────────────────────────────────────────────────────┐
│ CLERK AUTHENTICATION FLOW                           │
└─────────────────────────────────────────────────────┘

1. Public routes (/home, /sign-in, /sign-up)
   ├─ No auth required
   └─ Available to everyone

2. Protected routes (/dashboard, /resume-analysis, etc.)
   ├─ Middleware checks Clerk token
   ├─ If token missing/expired → Redirect to /sign-in
   └─ If token valid → Continue to page

3. Server Actions
   ├─ All server actions start with "use server"
   ├─ const { userId } = await auth()
   ├─ userId comes from Clerk token
   ├─ If userId fails → Error thrown
   └─ Request blocked if unauthorized

4. Token Flow
   Browser (Cookies)
     ↓
   Middleware intercepts
     ↓
   Validates with Clerk
     ↓
   Extracts userId
     ↓
   Server action uses userId
     ↓
   DB query filtered by userId
     ↓
   Data isolation (user can only see own data)
```

---

## 📝 **Key Takeaways for Interview**

### **This project demonstrates:**

1. **Full-stack Next.js** - Frontend + Backend in one codebase
2. **Server Actions** - Modern approach to backend logic without separate API routes
3. **Database Design** - Prisma ORM with relational models
4. **AI Integration** - Gemini API for smart analysis & generation
5. **Authentication** - Clerk for secure user management
6. **Real-time Updates** - React hooks & data fetching patterns
7. **Data Validation** - Both frontend & backend validation
8. **Performance** - Next.js caching with revalidatePath
9. **Error Handling** - Try-catch blocks, user feedback with Sonner toast
10. **Responsive UI** - Tailwind CSS + shadcn/ui components

---

## 💡 **Common Interview Questions**

### **Q: How do you secure user data?**

**A:**

- Clerk handles authentication - password never exposed
- Every server action verifies userId from token
- Database queries filtered by userId - no SQL injection possible
- SQL parameterized through Prisma ORM

### **Q: How does data flow from Frontend to Database?**

**A:**

```
React Component → useFetch Hook → Server Action → Prisma ORM → PostgreSQL
←──────── JSON Response ───────────────────←─────────────────←─────
```

### **Q: How do you call the Gemini API?**

**A:**

- Initialize: `new GoogleGenerativeAI(API_KEY)`
- Create prompt string with instructions
- Call: `model.generateContent(prompt)`
- Parse JSON response
- Handle errors with try-catch

### **Q: What's the difference between AI and Deterministic analysis?**

**A:**

- **AI**: Calls Gemini API - expensive, flexible, contextual
- **Deterministic**: Rules-based calculation - fast, cheap, predictable

---

## 🎓 **Resume Bullet Points for Interview**

```
✓ Built AI Career Coach platform using Next.js 15, React 19
✓ Integrated Google Gemini API for resume analysis & quiz generation
✓ Implemented dual-mode resume analyzer (AI + deterministic algorithms)
✓ Designed PostgreSQL schema with Prisma ORM for 5 core models
✓ Built server-side user authentication & authorization with Clerk
✓ Engineered reusable useFetch custom hook for async data management
✓ Implemented PDF parsing with pdf-parse for resume text extraction
✓ Deployed dashboard with real-time industry insights generation
✓ Created interview prep system with weak-area detection algorithms
✓ Built hot-topics study section with dynamic AI-generated Q&A

Tech Stack: Next.js | React | PostgreSQL | Prisma | Gemini API | Clerk | 
Tailwind CSS | shadcn/ui | Inngest | Node.js
```

---

**Congrats! You now have a complete understanding of your AI Career Coach project! 🎉**
