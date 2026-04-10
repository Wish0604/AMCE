const axios = require("axios");

const FALLBACKS = {
  Conceptual: (question) =>
    `Think about the same idea in a new context: what principle explains "${question}"?`,
  Procedural: (question) =>
    `Solve this using the correct steps: how would you approach "${question}" step by step?`,
  Overgeneralization: (question) =>
    `What is one exception or boundary case related to "${question}"?`,
  Partial: (question) =>
    `What important detail is still missing in your answer to "${question}"?`,
  Correct: (question) =>
    `Great work. Can you solve a slightly harder version of "${question}"?`
};

const extractInnerQuotedQuestion = (text) => {
  if (!text || typeof text !== "string") return "";

  const quoted = text.match(/"([^"]{8,})"/);
  return quoted?.[1]?.trim() || "";
};

const unwrapQuestionSeed = (question) => {
  let current = (question || "").trim();
  if (!current) return "";

  // Unwrap known fallback template wrappers to avoid recursive nesting.
  const wrapperPatterns = [
    /^think about the same idea in a new context:\s*what principle explains\s*"[^"]+"\??$/i,
    /^solve this using the correct steps:\s*how would you approach\s*"[^"]+"\s*step by step\??$/i,
    /^what is one exception or boundary case related to\s*"[^"]+"\??$/i,
    /^what important detail is still missing in your answer to\s*"[^"]+"\??$/i,
    /^great work\.\s*can you solve a slightly harder version of\s*"[^"]+"\??$/i
  ];

  // At most 3 levels to avoid pathological loops.
  for (let i = 0; i < 3; i += 1) {
    const looksWrapped = wrapperPatterns.some((pattern) => pattern.test(current));
    if (!looksWrapped) break;

    const inner = extractInnerQuotedQuestion(current);
    if (!inner || inner === current) break;
    current = inner;
  }

  // Normalize trailing punctuation noise.
  current = current.replace(/[?]+$/g, "?").trim();
  return current;
};

const getFallback = (question, misconceptionType) => {
  const cleanSeed = unwrapQuestionSeed(question);
  const template = FALLBACKS[misconceptionType] || FALLBACKS.Conceptual;
  return template(cleanSeed || question);
};

const normalizeQuestion = (text) => {
  if (!text || typeof text !== "string") return "";

  let normalized = text
    .replace(/[\r\n]+/g, " ")
    .replace(/^[-*\d.)\s]+/, "")
    .replace(/^['"`]+|['"`]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";

  // Strip common model preambles.
  normalized = normalized
    .replace(/^follow[- ]?up question:\s*/i, "")
    .replace(/^question:\s*/i, "")
    .trim();

  // Ensure output is a complete question.
  if (!/[?]$/.test(normalized) && normalized.length > 12) {
    normalized = `${normalized}?`;
  }

  return normalized;
};

const extractQuestionFromRaw = (raw) => {
  if (!raw || typeof raw !== "string") return "";

  // Try direct JSON parse first.
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.question === "string") {
      return parsed.question;
    }
  } catch {
    // Continue to regex extraction.
  }

  // Support model wrappers like: "Here is the JSON... {\"question\":\"...\"}"
  const inlineJsonMatch = raw.match(/\{[\s\S]*?"question"\s*:\s*"([\s\S]*?)"[\s\S]*?\}/i);
  if (inlineJsonMatch?.[1]) {
    return inlineJsonMatch[1].replace(/\\"/g, '"');
  }

  // Support plain-text fallback key/value output.
  const kvMatch = raw.match(/question\s*:\s*(.+)$/im);
  if (kvMatch?.[1]) {
    return kvMatch[1].trim();
  }

  return raw;
};

const isUsableQuestion = (text) => {
  if (!text) return false;

  // Too short often indicates truncated model output.
  if (text.length < 20) return false;

  const words = text.replace(/[?]/g, "").trim().split(/\s+/).filter(Boolean);
  if (words.length < 12 || words.length > 35) return false;

  // Must look like a question after normalization.
  if (!text.includes("?")) return false;

  // Prefer clear interrogative forms.
  if (!/^(what|why|how|which|when|where|if|can|could|would|should|do|does|is|are)\b/i.test(text)) {
    return false;
  }

  // Reject generic wrapper/meta responses from the model.
  const bannedPatterns = [
    /^here is the json requested\??$/i,
    /^here is the question\??$/i,
    /^json output\??$/i,
    /^question\??$/i
  ];

  if (bannedPatterns.some((pattern) => pattern.test(text))) {
    return false;
  }

  return true;
};

const generateWithGemini = async (model, prompt) => {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 80,
        responseMimeType: "text/plain"
      }
    },
    { timeout: 7000 }
  );

  const raw = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const question = extractQuestionFromRaw(raw);
  return normalizeQuestion(question);
};

module.exports = async (question, misconceptionType) => {
  const seedQuestion = unwrapQuestionSeed(question);

  // If no Gemini API key, return a simple template
  if (!process.env.GEMINI_API_KEY) {
    return getFallback(seedQuestion, misconceptionType);
  }

  const modelCandidates = [
    process.env.GEMINI_FOLLOWUP_MODEL,
    process.env.GEMINI_MODEL,
    "gemini-1.5-flash",
    "gemini-2.0-flash"
  ].filter(Boolean);
  
  const contextPrompts = {
    "Conceptual": "Create a question that tests understanding of the SAME core concept but with different wording or context.",
    "Procedural": "Create a question that tests the SAME procedure/steps but with a different scenario.",
    "Overgeneralization": "Create a counter-example question that shows the exceptions to the rule being overgeneralized.",
    "Partial": "Create a follow-up question that asks for the MISSING details or next steps."
  };

  const contextHint = contextPrompts[misconceptionType] || contextPrompts["Conceptual"];

  const prompt = `You are an expert educator.

Original Question: ${seedQuestion || question}

${contextHint}

Generate ONE short, clear follow-up question that helps the student understand and apply the corrected concept.
Rules:
- Exactly one complete question sentence.
- 12 to 30 words.
- No heading, no numbering, no extra explanation.

Return ONLY the question sentence ending with '?'.`;

  try {
    // Try candidate models in order; each model gets an initial and one retry attempt.
    for (const model of modelCandidates) {
      const firstAttempt = await generateWithGemini(model, prompt);
      if (isUsableQuestion(firstAttempt)) {
        return firstAttempt;
      }

      const retryPrompt = `${prompt}\n\nThe previous output was incomplete. Return one complete question ending with '?'.`;
      const secondAttempt = await generateWithGemini(model, retryPrompt);
      if (isUsableQuestion(secondAttempt)) {
        return secondAttempt;
      }
    }

    return getFallback(seedQuestion || question, misconceptionType);
  } catch (err) {
    console.error("Reinforcement Service Error:", err.message);
    return getFallback(seedQuestion || question, misconceptionType);
  }
};

