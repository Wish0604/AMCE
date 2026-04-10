const axios = require("axios");

// Map language codes to language names for Gemini
const languageNames = {
  "en-US": "English",
  "es-ES": "Spanish",
  "fr-FR": "French",
  "de-DE": "German",
  "zh-CN": "Chinese",
  "hi-IN": "Hindi"
};

module.exports = async (question, answer, ruleHints, language = "en-US") => {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const languageName = languageNames[language] || "English";
  
  const prompt = `
You are an expert teacher evaluating student responses. The student's answer is in ${languageName}.

Question: ${question}
Student Answer: ${answer}

Tasks:
1. Is the answer correct? (true/false)
2. If has misconception, classify type (Conceptual, Procedural, Overgeneralization, Partial)
3. Explain what went wrong, or confirm if correct

Return ONLY valid JSON in this exact shape:
{"isCorrect":true|false,"type":"Conceptual|Procedural|Overgeneralization|Partial|Correct","explanation":"..."}
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      },
      { timeout: 10000 }
    );

    const raw =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    const validTypes = ["Conceptual", "Procedural", "Overgeneralization", "Partial", "Correct"];
    const type = validTypes.includes(parsed?.type) ? parsed.type : "Conceptual";
    const explanation = parsed?.explanation || raw || "No explanation returned by model.";
    const isCorrect = parsed?.isCorrect === true;

    return {
      type,
      explanation,
      isCorrect,
      confidence: isCorrect ? 0.95 : 0.75
    };
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.error?.message || err.message;
    console.error("Gemini API Error:", status, message);

    return {
      type: "Error",
      explanation: `LLM unavailable (${status || "network"}): ${message}`,
      isCorrect: false,
      confidence: 0
    };
  }
};

