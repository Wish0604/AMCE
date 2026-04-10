# AMCE Quickstart

Get the AMCE Analyzer running locally (backend + frontend).

---

## Prerequisites

- **Node.js** 16+ (recommended: latest LTS)
- **npm** (or yarn/pnpm)
- **Git**
- **Google Gemini API key** — get one from <https://ai.google.dev/>

---

## 1. Clone the Repository

```bash
git clone https://github.com/Wish0604/AMCE.git
cd AMCE
```

---

## 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=5000
```

Start the backend:

```bash
npm start
```

The backend will be available at `http://localhost:5000` (auto-discovers ports 5001-5005 if 5000 is busy; check terminal output for the actual port).

---

## 3. Frontend Setup (new terminal)

```bash
cd frontend
npm install
npm run dev
```

The frontend typically runs at `http://localhost:5173`.

---

## 4. Using the App

1. Open the frontend URL in your browser.
2. Enter a **question** and a **student answer** using one of:
   - **Text**: type directly into the field.
   - **Voice**: click the microphone button (allow microphone access when prompted); supports English, Hindi, and Marathi.
   - **Image**: upload a file — OCR extracts the text (may be simulated depending on implementation).
3. Click **Analyze**.
4. Review the result:
   - misconception type (Conceptual, Procedural, Overgeneralization, Partial)
   - explanation and confidence score
5. Optionally start the **3-question challenge** to reinforce learning.

---

## Testing Voice Input

- Use a Chromium-based browser (Chrome/Edge) for best Web Speech API support.
- Ensure microphone permissions are enabled for the site.

Common issues:

| Error | Cause | Fix |
|-------|-------|-----|
| `not-allowed` | Microphone permission denied | Enable in browser site settings and reload |
| Voice not supported | Browser lacks Web Speech API | Switch to Chrome or Edge |

---

## Troubleshooting

### Frontend can't reach backend

- Confirm the backend is running and check the port printed in the backend terminal.
- If the frontend uses `VITE_API_URL`, set it to the correct backend address (then restart `npm run dev`):

  ```env
  VITE_API_URL=http://localhost:5000/api
  ```

### Gemini API errors (403 / quota / invalid key)

- Verify `GEMINI_API_KEY` in `backend/.env`.
- Confirm the Gemini API is enabled for your key/project.
- Check quota and limits in your [Google Cloud / AI console](https://console.cloud.google.com/).
- Without a valid key the system falls back to pattern-based rules.

### Backend won't start

Check whether another process is using port 5000:

```bash
# macOS / Linux
lsof -i :5000

# Windows
netstat -ano | findstr :5000
```

Terminate the conflicting process or set a different `PORT` in `backend/.env`.

---

## Production Build (Frontend)

```bash
cd frontend
npm run build
```

This produces an optimised bundle in `frontend/dist/`.

---

## Helpful Links

- Full project overview: [README.md](README.md)
- Gemini docs: <https://ai.google.dev/>
- Web Speech API: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API>
