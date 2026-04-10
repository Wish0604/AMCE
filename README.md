# ðŸ§  AMCE Analyzer 
**AI-Powered Misconception Detection System**

The AMCE Analyzer is an advanced educational ecosystem built to detect, classify, and instantly correct student misconceptions using multi-modal AI inputs. It combines intelligent **Clean Architecture** with an interactive learning reinforcement system, featuring **multi-language voice input**, AI-powered feedback, and interactive 3-question challenge quizzes.

---

## âš¡ Tech Stack

- **Frontend:** React 18, Vite 5.4, Tailwind CSS (Dark Mode UI with Micro-animations)
- **Backend:** Node.js, Express.js (Modular Service-Based Architecture)
- **AI Layer:** Google Gemini 2.5 Flash API (Structured JSON Inference)
- **Input Modalities:** 
  - Text input (typing)
  - Voice input (Web Speech API with 3-language support: English, Hindi, Marathi)
  - Image upload (OCR placeholder)

---

## ðŸ—ï¸ Architecture Pipeline

The system intelligently routes requests through modular services:

```mermaid
graph TD
    classDef input fill:#e0f2fe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a,rx:8px,ry:8px;
    classDef ailayer fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#581c87,rx:8px,ry:8px;
    classDef highlight fill:#fdf4ff,stroke:#c026d3,stroke-width:4px,color:#86198f,rx:8px,ry:8px;
    classDef output fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d,rx:8px,ry:8px;

    A["<b>User Input Layer</b><br/>Text / Voice / Image"]:::input --> B["<b>Input Processing</b><br/>Cleaning & Normalization"]:::input
    B --> C["<b>Rule-Based Detection</b><br/>Keyword/Pattern Analysis"]:::ailayer
    C --> D["<b>Decision Router</b><br/>Determines Complexity"]:::highlight
    D -->|Simple| E["<b>Simple Case</b><br/>Basic Logic<br/>(~50ms)"]:::ailayer
    D -->|Complex| F["<b>LLM Reasoning (Gemini)</b><br/>Deep Concept Logic<br/>(~3-5s)"]:::ailayer
    E --> H["<b>Misconception Classification</b>"]:::ailayer
    F --> H
    H --> I["<b>Adaptive Feedback Generator</b><br/>Tailored Explanations"]:::highlight
    I --> J["<b>Reinforcement Loop</b><br/>Follow-up Generation"]:::highlight
    J --> K["<b>Dashboard & Tracking</b><br/>Progress Monitoring"]:::output
```

---

## ðŸŽ¯ Features & Workflow

### ðŸŽ¤ **Multi-Modal Inputs**
- **Text Input**: Type questions and answers directly
- **Voice Input**: Speak in 3 languages (English, Hindi, Marathi); real-time transcription display
- **UI Language**: Change interface language to English, Hindi, or Marathi
- **Image Upload**: Upload document scans or diagrams (OCR-based text extraction)

### âš¡ **Intelligent Processing**
- Rule engine optimization: "Simple" statements trigger rapid pattern matching
- Dynamic routing based on complexity assessment
- Multi-model fallback for robustness

### ðŸ§  **AI Classification**
- Gemini classifies logical gaps into educational categories:
  - **Conceptual**: Misunderstands fundamental concept
  - **Procedural**: Wrong method or process
  - **Overgeneralization**: Applies rule too broadly
  - **Partial**: Incomplete understanding

### ðŸŽ¯ **Targeted Feedback**
- Context-specific explanations tailored to error type
- Confidence scoring for each analysis
- Processing method transparency (rule-based vs. AI)

### ðŸ” **Interactive Reinforcement**
- **3-Question Challenge Quiz**: AI-generated MCQ quiz targeting the detected misconception
- **Per-question feedback**: Real-time correctness verification
- **Progress tracking**: Quiz attempts, accuracy %, misconceptions improved

### ðŸ“Š **Dashboard & Analytics**
- Real-time progress metrics
- Weak area identification
- Attempt history with timestamps
- Separate quiz progress section
- Misconception improvement counter

---

## ðŸ“‚ Project Structure

```
AMCE/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ app.js (Express server)
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â””â”€â”€ analysisController.js (HTTP handlers, language parameter extraction)
â”‚   â”œâ”€â”€ routes/
â”‚   â”‚   â”œâ”€â”€ analysisRoutes.js (POST /api/analyze, /api/challenge/*)
â”‚   â”‚   â””â”€â”€ ocrRoutes.js
â”‚   â””â”€â”€ services/
â”‚       â”œâ”€â”€ decision/router.js (Complexity routing)
â”‚       â”œâ”€â”€ feedback/feedbackService.js (Personalize responses)
â”‚       â”œâ”€â”€ llm/geminiService.js (Gemini API integration, language-aware prompts)
â”‚       â”œâ”€â”€ preprocessing/
â”‚       â”‚   â”œâ”€â”€ ocrService.js
â”‚       â”‚   â””â”€â”€ textCleaner.js
â”‚       â”œâ”€â”€ quiz/quizService.js (3-question session management)
â”‚       â”œâ”€â”€ reinforcement/reinforcementService.js (Follow-up generation)
â”‚       â””â”€â”€ rules/ruleEngine.js (Pattern detection)
â”‚
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ vite.config.js
â”‚   â”œâ”€â”€ tailwind.config.js
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ main.jsx
â”‚   â”‚   â”œâ”€â”€ App.jsx (State mgmt, dual history)
â”‚   â”‚   â”œâ”€â”€ index.css (Tailwind imports)
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ Dashboard.jsx (Metrics, quiz progress section)
â”‚   â”‚   â”‚   â”œâ”€â”€ InputBox.jsx (Language selector, dual VoiceInput)
â”‚   â”‚   â”‚   â”œâ”€â”€ VoiceInput.jsx (Multi-language speech recognition)
â”‚   â”‚   â”‚   â””â”€â”€ UploadSection.jsx (Image upload)
â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â””â”€â”€ api.js (REST client with port discovery)
â”‚   â”‚   â””â”€â”€ utils/
â”‚   â”‚       â””â”€â”€ languages.js (Language codes, mappings)
â”‚   â””â”€â”€ dist/ (Production build)
â”‚
â””â”€â”€ README.md (This file)
```

---

## ðŸš€ Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Google Gemini API key (free tier available)

### Backend Setup
```bash
cd backend
npm install
echo GEMINI_API_KEY=your-api-key-here > .env
echo GEMINI_MODEL=gemini-2.5-flash >> .env
npm start
```
Backend runs on `http://localhost:5000` (or auto-discovers available port 5001-5005)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` (or next available)

---

## ðŸŽ® Usage Flow

1. **Select Voice Language**: Choose from 3 languages (English, Hindi, Marathi) for voice input
2. **Select UI Language** (Optional): Change interface language to English, हिन्दी, or मराठी

3. **Input Question**: Type or speak your question
3. **Input Answer**: Type, speak, or upload image with your answer
4. **Analyze**: Click "âš¡ Analyze" button
5. **Review Feedback**: See misconception type, explanation, and confidence score
6. **Try Challenge** (if incorrect): Start 3-question MCQ quiz to reinforce learning
7. **Track Progress**: View dashboard metrics in real-time

---

## ðŸ§ª Testing

### Test with Voice Input
1. Run both servers (backend on 5002, frontend on 5174)
2. Click "ðŸŽ¤ Speak (Answer)" button
3. Allow microphone permission when prompted
4. Speak your answer clearly
5. Watch real-time transcript appear
6. Click "âš¡ Analyze"

### Test Multi-Language
1. Change language dropdown (e.g., to Spanish ðŸ‡ªðŸ‡¸)
2. Click "ðŸŽ¤ Speak (Answer)"
3. Speak in Spanish
4. Backend receives language parameter and Gemini analyzes with language context

### Test Quiz Mode
1. Submit an incorrect answer
2. Click "â†’ Start 3-Question Challenge"
3. Answer 3 AI-generated MCQ questions
4. Track score and misconception improvement on dashboard

---

## ðŸ”§ Configuration

### Backend (.env)
```
GEMINI_API_KEY=your-api-key
GEMINI_MODEL=gemini-2.5-flash
PORT=5000
```

### Frontend (.env optional)
```
VITE_API_URL=http://localhost:5000/api
```

---

## ðŸ¤ Contributing

Contributions are welcome! Areas for enhancement:
- [ ] Quiz difficulty adaptive scaling
- [ ] Teacher dashboard for class monitoring
- [ ] Persistent quiz bank (currently session-based)
- [ ] Multi-language rule engine patterns
- [ ] Pronunciation feedback using Web Audio API
- [ ] Speech synthesis (read questions aloud)

---

## ðŸ“œ License

MIT License - See LICENSE file for details

---

## ðŸŽ“ Educational Impact

AMCE Analyzer helps students:
- **Identify** their specific misconceptions in real-time
- **Understand** why their answer was incorrect with AI-powered explanations
- **Reinforce** learning through interactive challenge quizzes
- **Track** progress and weakest concept areas
- **Learn** in their preferred language with voice input

Built for educators and learners worldwide. ðŸŒ

---

## ðŸš€ Getting Started

This repository contains both the **Frontend** and **Backend** code. You will need to run them concurrently in two separate terminal windows.

### 1. Backend Setup (Node.js)
The backend manages the pipeline, the router, and controls communication with Google Gemini.

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Setup Environment Variable
# You must provide your Gemini API key in a `.env` file located in the /backend folder
# Example: Create .env and add -> GEMINI_API_KEY=AIzaSy...

# Start the development server (runs on port 5000)
npm run dev
```

### 2. Frontend Setup (React/Vite)
The frontend uses Tailwind CSS for premium, fast, dark-mode styling.

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the frontend dev server
npm run dev
```

Finally, open your browser and go to `http://localhost:5173` to view the application!

---

## ðŸ—ï¸ Project Structure

The project has been configured following strict separation of concerns:

```text
amce-project/
â”‚
â”œâ”€â”€ frontend/                      
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/           # UI logic (InputBox, VoiceInput, Dashboard, UploadSection)
â”‚   â”‚   â”œâ”€â”€ services/             # Axios API link to Backend
â”‚   â”‚   â””â”€â”€ App.jsx
â”‚
â”œâ”€â”€ backend/                      
â”‚   â”œâ”€â”€ controllers/              # Core Orchestration (analysisController)
â”‚   â”œâ”€â”€ routes/                   # API Endpoints
â”‚   â”œâ”€â”€ services/                 # Business Logic modules
â”‚   â”‚   â”œâ”€â”€ preprocessing/        # Text Cleaners & OCR Mock
â”‚   â”‚   â”œâ”€â”€ rules/                # Fast Rule-Based Engine
â”‚   â”‚   â”œâ”€â”€ decision/             # Router
â”‚   â”‚   â”œâ”€â”€ llm/                  # Gemini AI Integration
â”‚   â”‚   â”œâ”€â”€ feedback/             # Feedback Generator
â”‚   â”‚   â””â”€â”€ reinforcement/        # Reinforcement Loop
â”‚   â”œâ”€â”€ .env                      # API Credentials file (DO NOT COMMIT)
â”‚   â””â”€â”€ app.js                    # Main Express Application
```

