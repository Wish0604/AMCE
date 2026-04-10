const axios = require("axios");
const crypto = require("crypto");

const QUIZ_LENGTH = 3;
const OPTION_IDS = ["A", "B", "C", "D"];

const sessions = new Map();

const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim();

const parseJsonSafe = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const shuffle = (arr) => {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

const sanitizeQuestion = (question) => {
  let value = normalizeText(question);
  value = value.replace(/^question:\s*/i, "");
  if (value && !value.endsWith("?")) {
    value = `${value}?`;
  }
  return value;
};

const sanitizeOptions = (options) => {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .slice(0, 4)
    .map((option, index) => ({
      id: OPTION_IDS[index],
      text: normalizeText(typeof option === "string" ? option : option?.text)
    }))
    .filter((option) => option.text.length > 0);
};

const validateQuizItem = (item) => {
  if (!item || typeof item !== "object") return false;
  if (!sanitizeQuestion(item.question)) return false;

  const options = sanitizeOptions(item.options);
  if (options.length !== 4) return false;

  const correct = String(item.correctOptionId || "").toUpperCase();
  if (!OPTION_IDS.includes(correct)) return false;

  return true;
};

const buildFallbackItem = (seedQuestion, misconceptionType, index) => {
  const stem = sanitizeQuestion(seedQuestion) || "What is the correct scientific explanation";
  const shared = {
    Conceptual: {
      question: `Which option best explains the core concept in this topic (${index + 1}/${QUIZ_LENGTH})?`,
      options: [
        { id: "A", text: `It happens because of random chance in: ${stem}` },
        { id: "B", text: `It follows the correct scientific principle related to: ${stem}` },
        { id: "C", text: `It only depends on size, not principle.` },
        { id: "D", text: `It happens because someone or something pushes it invisibly.` }
      ],
      correctOptionId: "B",
      explanation: "The best answer uses the core principle instead of vague or incorrect causes."
    },
    Procedural: {
      question: `Which approach uses the correct steps for this topic (${index + 1}/${QUIZ_LENGTH})?`,
      options: [
        { id: "A", text: "Skip the first step and estimate from memory." },
        { id: "B", text: "Follow the full sequence: identify, apply, and verify." },
        { id: "C", text: "Use only the final formula without checking assumptions." },
        { id: "D", text: "Choose whichever method gives the fastest number." }
      ],
      correctOptionId: "B",
      explanation: "Procedural correctness comes from applying all required steps in order."
    },
    Overgeneralization: {
      question: `Which option correctly avoids overgeneralizing (${index + 1}/${QUIZ_LENGTH})?`,
      options: [
        { id: "A", text: "The rule is always true in every situation." },
        { id: "B", text: "The rule works in some cases, but exceptions must be checked." },
        { id: "C", text: "The rule never works." },
        { id: "D", text: "The rule only depends on one visible feature." }
      ],
      correctOptionId: "B",
      explanation: "Strong reasoning checks boundaries and exceptions instead of using absolute claims."
    },
    Partial: {
      question: `Which response is complete for this topic (${index + 1}/${QUIZ_LENGTH})?`,
      options: [
        { id: "A", text: "A short statement with no details." },
        { id: "B", text: "A full explanation with principle, steps, and supporting detail." },
        { id: "C", text: "A keyword list only." },
        { id: "D", text: "An unrelated fact." }
      ],
      correctOptionId: "B",
      explanation: "A complete answer should include key idea and enough supporting detail."
    }
  };

  const selected = shared[misconceptionType] || shared.Conceptual;
  return {
    ...selected,
    source: "fallback"
  };
};

const buildPrompt = ({ seedQuestion, misconceptionType, misconceptionExplanation }) => `
You are an expert tutor.
Create exactly ${QUIZ_LENGTH} multiple-choice quiz questions to fix the student's misconception.

Topic seed question: ${seedQuestion}
Misconception type: ${misconceptionType}
Misconception explanation: ${misconceptionExplanation}

Rules:
- Each question must be specific to the topic.
- Each question must have exactly 4 options.
- Exactly one option must be correct.
- Avoid ambiguous options.
- Keep options concise.

Return ONLY valid JSON in this schema:
{
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctOptionId": "A|B|C|D",
      "explanation": "one short explanation why correct"
    }
  ]
}
`;

const generateQuizWithGemini = async ({ seedQuestion, misconceptionType, misconceptionExplanation }) => {
  const model = process.env.GEMINI_FOLLOWUP_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = buildPrompt({ seedQuestion, misconceptionType, misconceptionExplanation });

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 1200
      }
    },
    { timeout: 12000 }
  );

  const raw = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = parseJsonSafe(raw);
  const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];

  const validQuestions = questions
    .slice(0, QUIZ_LENGTH)
    .filter((item) => validateQuizItem(item))
    .map((item) => ({
      question: sanitizeQuestion(item.question),
      options: sanitizeOptions(item.options),
      correctOptionId: String(item.correctOptionId).toUpperCase(),
      explanation: normalizeText(item.explanation) || "This option best addresses the misconception.",
      source: "ai"
    }));

  return validQuestions;
};

const buildQuizQuestions = async ({ seedQuestion, misconceptionType, misconceptionExplanation }) => {
  if (!process.env.GEMINI_API_KEY) {
    return Array.from({ length: QUIZ_LENGTH }, (_, idx) =>
      buildFallbackItem(seedQuestion, misconceptionType, idx)
    );
  }

  try {
    const aiQuestions = await generateQuizWithGemini({
      seedQuestion,
      misconceptionType,
      misconceptionExplanation
    });

    if (aiQuestions.length === QUIZ_LENGTH) {
      return aiQuestions;
    }

    const fallbackNeeded = QUIZ_LENGTH - aiQuestions.length;
    const fallback = Array.from({ length: fallbackNeeded }, (_, idx) =>
      buildFallbackItem(seedQuestion, misconceptionType, aiQuestions.length + idx)
    );

    return [...aiQuestions, ...fallback];
  } catch (err) {
    console.error("Quiz generation error:", err.message);
    return Array.from({ length: QUIZ_LENGTH }, (_, idx) =>
      buildFallbackItem(seedQuestion, misconceptionType, idx)
    );
  }
};

const toPublicQuestion = (question, questionNumber, totalQuestions) => ({
  questionNumber,
  totalQuestions,
  question: question.question,
  options: shuffle(question.options)
});

const startSession = async ({ seedQuestion, misconceptionType, misconceptionExplanation }) => {
  const questions = await buildQuizQuestions({
    seedQuestion,
    misconceptionType,
    misconceptionExplanation
  });

  const sessionId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  sessions.set(sessionId, {
    sessionId,
    seedQuestion,
    misconceptionType,
    createdAt,
    currentIndex: 0,
    score: 0,
    questions
  });

  const firstQuestion = questions[0];

  return {
    sessionId,
    misconceptionType,
    createdAt,
    currentQuestion: toPublicQuestion(firstQuestion, 1, QUIZ_LENGTH)
  };
};

const submitAnswer = ({ sessionId, selectedOptionId }) => {
  const session = sessions.get(sessionId);

  if (!session) {
    return {
      success: false,
      error: "Challenge session not found. Please start challenge again."
    };
  }

  if (session.currentIndex >= session.questions.length) {
    return {
      success: false,
      error: "Challenge session already completed. Start a new challenge."
    };
  }

  const question = session.questions[session.currentIndex];
  const answerId = String(selectedOptionId || "").toUpperCase();
  const isCorrect = answerId === question.correctOptionId;

  if (isCorrect) {
    session.score += 1;
  }

  const correctOption = question.options.find((opt) => opt.id === question.correctOptionId);
  const currentQuestionNumber = session.currentIndex + 1;

  session.currentIndex += 1;

  const completed = session.currentIndex >= session.questions.length;

  const payload = {
    sessionId,
    misconceptionType: session.misconceptionType,
    questionNumber: currentQuestionNumber,
    totalQuestions: QUIZ_LENGTH,
    selectedOptionId: answerId,
    isCorrect,
    misconceptionImproved: isCorrect,
    explanation: question.explanation,
    correctOption: {
      id: question.correctOptionId,
      text: correctOption?.text || ""
    },
    score: session.score,
    completed
  };

  if (!completed) {
    const nextQuestion = session.questions[session.currentIndex];
    payload.nextQuestion = toPublicQuestion(nextQuestion, session.currentIndex + 1, QUIZ_LENGTH);
  } else {
    payload.summary = {
      score: session.score,
      totalQuestions: QUIZ_LENGTH,
      accuracy: Math.round((session.score / QUIZ_LENGTH) * 100)
    };
  }

  return {
    success: true,
    data: payload
  };
};

module.exports = {
  startSession,
  submitAnswer
};
